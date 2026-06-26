import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import { adminUpdateStatusSchema } from '@/lib/validations';

const MAKE_WHATSAPP_WEBHOOK = process.env.MAKE_WEBHOOK_URL || '';

const STATUS_HIERARCHY: Record<string, number> = {
  placed: 1,
  confirmed: 2,
  packed: 3,
  shipped: 4,
  delivered: 5,
  cancelled: 6,
};

export async function PATCH(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  try {
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const body = await request.json();

    // 1. Zod validate input
    const validationResult = adminUpdateStatusSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid target status value' }, { status: 400 });
    }

    const newStatus = validationResult.data.status;

    // 2. Query Neon DB order
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = order.order_status;

    // 3. Status workflow validation
    if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
      return NextResponse.json(
        { error: `Cannot transition order status out of final state: '${currentStatus}'` },
        { status: 400 }
      );
    }

    if (newStatus !== 'cancelled') {
      const currentVal = STATUS_HIERARCHY[currentStatus] || 0;
      const newVal = STATUS_HIERARCHY[newStatus] || 0;

      if (newVal < currentVal) {
        return NextResponse.json(
          { error: `Backward transitions are prohibited: '${currentStatus}' to '${newStatus}'` },
          { status: 400 }
        );
      }
    }

    // 4. Perform database update
    const [updatedOrder] = await db
      .update(schema.orders)
      .set({
        order_status: newStatus,
        updated_at: new Date(),
      })
      .where(eq(schema.orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }

    // 5. Fire WhatsApp update webhook (Fire-and-forget)
    if (MAKE_WHATSAPP_WEBHOOK && MAKE_WHATSAPP_WEBHOOK.startsWith('http')) {
      fetch(MAKE_WHATSAPP_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'order_status_updated',
          order_number: updatedOrder.order_number,
          new_status: newStatus,
          customer_name: updatedOrder.customer_name,
          customer_phone: updatedOrder.customer_phone,
          tracking_number: updatedOrder.tracking_number || null,
          courier_partner: updatedOrder.courier_partner || null,
        }),
      }).catch((err) => console.error('Make.com status webhook webhook execution failed:', err));
    }

    return NextResponse.json({
      success: true,
      orderId,
      oldStatus: currentStatus,
      newStatus: updatedOrder.order_status,
    });

  } catch (error) {
    console.error(`Admin status update exception for order ${orderId}:`, error);
    return NextResponse.json({ error: 'Internal server error occurred' }, { status: 500 });
  }
}
