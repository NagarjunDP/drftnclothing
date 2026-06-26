import { NextResponse } from 'next/server';
import { db } from '@/db';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';

const MAKE_WHATSAPP_WEBHOOK = process.env.MAKE_WEBHOOK_URL || '';

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params;

  try {
    const body = await request.json();
    const { trackingNumber, courierPartner } = body;

    // 1. Fetch order details from database
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const shiprocketEmail = process.env.SHIPROCKET_EMAIL;
    const shiprocketPassword = process.env.SHIPROCKET_PASSWORD;
    const isShiprocketConfigured =
      shiprocketEmail &&
      shiprocketPassword &&
      !shiprocketEmail.includes('placeholder') &&
      !shiprocketPassword.includes('placeholder');

    let awb = trackingNumber || '';
    let courierName = courierPartner || 'Shiprocket Partner';
    let shiprocketOrderId: string | null = null;

    if (isShiprocketConfigured && !trackingNumber) {
      console.log('Shiprocket configuration found. Attempting automatic shipment creation...');
      try {
        // Step A: Login to Shiprocket
        const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: shiprocketEmail, password: shiprocketPassword }),
        });
        const authData = await authRes.json();
        
        if (!authRes.ok || !authData.token) {
          throw new Error(authData.message || 'Shiprocket authentication failed');
        }

        const token = authData.token;

        // Parse customer first and last name
        const nameParts = order.customer_name.trim().split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || 'Streetwear';

        // Format items for Shiprocket
        const itemsPayload = order.items.map((i: any) => ({
          name: i.name,
          sku: i.slug || `prod-${i.id}`,
          units: i.quantity,
          selling_price: (i.price / 100).toString(), // Convert paise to rupees
        }));

        const shippingAddr = order.shipping_address as any;

        // Step B: Create custom order in Shiprocket
        const orderRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id: order.order_number,
            order_date: new Date().toISOString().split('T')[0],
            pickup_location: 'Primary',
            billing_customer_name: firstName,
            billing_last_name: lastName,
            billing_address: shippingAddr.line1,
            billing_address_2: shippingAddr.line2 || '',
            billing_city: shippingAddr.city,
            billing_pincode: shippingAddr.pincode,
            billing_state: shippingAddr.state,
            billing_country: 'India',
            billing_email: order.customer_email,
            billing_phone: order.customer_phone,
            shipping_is_billing: true,
            order_items: itemsPayload,
            payment_method: order.payment_status === 'paid' ? 'Prepaid' : 'COD',
            sub_total: (order.total / 100).toString(),
            length: 10,
            width: 10,
            height: 10,
            weight: 0.5,
          }),
        });
        const orderData = await orderRes.json();

        if (!orderRes.ok || !orderData.order_id) {
          throw new Error(orderData.message || 'Shiprocket order creation failed');
        }

        shiprocketOrderId = String(orderData.order_id);
        const shipmentId = orderData.shipment_id;

        // Step C: Generate AWB for shipment
        const awbRes = await fetch('https://apiv2.shiprocket.in/v1/external/courier/assign/awb', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ shipment_id: shipmentId }),
        });
        const awbData = await awbRes.json();

        if (awbRes.ok && awbData.response?.data?.awb_code) {
          awb = awbData.response.data.awb_code;
          courierName = awbData.response.data.courier_name || 'Shiprocket Partner';
        } else {
          console.warn('Shiprocket AWB assignment failed, falling back to mock or manual input requirement', awbData);
          awb = `SR-${shipmentId}`;
        }
      } catch (err: any) {
        console.error('Shiprocket API integration exception:', err);
        return NextResponse.json(
          { error: `Shiprocket API failed: ${err.message || 'Unknown error'}. Please try manual tracking details instead.` },
          { status: 502 }
        );
      }
    } else {
      // Manual input flow
      if (!awb || !courierName) {
        return NextResponse.json(
          { error: 'Tracking number and courier partner are required for manual booking' },
          { status: 400 }
        );
      }
    }

    // 2. Update order in Neon DB using Drizzle
    const [updatedOrder] = await db
      .update(schema.orders)
      .set({
        tracking_number: awb,
        courier_partner: courierName,
        shiprocket_order_id: shiprocketOrderId,
        order_status: 'shipped',
        updated_at: new Date(),
      })
      .where(eq(schema.orders.id, orderId))
      .returning();

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Failed to update order tracking details' }, { status: 500 });
    }

    // 3. Send tracking WhatsApp update to customer via Make.com
    if (MAKE_WHATSAPP_WEBHOOK && MAKE_WHATSAPP_WEBHOOK.startsWith('http')) {
      fetch(MAKE_WHATSAPP_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'order_shipped',
          order_number: updatedOrder.order_number,
          customer_name: updatedOrder.customer_name,
          customer_phone: updatedOrder.customer_phone,
          tracking_number: awb,
          courier_partner: courierName,
          tracking_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://drftn.in'}/track?orderNumber=${updatedOrder.order_number}&phone=${updatedOrder.customer_phone}`,
        }),
      }).catch((err) => console.error('Make.com shipping notification failed:', err));
    }

    return NextResponse.json({
      success: true,
      awb,
      courier_partner: courierName,
      status: 'shipped',
    });

  } catch (error) {
    console.error(`Admin shipment booking exception for order ${orderId}:`, error);
    return NextResponse.json({ error: 'An unexpected shipment server error occurred' }, { status: 500 });
  }
}
