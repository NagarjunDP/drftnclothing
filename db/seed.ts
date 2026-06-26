import * as schema from '../src/db/schema';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually to load DATABASE_URL before importing the DB client
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value.trim();
    }
  });
}

async function seed() {
  console.log('Seeding database...');
  
  // Dynamically import db so it executes after env variables are set
  const { db } = await import('../src/db');

  try {
    // 1. Clear existing data
    console.log('Clearing old records...');
    await db.delete(schema.contactMessages);
    await db.delete(schema.settings);
    await db.delete(schema.discountCodes);
    await db.delete(schema.orders);
    await db.delete(schema.products);
    await db.delete(schema.categories);

    // 2. Insert Categories
    console.log('Seeding categories...');
    const seededCategories = await db.insert(schema.categories).values([
      {
        name: 'Tees',
        slug: 'tees',
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        is_active: true,
        display_order: 1,
      },
      {
        name: 'Hoodies',
        slug: 'hoodies',
        image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80',
        is_active: true,
        display_order: 2,
      },
      {
        name: 'Joggers',
        slug: 'joggers',
        image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
        is_active: true,
        display_order: 3,
      },
      {
        name: 'Accessories',
        slug: 'accessories',
        image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
        is_active: true,
        display_order: 4,
      },
    ]).returning();

    console.log(`Seeded ${seededCategories.length} categories.`);

    // 3. Insert Products
    console.log('Seeding products...');
    const seededProducts = await db.insert(schema.products).values([
      {
        name: 'Essential Black Tee',
        slug: 'essential-black-tee',
        description: '280 GSM heavyweight organic cotton tee. Features a premium boxy streetwear fit, reinforced crewneck ribbing, and wide shoulder drops. Soft-brushed finish for maximum comfort.',
        price: 79900, // ₹799 in paise
        compare_price: 99900,
        category: 'tees',
        gender: 'unisex',
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        stock_quantity: { XS: 10, S: 15, M: 25, L: 20, XL: 10, XXL: 5 },
        is_featured: true,
        is_active: true,
      },
      {
        name: 'Washed Graphic Tee',
        slug: 'washed-graphic-tee',
        description: 'Features a vintage acid-washed look with custom DRFTN cyberpunk graphic screen print. 240 GSM organic combed cotton. Built to last through countless street drifts.',
        price: 99900, // ₹999 in paise
        compare_price: 129900,
        category: 'tees',
        gender: 'unisex',
        images: [
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80'
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        stock_quantity: { S: 10, M: 15, L: 15, XL: 8 },
        is_featured: false,
        is_active: true,
      },
      {
        name: 'Oversized White Tee',
        slug: 'oversized-white-tee',
        description: 'Crisp white 240 GSM drop shoulder tee with minimal wide-letter logo embroidery. A high-comfort Bengaluru summer wardrobe staple.',
        price: 89900, // ₹899 in paise
        compare_price: 109900,
        category: 'tees',
        gender: 'unisex',
        images: [
          'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        stock_quantity: { XS: 5, S: 12, M: 20, L: 18, XL: 10, XXL: 5 },
        is_featured: false,
        is_active: true,
      },
      {
        name: 'DRFTN Pullover Hoodie',
        slug: 'drftn-pullover-hoodie',
        description: 'Ultra-heavy 450 GSM French Terry cotton hoodie. Features double-lined hood without drawcords for a clean, premium drape. Kangaroo pocket and embroidered streetwear lettering on the sleeve.',
        price: 189900, // ₹1899 in paise
        compare_price: 239900,
        category: 'hoodies',
        gender: 'unisex',
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80'
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        stock_quantity: { S: 8, M: 12, L: 10, XL: 5 },
        is_featured: true,
        is_active: true,
      },
      {
        name: 'Zip-Up Heavy Hoodie',
        slug: 'zip-up-heavy-hoodie',
        description: 'Premium metal zipped hoodie in a relaxed boxy fit. 420 GSM pre-shrunk cotton-poly fleece. Features custom utility pockets and ribbed hems.',
        price: 219900, // ₹2199 in paise
        compare_price: 279900,
        category: 'hoodies',
        gender: 'unisex',
        images: [
          'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80'
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        stock_quantity: { S: 5, M: 10, L: 10, XL: 6 },
        is_featured: false,
        is_active: true,
      },
      {
        name: 'Cargo Jogger Pants',
        slug: 'cargo-jogger-pants',
        description: 'Heavyweight utility joggers. Features zippered cargo side pockets, elastic waistband with drawcords, and custom adjustable ankle straps. Designed for unisex urban utility.',
        price: 149900, // ₹1499 in paise
        compare_price: 189900,
        category: 'joggers',
        gender: 'unisex',
        images: [
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80'
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        stock_quantity: { S: 8, M: 15, L: 12, XL: 6 },
        is_featured: false,
        is_active: true,
      },
      {
        name: 'Slim Fit Track Pants',
        slug: 'slim-fit-track-pants',
        description: 'Tapered streetwear track pants in premium double-knit interlock fabric. Accent white striping on sides and high-density puff print minimal logo.',
        price: 129900, // ₹1299 in paise
        compare_price: 159900,
        category: 'joggers',
        gender: 'unisex',
        images: [
          'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        stock_quantity: { S: 10, M: 12, L: 12, XL: 8 },
        is_featured: false,
        is_active: true,
      },
      {
        name: 'DRFTN Structured Cap',
        slug: 'drftn-structured-cap',
        description: 'Imported structured utility dad cap with embroidered branding and custom sliding brass buckle adjustment. Designed to complete the minimal look.',
        price: 69900, // ₹699 in paise
        compare_price: 89900,
        category: 'accessories',
        gender: 'unisex',
        images: [
          'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80'
        ],
        sizes: ['M', 'L'],
        stock_quantity: { M: 20, L: 20 },
        is_featured: false,
        is_active: true,
      },
    ]).returning();

    console.log(`Seeded ${seededProducts.length} products.`);

    // 4. Insert Discount Code
    console.log('Seeding discount codes...');
    const seededDiscounts = await db.insert(schema.discountCodes).values([
      {
        code: 'DRFTN10',
        discount_type: 'percent',
        discount_value: 10, // 10%
        min_order_value: 99900, // ₹999 min order in paise
        usage_limit: null,
        used_count: 0,
        is_active: true,
      },
    ]).returning();

    console.log(`Seeded ${seededDiscounts.length} discount codes.`);

    // 5. Insert Settings
    console.log('Seeding store settings...');
    await db.insert(schema.settings).values([
      { key: 'free_shipping_threshold', value: '99900' },
      { key: 'default_shipping_charge', value: '9900' },
      { key: 'cod_fee', value: '5000' },
      { key: 'store_whatsapp', value: '+917406164512' },
    ]);

    console.log('Store settings seeded.');
    console.log('Database seeding successfully finished!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
