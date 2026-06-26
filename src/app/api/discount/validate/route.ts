import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { discountValidateSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Zod input validation
    const validationResult = discountValidateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid validation payload' }, { status: 400 });
    }

    const { code, subtotal } = validationResult.data; // subtotal is in paise
    const cleanCode = code.toUpperCase().trim();

    // 2. Fetch discount from Neon DB
    const [discount] = await db
      .select()
      .from(schema.discountCodes)
      .where(and(
        eq(schema.discountCodes.code, cleanCode),
        eq(schema.discountCodes.is_active, true)
      ))
      .limit(1);

    if (!discount) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid discount code',
      });
    }

    // 3. Expiration check
    if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon code has expired',
      });
    }

    // 4. Usage limit check
    if (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit) {
      return NextResponse.json({
        valid: false,
        message: 'This coupon code usage limit has been reached',
      });
    }

    // 5. Min order check (both subtotal and min_order_value are in paise)
    const minOrderVal = Number(discount.min_order_value || 0);
    if (subtotal < minOrderVal) {
      return NextResponse.json({
        valid: false,
        message: `This coupon requires a minimum order of ₹${(minOrderVal / 100).toFixed(0)}`,
      });
    }

    // 6. Return metadata (no calculated amount, calculated on order creation)
    return NextResponse.json({
      valid: true,
      discount_type: discount.discount_type,
      discount_value: Number(discount.discount_value),
      message: 'Discount code applied successfully!',
    });

  } catch (error) {
    console.error('Discount validation API error:', error);
    return NextResponse.json({ error: 'An unexpected validation server error occurred' }, { status: 500 });
  }
}
