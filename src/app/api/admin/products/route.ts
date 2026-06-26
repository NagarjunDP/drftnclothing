import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { adminProductSchema } from '@/lib/validations';

/**
 * GET /api/admin/products
 * Fetch all products (including inactive products) with exact stock levels
 */
export async function GET() {
  try {
    const products = await db
      .select()
      .from(schema.products)
      .orderBy(desc(schema.products.created_at));

    return NextResponse.json({ products: products || [] });
  } catch (error) {
    console.error('Admin products GET exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/products
 * Create a new product with full fields validation
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request schema
    const validationResult = adminProductSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid product details', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      description,
      price,
      compare_price,
      category,
      gender,
      images,
      sizes,
      stock_quantity,
      is_featured,
      is_active,
    } = validationResult.data;

    // Insert to products table using Drizzle
    const [newProduct] = await db
      .insert(schema.products)
      .values({
        name,
        slug,
        description,
        price,
        compare_price: compare_price || null,
        category,
        gender,
        images,
        sizes,
        stock_quantity,
        is_featured: is_featured || false,
        is_active: is_active !== undefined ? is_active : true,
      })
      .returning();

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Admin products POST exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/products
 * Update existing product fields
 */
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID parameter is required' }, { status: 400 });
    }

    const body = await request.json();
    
    // Partial validation of incoming edits
    const partialProductSchema = adminProductSchema.partial();
    const validationResult = partialProductSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid update inputs', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    // Perform database update via Drizzle
    const [updatedProduct] = await db
      .update(schema.products)
      .set({
        ...validationResult.data,
        updated_at: new Date(),
      })
      .where(eq(schema.products.id, id))
      .returning();

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found or failed to update' }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Admin products PATCH exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products
 * Delete product by ID
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID parameter is required' }, { status: 400 });
    }

    const deleted = await db
      .delete(schema.products)
      .where(eq(schema.products.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin products DELETE exception:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
