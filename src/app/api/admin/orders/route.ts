import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const list = await db
      .select()
      .from(schema.orders)
      .orderBy(desc(schema.orders.created_at));
    
    return NextResponse.json({ orders: list });
  } catch (error) {
    console.error('Admin orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Order ID parameter is required' }, { status: 400 });
    }

    const body = await request.json();

    const [updatedOrder] = await db
      .update(schema.orders)
      .set({
        ...body,
        updated_at: new Date(),
      })
      .where(eq(schema.orders.id, id))
      .returning();

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Admin orders PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
