import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { verifyPaymentSchema } from '@/lib/validations';
import { auth } from '@clerk/nextjs/server';

const MAKE_WHATSAPP_WEBHOOK = process.env.MAKE_WEBHOOK_URL || '';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  let reqBody: any = null;

  try {
    // 0. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be signed in to verify payment.' },
        { status: 401 }
      );
    }
    const body = await request.json();
    reqBody = body;

    // 1. Zod input validation
    const validationResult = verifyPaymentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid payment verification details' }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validationResult.data;
    const orderId = body.orderId;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID reference' }, { status: 400 });
    }

    // Validate orderId as a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }

    // 2. Fetch order from Neon DB
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. Prevent double processing
    if (order.payment_status === 'paid') {
      return NextResponse.json({
        success: true,
        orderNumber: order.order_number,
        message: 'Order already processed',
      });
    }

    // 4. Verify Razorpay Signature
    const isMockOrder = razorpay_order_id.startsWith('order_mock_');
    const secret = process.env.RAZORPAY_KEY_SECRET;
    let paymentAmountVerified = true;

    if (!isMockOrder) {
      if (!secret) {
        console.error('RAZORPAY_KEY_SECRET is missing in environment variables');
        return NextResponse.json({ error: 'Gateway configuration error' }, { status: 500 });
      }

      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(text)
        .digest('hex');

      let isValid = false;
      try {
        isValid = crypto.timingSafeEqual(
          Buffer.from(expectedSignature, 'utf-8'),
          Buffer.from(razorpay_signature, 'utf-8')
        );
      } catch (err) {
        isValid = false;
      }

      if (!isValid) {
        console.warn(`[FRAUD ALERT] Mismatch signature! IP: ${ip}, Order: ${orderId}, Time: ${new Date().toISOString()}`);
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
      }

      // Fetch payment from Razorpay API directly to prevent amount tampering
      try {
        const { razorpay } = await import('@/lib/razorpay');
        if (razorpay) {
          const rzPayment = await razorpay.payments.fetch(razorpay_payment_id);
          // compare in paise
          const expectedAmount = order.payment_type === 'cod_with_deposit' ? 20000 : order.total;
          if (rzPayment.amount !== expectedAmount) {
            console.error(`[FRAUD ALERT] Razorpay payment amount ${rzPayment.amount} does not match expected total ${expectedAmount}! IP: ${ip}, Order: ${order.order_number}`);
            paymentAmountVerified = false;
          }
        }
      } catch (err) {
        console.error('Failed to fetch Razorpay payment entity:', err);
        return NextResponse.json({ error: 'Failed to verify payment amount with gateway' }, { status: 400 });
      }
    } else {
      console.log(`Bypassing signature validation for Mock Order: ${razorpay_order_id}`);
    }

    if (!paymentAmountVerified) {
      // Flag order as payment_mismatch, do NOT deduct stock
      await db
        .update(schema.orders)
        .set({
          order_status: 'payment_mismatch',
          payment_status: 'pending',
          payment_id: razorpay_payment_id,
          updated_at: new Date(),
        })
        .where(eq(schema.orders.id, orderId));

      return NextResponse.json({ 
        error: 'Payment amount mismatch detected. Order flagged for manual review.', 
        code: 'PAYMENT_MISMATCH' 
      }, { status: 400 });
    }

    // 5. Update order state and deduct stock inside a secure SQL transaction
    const confirmedOrder = await db.transaction(async (tx: any) => {
      // Re-verify order payment status in transaction
      const [oRecord] = await tx
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.id, orderId));
      
      if (!oRecord || oRecord.payment_status === 'paid') {
        return oRecord;
      }

      // Deduct product stocks
      const items = oRecord.items;
      for (const item of items) {
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

      // Increment discount code used count if applicable
      if (oRecord.discount_code) {
        await tx
          .update(schema.discountCodes)
          .set({ used_count: sql`${schema.discountCodes.used_count} + 1` })
          .where(eq(schema.discountCodes.code, oRecord.discount_code));
      }

      // Update Order Status to paid and confirmed (state machine)
      const updates: any = {
        payment_status: 'paid',
        payment_id: razorpay_payment_id,
        order_status: 'confirmed',
        updated_at: new Date(),
      };
      if (oRecord.payment_type === 'cod_with_deposit') {
        updates.deposit_status = 'paid';
      }

      const [updatedOrder] = await tx
        .update(schema.orders)
        .set(updates)
        .where(eq(schema.orders.id, orderId))
        .returning();

      return updatedOrder;
    });

    if (!confirmedOrder) {
      return NextResponse.json({ error: 'Order processing failed' }, { status: 500 });
    }

    // 6. Fire Make.com WhatsApp Webhook (Fire-and-forget)
    if (MAKE_WHATSAPP_WEBHOOK && MAKE_WHATSAPP_WEBHOOK.startsWith('http')) {
      const itemsList = confirmedOrder.items
        .map((i: any) => `${i.name} (${i.size}) x${i.quantity}`)
        .join(', ');

      fetch(MAKE_WHATSAPP_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'order_confirmed',
          order_number: confirmedOrder.order_number,
          total: confirmedOrder.total,
          customer_name: confirmedOrder.customer_name,
          customer_phone: confirmedOrder.customer_phone,
          items: itemsList,
        }),
      }).catch((err) => console.error('Make.com WhatsApp Webhook execution failed:', err));
    }

    return NextResponse.json({
      success: true,
      orderNumber: confirmedOrder.order_number,
    });

  } catch (error: any) {
    console.error('Server error during payment verification:', error);
    try {
      const { captureException, setTag } = await import('@sentry/nextjs');
      setTag("order_id", reqBody?.orderId || 'unknown');
      setTag("payment_id", reqBody?.razorpay_payment_id || 'unknown');
      captureException(error);
    } catch (sentryErr) {
      console.error('Sentry reporting failed:', sentryErr);
    }
    return NextResponse.json({ error: 'An unexpected verification error occurred' }, { status: 500 });
  }
}
