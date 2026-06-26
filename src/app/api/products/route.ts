import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const [product] = await db
        .select()
        .from(schema.products)
        .where(and(
          eq(schema.products.slug, slug),
          eq(schema.products.is_active, true)
        ))
        .limit(1);

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ product });
    }

    // Default: fetch all active products
    const products = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.is_active, true));

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Public products GET API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
