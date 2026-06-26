import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  image_url: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().default(true),
  display_order: z.number().int().default(0),
});

export async function GET() {
  try {
    const list = await db
      .select()
      .from(schema.categories)
      .orderBy(desc(schema.categories.created_at));
    
    return NextResponse.json({ categories: list });
  } catch (error) {
    console.error('Admin categories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid category inputs', details: validation.error.format() }, { status: 400 });
    }

    const { name, slug, image_url, is_active, display_order } = validation.data;

    const [newCat] = await db
      .insert(schema.categories)
      .values({
        name,
        slug,
        image_url,
        is_active,
        display_order,
      })
      .returning();

    return NextResponse.json({ success: true, category: newCat });
  } catch (error) {
    console.error('Admin categories POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID parameter is required' }, { status: 400 });
    }

    const body = await request.json();
    const partialSchema = categorySchema.partial();
    const validation = partialSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid category update inputs', details: validation.error.format() }, { status: 400 });
    }

    const [updatedCat] = await db
      .update(schema.categories)
      .set({
        ...validation.data,
        updated_at: new Date(),
      })
      .where(eq(schema.categories.id, id))
      .returning();

    if (!updatedCat) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, category: updatedCat });
  } catch (error) {
    console.error('Admin categories PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID parameter is required' }, { status: 400 });
    }

    const deleted = await db
      .delete(schema.categories)
      .where(eq(schema.categories.id, id))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin categories DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
