import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    // Fetch the order
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Security check: IDOR validation
    if (order.user_id !== userId) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 }); // Return 404 to hide existence
    }

    // Business rules: cancellation only allowed on confirmed/preparing
    const cancelableStatuses = ['confirmed', 'preparing', 'placed'];
    if (!cancelableStatuses.includes(order.order_status)) {
      return NextResponse.json({ 
        error: `Cannot cancel order in status '${order.order_status}'. It may have already been shipped or processed.` 
      }, { status: 400 });
    }

    // Perform cancel operation and release stock inside a transaction
    await db.transaction(async (tx: any) => {
      // 1. Return stock back to inventory
      const items = order.items as any[];
      for (const item of items) {
        const [pRecord] = await tx
          .select({ stock_quantity: schema.products.stock_quantity })
          .from(schema.products)
          .where(eq(schema.products.id, item.id));

        if (pRecord) {
          const currentStock = { ...pRecord.stock_quantity };
          if (currentStock[item.size] !== undefined) {
            currentStock[item.size] = currentStock[item.size] + item.quantity;
            await tx
              .update(schema.products)
              .set({ stock_quantity: currentStock })
              .where(eq(schema.products.id, item.id));
          }
        }
      }

      // 2. Flip status to cancelled
      await tx
        .update(schema.orders)
        .set({
          order_status: 'cancelled',
          updated_at: new Date(),
        })
        .where(eq(schema.orders.id, orderId));
    });

    // 3. Process refund for COD deposit if configured and paid
    try {
      const dbSettings = await db.select().from(schema.settings);
      const refundSetting = dbSettings.find((s: any) => s.key === 'deposit_refundable_on_cancel');
      const depositRefundable = refundSetting ? refundSetting.value === 'true' : true; // default to true

      if (depositRefundable && order.payment_type === 'cod_with_deposit' && order.payment_status === 'paid' && order.payment_id) {
        const { razorpay } = await import('@/lib/razorpay');
        if (razorpay) {
          await (razorpay as any).refunds.create({
            payment_id: order.payment_id,
            amount: 20000, // ₹200 in paise
          });
          console.log(`[Refund] Refunded ₹200 COD deposit for cancelled order: ${order.order_number}`);
          await db
            .update(schema.orders)
            .set({ deposit_status: 'failed' }) // mark deposit status as refunded/failed
            .where(eq(schema.orders.id, orderId));
        }
      }
    } catch (err) {
      console.error('Failed to process cancellation refund:', err);
    }

    return NextResponse.json({ success: true, message: 'Order successfully cancelled and stock released.' });

  } catch (error) {
    console.error('Cancel order endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
