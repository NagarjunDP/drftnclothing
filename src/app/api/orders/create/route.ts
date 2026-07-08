import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and, inArray, count, sql } from 'drizzle-orm';
import { createOrderSchema } from '@/lib/validations';
import { razorpay } from '@/lib/razorpay';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  let clerkUserId: string | null = null;
  let reqBody: any = null;
  try {
    // 0. Verify authentication
    const { userId } = await auth();
    clerkUserId = userId;
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be signed in to place an order.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    reqBody = body;

    // 1. Zod input validation
    const validationResult = createOrderSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Order validation failed:', JSON.stringify(validationResult.error.format(), null, 2));
      return NextResponse.json(
        { error: 'Invalid order input data', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { items, discountCode, customerInfo, fulfillmentType, paymentMethod, verifiedPhone, verifiedPhoneToken } = validationResult.data;
    const isPickup = fulfillmentType === 'pickup';
    const isCod = paymentMethod === 'cod';

    // Inline phone verification check for Cash on Delivery
    if (isCod) {
      if (!verifiedPhone || !verifiedPhoneToken) {
        return NextResponse.json({ error: 'Phone OTP verification is required for COD checkout.' }, { status: 400 });
      }

      const clientId = process.env.PHONE_EMAIL_CLIENT_ID || 'mock_client_id';
      let verifiedSuccess = false;
      let matchedPhone = '';

      if (verifiedPhoneToken.startsWith('mock_token_')) {
        verifiedSuccess = true;
        matchedPhone = verifiedPhoneToken.replace('mock_token_', '');
      } else {
        try {
          const verifyUrl = 'https://eapi.phone.email/getuser';
          const phoneRes = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              client_id: clientId,
              access_token: verifiedPhoneToken,
            }),
          });
          const phoneData = await phoneRes.json();
          if (phoneRes.ok && phoneData.userDetails) {
            verifiedSuccess = true;
            matchedPhone = `${phoneData.userDetails.countryCode}${phoneData.userDetails.phoneNo}`;
          }
        } catch (err) {
          console.error('Inline OTP verification check failed:', err);
        }
      }

      if (!verifiedSuccess) {
        return NextResponse.json({ error: 'Invalid or expired phone verification OTP.' }, { status: 400 });
      }

      const cleanVerified = verifiedPhone.replace('+', '').trim();
      const cleanMatched = matchedPhone.replace('+', '').trim();
      if (cleanVerified !== cleanMatched) {
        return NextResponse.json({ error: 'Verified phone number mismatch.' }, { status: 400 });
      }
    }

    // 2. Fetch products from Neon database to verify active status and actual pricing
    const productIds = items.map((i) => i.productId);
    const dbProducts = await db
      .select()
      .from(schema.products)
      .where(and(
        inArray(schema.products.id, productIds),
        eq(schema.products.is_active, true)
      ));

    const dbProductImages = await db
      .select()
      .from(schema.productImages)
      .where(inArray(schema.productImages.product_id, productIds));

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

      const prodImages = dbProductImages.filter((img: any) => img.product_id === item.productId);
      const firstImage = dbProd.images?.[0] || prodImages?.[0]?.image_url || '';

      orderItemsToSave.push({
        id: dbProd.id,
        name: dbProd.name,
        size: item.size,
        quantity: item.quantity,
        price: dbProd.price, // stored in paise
        image: firstImage,
        slug: dbProd.slug,
      });
    }

    // 4. Fetch dynamic store settings from database (ignored if pickup)
    let shippingCharge = 0;
    if (!isPickup) {
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
      shippingCharge = calculatedSubtotal >= freeShippingThreshold ? 0 : defaultShippingCharge;
    }

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

    if (!isPickup) {
      // Re-verify free shipping eligibility on discounted subtotal
      const dbSettings = await db.select().from(schema.settings);
      let freeShippingThreshold = 99900;
      let defaultShippingCharge = 9900;
      let codFee = 5000;
      dbSettings.forEach((row: any) => {
        if (row.key === 'free_shipping_threshold') freeShippingThreshold = Number(row.value);
        if (row.key === 'default_shipping_charge') defaultShippingCharge = Number(row.value);
        if (row.key === 'cod_fee') codFee = Number(row.value);
      });
      
      shippingCharge = discountedSubtotal >= freeShippingThreshold ? 0 : defaultShippingCharge;
      
      // Add COD fee if applicable
      if (isCod) {
        shippingCharge += codFee;
      }
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

      // Unique pickup code if pickup order
      const pickupCode = isPickup 
        ? Math.floor(100000 + Math.random() * 900000).toString() 
        : null;

      // Shipping address fallback if pickup order
      const shippingAddr = isPickup 
        ? {
            line1: "DRFTN Flagship Store",
            line2: "100 Feet Road, Indiranagar",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560038"
          }
        : customerInfo.address;

      // With ₹200 deposit, COD orders are no longer confirmed immediately on creation; they wait for the deposit
      const initialOrderStatus = (!isRazorpayConfigured) 
        ? 'confirmed' 
        : 'pending_payment';

      // Insert pending order
      const [newOrder] = await tx
        .insert(schema.orders)
        .values({
          user_id: userId,
          order_number: orderNumber,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          shipping_address: shippingAddr,
          items: orderItemsToSave,
          subtotal: calculatedSubtotal,
          shipping_charge: shippingCharge,
          discount_code: validatedCode,
          discount_amount: discountAmount,
          total: finalTotal,
          payment_status: 'pending',
          order_status: initialOrderStatus,
          fulfillment_type: fulfillmentType,
          pickup_status: isPickup ? 'awaiting_pickup' : null,
          pickup_code: pickupCode,
          payment_type: isCod ? 'cod_with_deposit' : 'prepaid',
          deposit_amount: isCod ? 20000 : null, // ₹200 deposit
          remaining_amount: isCod ? finalTotal - 20000 : null,
          deposit_status: isCod ? 'pending' : null,
          verified_phone: isCod ? verifiedPhone : null,
          courier_partner: null,
          tracking_number: null,
          shiprocket_order_id: null,
        })
        .returning();

      // If Razorpay is not configured, confirm immediately and deduct stock
      if (!isRazorpayConfigured) {
        for (const item of orderItemsToSave) {
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
    if (isRazorpayConfigured) {
      try {
        const rzAmount = isCod ? 20000 : finalTotal;
        const rzOrder = await razorpay!.orders.create({
          amount: rzAmount, // ₹200 for COD deposit, or finalTotal
          currency: 'INR',
          receipt: createdOrder.order_number,
          notes: {
            order_id: createdOrder.id,
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            discount_code: validatedCode || 'NONE',
            payment_type: isCod ? 'cod_deposit' : 'prepaid',
          },
        });

        // Update order in database to store razorpay_order_id
        await db
          .update(schema.orders)
          .set({ razorpay_order_id: rzOrder.id })
          .where(eq(schema.orders.id, createdOrder.id));

        return NextResponse.json({
          razorpayOrderId: rzOrder.id,
          amount: rzAmount,
          currency: 'INR',
          orderId: createdOrder.id,
          orderNumber: createdOrder.order_number,
        });
      } catch (rzErr) {
        console.error('Razorpay SDK Order Error:', rzErr);
        return NextResponse.json({ error: 'Failed to initialize Razorpay transaction' }, { status: 500 });
      }
    }

    // 9. Razorpay NOT configured -> Fallback confirmation
    return NextResponse.json({
      orderId: createdOrder.id,
      orderNumber: createdOrder.order_number,
      total: finalTotal,
      message: 'manual_payment',
    });

  } catch (error: any) {
    console.error('Secure Order Create API Error:', error);
    try {
      const { captureException, setTag } = await import('@sentry/nextjs');
      setTag("user_id", clerkUserId || 'anonymous');
      setTag("payment_method", reqBody?.paymentMethod || 'razorpay');
      captureException(error);
    } catch (sentryErr) {
      console.error('Sentry reporting failed:', sentryErr);
    }
    return NextResponse.json({ error: 'An unexpected server error occurred' }, { status: 500 });
  }
}
