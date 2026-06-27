import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, inArray, count, sql } from 'drizzle-orm';
import { createOrderSchema } from '@/lib/validations';
import { razorpay } from '@/lib/razorpay';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    // 0. Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be signed in to place an order.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 1. Zod input validation
    const validationResult = createOrderSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Order validation failed:', JSON.stringify(validationResult.error.format(), null, 2));
      return NextResponse.json(
        { error: 'Invalid order input data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { items, discountCode, customerInfo } = validationResult.data;
    // Extract paymentMethod if provided in body, default to 'razorpay'
    const paymentMethod = body.paymentMethod || 'razorpay';

    // 2. Fetch products from Neon database to verify active status and actual pricing
    const productIds = items.map((i) => i.productId);
    const dbProducts = await db
      .select()
      .from(schema.products)
      .where(and(
        inArray(schema.products.id, productIds),
        eq(schema.products.is_active, true)
      ));

    if (dbProducts.length !== new Set(productIds).size) {
      return NextResponse.json({ error: 'One or more products are inactive or not found' }, { status: 400 });
    }

    // 3. Verify stock availability and calculate subtotal (in paise)
    let calculatedSubtotal = 0;
    const orderItemsToSave: Array<{
      id: string;
      name: string;
      size: string;
      quantity: number;
      price: number;
      image: string;
      slug: string;
    }> = [];

    for (const item of items) {
      const dbProd = dbProducts.find((p: any) => p.id === item.productId);
      if (!dbProd) {
        return NextResponse.json({ error: 'Product verification failed' }, { status: 400 });
      }

      // Check stock
      const stock = dbProd.stock_quantity || {};
      const available = stock[item.size] || 0;
      if (available < item.quantity) {
        return NextResponse.json(
          { error: `Product "${dbProd.name}" in size ${item.size} is out of stock.` },
          { status: 400 }
        );
      }

      calculatedSubtotal += dbProd.price * item.quantity;

      orderItemsToSave.push({
        id: dbProd.id,
        name: dbProd.name,
        size: item.size,
        quantity: item.quantity,
        price: dbProd.price, // stored in paise
        image: dbProd.images?.[0] || '',
        slug: dbProd.slug,
      });
    }

    // 4. Fetch dynamic store settings from database
    const dbSettings = await db.select().from(schema.settings);
    let freeShippingThreshold = 99900; // default ₹999 in paise
    let defaultShippingCharge = 9900;  // default ₹99 in paise
    let codFee = 5000;                  // default ₹50 in paise

    dbSettings.forEach((row: any) => {
      if (row.key === 'free_shipping_threshold') freeShippingThreshold = Number(row.value);
      if (row.key === 'default_shipping_charge') defaultShippingCharge = Number(row.value);
      if (row.key === 'cod_fee') codFee = Number(row.value);
    });

    // Calculate shipping before discount
    let shippingCharge = calculatedSubtotal >= freeShippingThreshold ? 0 : defaultShippingCharge;

    // 5. Server-side discount validation
    let discountAmount = 0;
    let validatedCode: string | undefined = undefined;

    if (discountCode) {
      const cleanCode = discountCode.toUpperCase().trim();
      const [dbCode] = await db
        .select()
        .from(schema.discountCodes)
        .where(and(
          eq(schema.discountCodes.code, cleanCode),
          eq(schema.discountCodes.is_active, true)
        ))
        .limit(1);

      if (!dbCode) {
        return NextResponse.json({ error: 'Invalid or inactive discount coupon' }, { status: 400 });
      }

      // Verify expiration
      if (dbCode.expiresAt && new Date(dbCode.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Discount code has expired' }, { status: 400 });
      }

      // Verify usage limits
      if (dbCode.usageLimit !== null && dbCode.usedCount >= dbCode.usageLimit) {
        return NextResponse.json({ error: 'Discount code usage limit has been reached' }, { status: 400 });
      }

      // Verify minimum order value
      if (calculatedSubtotal < dbCode.minOrderValue) {
        return NextResponse.json(
          { error: `Minimum order subtotal of ₹${(dbCode.minOrderValue / 100).toFixed(2)} required for this code` },
          { status: 400 }
        );
      }

      // Calculate discount amount (paise)
      if (dbCode.discount_type === 'percent') {
        discountAmount = Math.round(calculatedSubtotal * (dbCode.discount_value / 100));
      } else if (dbCode.discount_type === 'flat') {
        discountAmount = dbCode.discount_value;
      }

      // Cap discount amount at subtotal
      discountAmount = Math.min(discountAmount, calculatedSubtotal);
      validatedCode = cleanCode;
    }

    const discountedSubtotal = Math.max(0, calculatedSubtotal - discountAmount);

    // Re-verify free shipping eligibility on discounted subtotal
    shippingCharge = discountedSubtotal >= freeShippingThreshold ? 0 : defaultShippingCharge;
    
    // Add COD fee if applicable
    const isCod = paymentMethod === 'cod';
    if (isCod) {
      shippingCharge += codFee;
    }

    const finalTotal = discountedSubtotal + shippingCharge;

    // 6. Check Razorpay availability
    const isRazorpayConfigured = !!process.env.RAZORPAY_KEY_SECRET && !!razorpay;

    // 7. Save Order inside database transaction to guarantee auto-increment safety and stock isolation
    const createdOrder = await db.transaction(async (tx: any) => {
      // Get order sequence count
      const [countResult] = await tx.select({ val: count() }).from(schema.orders);
      const nextNum = 1001 + Number(countResult.val);
      const orderNumber = `DRFTN-${nextNum}`;

      // Insert pending order
      const [newOrder] = await tx
        .insert(schema.orders)
        .values({
          order_number: orderNumber,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          shipping_address: customerInfo.address,
          items: orderItemsToSave,
          subtotal: calculatedSubtotal,
          shipping_charge: shippingCharge,
          discount_code: validatedCode,
          discount_amount: discountAmount,
          total: finalTotal,
          payment_status: isCod ? 'pending' : 'pending', // both start as pending
          order_status: 'placed',
          courier_partner: null,
          tracking_number: null,
          shiprocket_order_id: null,
        })
        .returning();

      // For COD, we can deduct stock immediately.
      // For online payment, stock is deducted in payment verification to prevent stock locks by unpaid orders.
      if (isCod || !isRazorpayConfigured) {
        for (const item of orderItemsToSave) {
          const [pRecord] = await tx
            .select({ stock_quantity: schema.products.stock_quantity })
            .from(schema.products)
            .where(eq(schema.products.id, item.id));

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

        // If a discount code was successfully used, increment usage count
        if (validatedCode) {
          await tx
            .update(schema.discountCodes)
            .set({ used_count: sql`${schema.discountCodes.used_count} + 1` })
            .where(eq(schema.discountCodes.code, validatedCode));
        }
      }

      return newOrder;
    });

    // 8. payment flows
    if (isRazorpayConfigured && !isCod) {
      try {
        const rzOrder = await razorpay!.orders.create({
          amount: finalTotal, // Already in paise
          currency: 'INR',
          receipt: createdOrder.order_number,
          notes: {
            order_id: createdOrder.id,
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            discount_code: validatedCode || 'NONE',
          },
        });

        // Update order in database to store razorpay_order_id
        await db
          .update(schema.orders)
          .set({ razorpay_order_id: rzOrder.id })
          .where(eq(schema.orders.id, createdOrder.id));

        return NextResponse.json({
          razorpayOrderId: rzOrder.id,
          amount: finalTotal,
          currency: 'INR',
          orderId: createdOrder.id,
          orderNumber: createdOrder.order_number,
        });
      } catch (rzErr) {
        console.error('Razorpay SDK Order Error:', rzErr);
        return NextResponse.json({ error: 'Failed to initialize Razorpay transaction' }, { status: 500 });
      }
    }

    // 9. COD / Manual Fallback
    return NextResponse.json({
      orderId: createdOrder.id,
      orderNumber: createdOrder.order_number,
      total: finalTotal,
      message: isCod ? 'cod_success' : 'manual_payment',
    });

  } catch (error) {
    console.error('Secure Order Create API Error:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred' }, { status: 500 });
  }
}
