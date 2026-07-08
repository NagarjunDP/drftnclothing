import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

const MAKE_WHATSAPP_WEBHOOK = process.env.MAKE_WEBHOOK_URL || '';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: 'Signature verification parameters missing' }, { status: 400 });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const sigBuf = Buffer.from(signature, 'utf-8');

    if (expectedBuf.length !== sigBuf.length) {
      console.warn('[Razorpay Webhook] Invalid webhook signature length!');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const isValid = crypto.timingSafeEqual(expectedBuf, sigBuf);

    if (!isValid) {
      console.warn('[Razorpay Webhook] Invalid webhook signature detected!');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const payment = payload.payload.payment.entity;
    const razorpayOrderId = payment.order_id;

    if (!razorpayOrderId) {
      return NextResponse.json({ success: true, message: 'No order ID in payment entity' });
    }

    // Find the corresponding order
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.razorpay_order_id, razorpayOrderId))
      .limit(1);

    if (!order) {
      console.warn(`[Razorpay Webhook] Order not found for Razorpay Order ID: ${razorpayOrderId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Handle Captured Payment
    if (event === 'payment.captured') {
      if (order.payment_status === 'paid') {
        return NextResponse.json({ success: true, message: 'Order already completed (idempotency check passed)' });
      }

      // Verify payment amount matches expected amount (Razorpay payment.amount is in paise)
      const amountReceived = payment.amount;
      const expectedAmount = order.payment_type === 'cod_with_deposit' ? 20000 : order.total;
      if (amountReceived !== expectedAmount) {
        console.error(`[FRAUD ALERT] Webhook payment amount ${amountReceived} does not match expected total ${expectedAmount}! Order: ${order.order_number}`);
        
        await db
          .update(schema.orders)
          .set({
            order_status: 'payment_mismatch',
            payment_status: 'pending',
            payment_id: payment.id,
            updated_at: new Date(),
          })
          .where(eq(schema.orders.id, order.id));

        return NextResponse.json({ success: true, message: 'Payment mismatch handled, order flagged.' });
      }

      await db.transaction(async (tx: any) => {
        // Re-query within transaction
        const [oRecord] = await tx
          .select()
          .from(schema.orders)
          .where(eq(schema.orders.id, order.id));
        
        if (!oRecord || oRecord.payment_status === 'paid') return;

        // Deduct stocks
        for (const item of oRecord.items) {
          const [pRecord] = await tx
            .select({ stock_quantity: schema.products.stock_quantity })
            .from(schema.products)
            .where(eq(schema.products.id, item.id))
            .for('update');

          if (pRecord) {
            const currentStock = { ...pRecord.stock_quantity };
            if (currentStock[item.size] !== undefined) {
              currentStock[item.size] = Math.max(0, currentStock[item.size] - item.quantity);
              await tx
                .update(schema.products)
                .set({ stock_quantity: currentStock })
                .where(eq(schema.products.id, item.id));
            }
          }
        }

        // Increment discount code usage count
        if (oRecord.discount_code) {
          await tx
            .update(schema.discountCodes)
            .set({ used_count: sql`${schema.discountCodes.used_count} + 1` })
            .where(eq(schema.discountCodes.code, oRecord.discount_code));
        }

        // Mark as paid and confirmed
        const updates: any = {
          payment_status: 'paid',
          payment_id: payment.id,
          order_status: 'confirmed',
          updated_at: new Date(),
        };
        if (oRecord.payment_type === 'cod_with_deposit') {
          updates.deposit_status = 'paid';
        }

        await tx
          .update(schema.orders)
          .set(updates)
          .where(eq(schema.orders.id, order.id));
      });

      // Fire Make.com WhatsApp Webhook (Fire-and-forget)
      if (MAKE_WHATSAPP_WEBHOOK && MAKE_WHATSAPP_WEBHOOK.startsWith('http')) {
        const itemsList = order.items
          .map((i: any) => `${i.name} (${i.size}) x${i.quantity}`)
          .join(', ');

        fetch(MAKE_WHATSAPP_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'order_confirmed',
            order_number: order.order_number,
            total: order.total,
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            items: itemsList,
          }),
        }).catch((err) => console.error('Make.com webhook failed:', err));
      }

      console.log(`[Razorpay Webhook] Order ${order.order_number} successfully marked as PAID.`);
      return NextResponse.json({ success: true, processed: true });
    }

    // Handle Failed Payment
    if (event === 'payment.failed') {
      if (order.payment_status === 'pending') {
        await db
          .update(schema.orders)
          .set({
            payment_status: 'failed',
            updated_at: new Date(),
          })
          .where(eq(schema.orders.id, order.id));
        
        console.log(`[Razorpay Webhook] Order ${order.order_number} marked as FAILED.`);
      }
      return NextResponse.json({ success: true, processed: true });
    }

    return NextResponse.json({ success: true, message: 'Unhandled event type' });

  } catch (error) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error processing webhook' }, { status: 500 });
  }
}
