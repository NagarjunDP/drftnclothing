import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// 1. Categories Table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  image_url: text('image_url'),
  is_active: boolean('is_active').notNull().default(true),
  display_order: integer('display_order').notNull().default(0),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 2. Products Table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(), // stored in paise, e.g. 129900 for ₹1299
  compare_price: integer('compare_price'), // strikethrough MRP in paise
  category: text('category').notNull(), // 'tees' | 'hoodies' | 'joggers' | 'accessories'
  gender: text('gender').notNull(), // 'unisex' | 'men' | 'women'
  images: text('images').array().notNull().default(sql`'{}'::text[]`), // Array of Cloudinary URLs
  sizes: text('sizes').array().notNull().default(sql`'{"XS", "S", "M", "L", "XL", "XXL"}'::text[]`),
  stock_quantity: jsonb('stock').$type<Record<string, number>>().notNull().default(sql`'{"XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0}'::jsonb`),
  is_featured: boolean('is_featured').notNull().default(false),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 3. Orders Table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_number: text('order_number').unique().notNull(), // format: DRFTN-1001
  customer_name: text('customer_name').notNull(),
  customer_email: text('customer_email').notNull(),
  customer_phone: text('customer_phone').notNull(), // 10-digit Indian mobile
  shipping_address: jsonb('shipping_address').$type<{
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  }>().notNull(),
  items: jsonb('items').$type<Array<{
    id: string; // product ID
    name: string;
    size: string;
    quantity: number;
    price: number; // in paise
    image: string;
    slug: string;
  }>>().notNull(),
  subtotal: integer('subtotal').notNull(), // in paise
  shipping_charge: integer('shipping_charge').notNull(), // in paise
  discount_code: text('discount_code'),
  discount_amount: integer('discount_amount'), // in paise
  total: integer('total').notNull(), // in paise
  payment_status: text('payment_status').$type<'pending' | 'paid' | 'failed' | 'refunded'>().notNull().default('pending'),
  razorpay_order_id: text('razorpay_order_id'),
  payment_id: text('razorpay_payment_id'), // Razorpay Payment ID
  order_status: text('order_status').$type<'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled'>().notNull().default('placed'),
  tracking_number: text('tracking_number'), // Shiprocket AWB
  courier_partner: text('courier_partner'),
  shiprocket_order_id: text('shiprocket_order_id'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 4. Discount Codes Table
export const discountCodes = pgTable('discount_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').unique().notNull(), // UPPERCASE
  discount_type: text('discount_type').$type<'percent' | 'flat'>().notNull(),
  discount_value: integer('discount_value').notNull(), // percent: 0-100, flat: paise
  min_order_value: integer('min_order_value').notNull().default(0), // paise
  usage_limit: integer('usage_limit'),
  used_count: integer('used_count').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  expires_at: timestamp('expires_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// 5. Settings Table
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 6. Contact Messages Table
export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
