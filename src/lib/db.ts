import { supabase, isSupabaseConfigured } from './supabase';
import { Product, Category, Order, DiscountCode, StoreSettings, ContactSubmission } from '../types';

// =========================================================================
// MOCK DATA FOR LOCAL STORAGE FALLBACK
// =========================================================================

const SEED_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Tees',
    slug: 'tees',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'cat-2',
    name: 'Hoodies',
    slug: 'hoodies',
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'cat-3',
    name: 'Joggers',
    slug: 'joggers',
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'cat-4',
    name: 'Accessories',
    slug: 'accessories',
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
    is_active: true,
  },
];

const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aero Carbon Heavyweight Tee',
    slug: 'aero-carbon-heavyweight-tee',
    description: 'Crafted from 280 GSM ultra-heavyweight cotton. Features a relaxed drop-shoulder streetwear silhouette, high-density puff print detailing on the back, and ribbed crewneck collar. Pre-shrunk and double-stitched for maximum durability.',
    price: 999,
    compare_price: 1499,
    category: 'tees',
    gender: 'unisex',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock_quantity: { S: 12, M: 20, L: 15, XL: 8 },
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Neo-Tokyo Oversized Graphic Tee',
    slug: 'neo-tokyo-oversized-graphic-tee',
    description: 'Imported unisex streetwear tee featuring custom cyber-punk anime inspired screen printed graphics. 240 GSM organic combed cotton, styled for comfort and heavy daily rotation.',
    price: 1199,
    compare_price: 1799,
    category: 'tees',
    gender: 'unisex',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    stock_quantity: { XS: 5, S: 10, M: 14, L: 10, XL: 5 },
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Yelahanka Core Classic Tee',
    slug: 'yelahanka-core-classic-tee',
    description: 'The essential streetwear basics pack. Heavy knit 220 GSM boxy tee featuring subtle embroidered "DRFTN" typography on the chest. The ultimate Bangalore street staple.',
    price: 799,
    compare_price: 999,
    category: 'tees',
    gender: 'unisex',
    images: [
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock_quantity: { S: 15, M: 25, L: 25, XL: 15, XXL: 5 },
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Retrograde Acid Wash Hoodie',
    slug: 'retrograde-acid-wash-hoodie',
    description: '450 GSM French Terry cotton hoodie with custom hand-dyed acid wash texture. Embroidered branding on cuffs, heavy kangaroo pocket, and double-lined hood without drawcords for a clean aesthetic.',
    price: 2499,
    compare_price: 3499,
    category: 'hoodies',
    gender: 'unisex',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock_quantity: { S: 5, M: 8, L: 12, XL: 4 },
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Cyber-Grid Tech Zip-Up Hoodie',
    slug: 'cyber-grid-tech-zip-up-hoodie',
    description: 'Modern streetwear zip-up featuring technical details. Lightweight yet warm 360 GSM fleece, custom gunmetal double zipper, mesh utility pocket on left sleeve, and contrast piping.',
    price: 2299,
    compare_price: 2999,
    category: 'hoodies',
    gender: 'unisex',
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80'
    ],
    sizes: ['M', 'L', 'XL'],
    stock_quantity: { M: 10, L: 12, XL: 6 },
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    name: 'DRFTN Utility Cargo Joggers',
    slug: 'drftn-utility-cargo-joggers',
    description: 'Heavy cargo streetwear pants with tapered ankle cuffs. Features adjustable straps, multiple 3D storage pockets, water-resistant outer coating, and elastic drawstring waist.',
    price: 1899,
    compare_price: 2499,
    category: 'joggers',
    gender: 'unisex',
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock_quantity: { S: 8, M: 15, L: 10, XL: 5 },
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    name: 'Apex Heavy Fleece Sweatpants',
    slug: 'apex-heavy-fleece-sweatpants',
    description: 'Made from 400 GSM soft French terry fleece. Relaxed straight fit with side pockets and a zippered back pocket. Minimalist design matches perfectly with our hoodies.',
    price: 1599,
    compare_price: 1999,
    category: 'joggers',
    gender: 'unisex',
    images: [
      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&auto=format&fit=crop&q=80'
    ],
    sizes: ['S', 'M', 'L'],
    stock_quantity: { S: 10, M: 15, L: 10 },
    is_featured: false,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    name: 'D R F T N Classic Dad Cap',
    slug: 'drftn-classic-dad-cap',
    description: 'Unstructured 6-panel street cap in stonewashed canvas. Features curved visor, adjustable metal buckle closure, and high-density logo embroidery on front.',
    price: 699,
    compare_price: 999,
    category: 'accessories',
    gender: 'unisex',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800&auto=format&fit=crop&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    stock_quantity: { XS: 0, S: 0, M: 50, L: 0, XL: 0, XXL: 0 },
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const SEED_DISCOUNTS: DiscountCode[] = [
  {
    id: 'disc-1',
    code: 'DRFTN10',
    discount_type: 'percent',
    discount_value: 10,
    min_order_value: 0,
    usage_limit: 100,
    used_count: 0,
    is_active: true,
  },
  {
    id: 'disc-2',
    code: 'BLRSTREET',
    discount_type: 'flat',
    discount_value: 250,
    min_order_value: 1499,
    usage_limit: 50,
    used_count: 0,
    is_active: true,
  },
  {
    id: 'disc-3',
    code: 'FREESHIP',
    discount_type: 'flat',
    discount_value: 99,
    min_order_value: 0,
    usage_limit: 500,
    used_count: 0,
    is_active: true,
  },
];

const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'DRFTN CLOTHING',
  contact_number: '+91 7406164512',
  instagram_handle: '@drftnclothing',
  free_shipping_threshold: 999,
  default_shipping_charge: 99,
  razorpay_key_id: 'rzp_test_placeholderkey',
  razorpay_key_secret: 'placeholder_secret',
  nimbuspost_api_key: 'nimbus_placeholder_apikey',
};

// Helper to initialize local storage mock DB if empty
const initLocalDb = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem('drftn_categories')) {
    localStorage.setItem('drftn_categories', JSON.stringify(SEED_CATEGORIES));
  }
  if (!localStorage.getItem('drftn_products')) {
    localStorage.setItem('drftn_products', JSON.stringify(SEED_PRODUCTS));
  }
  if (!localStorage.getItem('drftn_discount_codes')) {
    localStorage.setItem('drftn_discount_codes', JSON.stringify(SEED_DISCOUNTS));
  }
  if (!localStorage.getItem('drftn_settings')) {
    localStorage.setItem('drftn_settings', JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem('drftn_orders')) {
    localStorage.setItem('drftn_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('drftn_contact_submissions')) {
    localStorage.setItem('drftn_contact_submissions', JSON.stringify([]));
  }
};

// Helper wrappers for local storage access with SSR safety
const getLocal = <T>(key: string): T => {
  if (typeof window === 'undefined') {
    if (key === 'drftn_products') return SEED_PRODUCTS as unknown as T;
    if (key === 'drftn_categories') return SEED_CATEGORIES as unknown as T;
    if (key === 'drftn_discount_codes') return SEED_DISCOUNTS as unknown as T;
    if (key === 'drftn_settings') return DEFAULT_SETTINGS as unknown as T;
    return [] as unknown as T;
  }
  initLocalDb();
  const val = localStorage.getItem(key);
  if (val) {
    try {
      return JSON.parse(val);
    } catch (e) {
      console.error("Error parsing local DB storage for key:", key, e);
    }
  }
  
  // Fallbacks
  if (key === 'drftn_products') return SEED_PRODUCTS as unknown as T;
  if (key === 'drftn_categories') return SEED_CATEGORIES as unknown as T;
  if (key === 'drftn_discount_codes') return SEED_DISCOUNTS as unknown as T;
  if (key === 'drftn_settings') return DEFAULT_SETTINGS as unknown as T;
  return [] as unknown as T;
};

const setLocal = <T>(key: string, data: T) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

// =========================================================================
// DATA ACCESS SERVICE LAYER
// =========================================================================

export const dbService = {
  // -----------------------------------------------------------------------
  // CATEGORIES
  // -----------------------------------------------------------------------
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    } else {
      return getLocal<Category[]>('drftn_categories').filter((c) => c.is_active);
    }
  },

  async getAllCategories(): Promise<Category[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocal<Category[]>('drftn_categories');
    }
  },

  async createCategory(cat: Omit<Category, 'id'>): Promise<Category> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('categories').insert([cat]).select().single();
      if (error) throw error;
      return data;
    } else {
      const list = getLocal<Category[]>('drftn_categories');
      const newCat = { ...cat, id: `cat-${Date.now()}` };
      list.push(newCat);
      setLocal('drftn_categories', list);
      return newCat;
    }
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const list = getLocal<Category[]>('drftn_categories');
      const idx = list.findIndex((c) => c.id === id);
      if (idx === -1) throw new Error('Category not found');
      list[idx] = { ...list[idx], ...updates };
      setLocal('drftn_categories', list);
      return list[idx];
    }
  },

  // -----------------------------------------------------------------------
  // PRODUCTS
  // -----------------------------------------------------------------------
  async getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    } else {
      return getLocal<Product[]>('drftn_products').filter((p) => p.is_active);
    }
  },

  async getAllProducts(): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocal<Product[]>('drftn_products');
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    } else {
      const prod = getLocal<Product[]>('drftn_products').find((p) => p.slug === slug);
      return prod || null;
    }
  },

  async createProduct(prod: Omit<Product, 'id'>): Promise<Product> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('products').insert([prod]).select().single();
      if (error) throw error;
      return data;
    } else {
      const list = getLocal<Product[]>('drftn_products');
      const newProd = { ...prod, id: `prod-${Date.now()}` };
      list.push(newProd);
      setLocal('drftn_products', list);
      return newProd;
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const list = getLocal<Product[]>('drftn_products');
      const idx = list.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error('Product not found');
      list[idx] = { ...list[idx], ...updates };
      setLocal('drftn_products', list);
      return list[idx];
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const list = getLocal<Product[]>('drftn_products');
      const filtered = list.filter((p) => p.id !== id);
      setLocal('drftn_products', filtered);
      return true;
    }
  },

  // -----------------------------------------------------------------------
  // ORDERS
  // -----------------------------------------------------------------------
  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocal<Order[]>('drftn_orders').sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    } else {
      const order = getLocal<Order[]>('drftn_orders').find((o) => o.id === id);
      return order || null;
    }
  },

  async getOrderByTracking(orderNumber: string, contact: string): Promise<Order | null> {
    if (isSupabaseConfigured() && supabase) {
      // Call secure security definer RPC
      const { data, error } = await supabase.rpc('get_order_by_tracking', {
        p_order_number: orderNumber,
        p_contact: contact
      });
      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } else {
      const order = getLocal<Order[]>('drftn_orders').find(
        (o) =>
          o.order_number.toLowerCase() === orderNumber.trim().toLowerCase() &&
          (o.customer_phone.includes(contact.trim()) || o.customer_email.toLowerCase() === contact.trim().toLowerCase())
      );
      return order || null;
    }
  },

  async createOrder(order: Omit<Order, 'id' | 'order_number' | 'created_at'>): Promise<Order> {
    // Generate order number like DRFTN-1001
    let nextNum = 1001;
    if (isSupabaseConfigured() && supabase) {
      // Check count of rows to auto increment
      const { count, error: countErr } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      if (!countErr && count !== null) {
        nextNum = 1001 + count;
      }
    } else {
      const list = getLocal<Order[]>('drftn_orders');
      nextNum = 1001 + list.length;
    }
    const orderNumber = `DRFTN-${nextNum}`;

    const newOrderData = {
      ...order,
      order_number: orderNumber,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('orders').insert([newOrderData]).select().single();
      if (error) throw error;

      // Update product stock in Supabase
      for (const item of order.items) {
        const { data: pData } = await supabase.from('products').select('stock_quantity').eq('id', item.id).single();
        if (pData) {
          const currentStock = pData.stock_quantity as Record<string, number>;
          if (currentStock[item.size] !== undefined) {
            currentStock[item.size] = Math.max(0, currentStock[item.size] - item.quantity);
            await supabase.from('products').update({ stock_quantity: currentStock }).eq('id', item.id);
          }
        }
      }

      return data;
    } else {
      const list = getLocal<Order[]>('drftn_orders');
      const newOrder = { ...newOrderData, id: `order-${Date.now()}` } as Order;
      list.push(newOrder);
      setLocal('drftn_orders', list);

      // Update product stock in local storage
      const pList = getLocal<Product[]>('drftn_products');
      for (const item of order.items) {
        const pIdx = pList.findIndex((p) => p.id === item.id);
        if (pIdx !== -1) {
          const updatedStock = { ...pList[pIdx].stock_quantity };
          if (updatedStock[item.size] !== undefined) {
            updatedStock[item.size] = Math.max(0, updatedStock[item.size] - item.quantity);
            pList[pIdx] = { ...pList[pIdx], stock_quantity: updatedStock };
          }
        }
      }
      setLocal('drftn_products', pList);

      return newOrder;
    }
  },

  async updateOrderStatus(
    id: string,
    updates: {
      order_status?: Order['order_status'];
      payment_status?: Order['payment_status'];
      tracking_number?: string;
      courier_partner?: string;
    }
  ): Promise<Order> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const list = getLocal<Order[]>('drftn_orders');
      const idx = list.findIndex((o) => o.id === id);
      if (idx === -1) throw new Error('Order not found');
      list[idx] = { ...list[idx], ...updates };
      setLocal('drftn_orders', list);
      return list[idx];
    }
  },

  // -----------------------------------------------------------------------
  // DISCOUNT CODES
  // -----------------------------------------------------------------------
  async getDiscountCodes(): Promise<DiscountCode[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocal<DiscountCode[]>('drftn_discount_codes');
    }
  },

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | null> {
    const cleanCode = code.toUpperCase().trim();
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    } else {
      const discount = getLocal<DiscountCode[]>('drftn_discount_codes').find(
        (d) => d.code.toUpperCase() === cleanCode && d.is_active
      );
      return discount || null;
    }
  },

  async createDiscountCode(discount: Omit<DiscountCode, 'id' | 'used_count'>): Promise<DiscountCode> {
    const code = discount.code.toUpperCase().trim();
    const newDiscountData = { ...discount, code, used_count: 0 };
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('discount_codes').insert([newDiscountData]).select().single();
      if (error) throw error;
      return data;
    } else {
      const list = getLocal<DiscountCode[]>('drftn_discount_codes');
      const newDiscount = { ...newDiscountData, id: `disc-${Date.now()}` } as DiscountCode;
      list.push(newDiscount);
      setLocal('drftn_discount_codes', list);
      return newDiscount;
    }
  },

  async updateDiscountCode(id: string, updates: Partial<DiscountCode>): Promise<DiscountCode> {
    if (updates.code) updates.code = updates.code.toUpperCase().trim();
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('discount_codes').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const list = getLocal<DiscountCode[]>('drftn_discount_codes');
      const idx = list.findIndex((d) => d.id === id);
      if (idx === -1) throw new Error('Discount code not found');
      list[idx] = { ...list[idx], ...updates };
      setLocal('drftn_discount_codes', list);
      return list[idx];
    }
  },

  async incrementDiscountCodeUsage(code: string): Promise<void> {
    const cleanCode = code.toUpperCase().trim();
    if (isSupabaseConfigured() && supabase) {
      // Fetch current used count
      const { data } = await supabase.from('discount_codes').select('id, used_count').eq('code', cleanCode).single();
      if (data) {
        await supabase
          .from('discount_codes')
          .update({ used_count: data.used_count + 1 })
          .eq('id', data.id);
      }
    } else {
      const list = getLocal<DiscountCode[]>('drftn_discount_codes');
      const idx = list.findIndex((d) => d.code.toUpperCase() === cleanCode);
      if (idx !== -1) {
        list[idx].used_count += 1;
        setLocal('drftn_discount_codes', list);
      }
    }
  },

  // -----------------------------------------------------------------------
  // SETTINGS
  // -----------------------------------------------------------------------
  async getSettings(): Promise<StoreSettings> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('settings').select('*');
      if (error) throw error;
      
      const settingsObj = { ...DEFAULT_SETTINGS };
      if (data) {
        data.forEach((row: { key: string; value: string }) => {
          if (row.key in settingsObj) {
            const k = row.key as keyof StoreSettings;
            if (k === 'free_shipping_threshold' || k === 'default_shipping_charge') {
              (settingsObj[k] as number) = Number(row.value);
            } else {
              (settingsObj[k] as string) = row.value;
            }
          }
        });
      }
      return settingsObj;
    } else {
      return getLocal<StoreSettings>('drftn_settings');
    }
  },

  async updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    if (isSupabaseConfigured() && supabase) {
      // Upsert individual key-value pairs
      const promises = Object.entries(updates).map(async ([key, value]) => {
        return supabase!.from('settings').upsert({ key, value: String(value), updated_at: new Date().toISOString() });
      });
      await Promise.all(promises);
      return this.getSettings();
    } else {
      const current = getLocal<StoreSettings>('drftn_settings');
      const updated = { ...current, ...updates };
      setLocal('drftn_settings', updated);
      return updated;
    }
  },

  // -----------------------------------------------------------------------
  // CONTACT SUBMISSIONS
  // -----------------------------------------------------------------------
  async createContactSubmission(sub: Omit<ContactSubmission, 'id'>): Promise<ContactSubmission> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('contact_submissions').insert([sub]).select().single();
      if (error) throw error;
      return data;
    } else {
      const list = getLocal<ContactSubmission[]>('drftn_contact_submissions');
      const newSub = { ...sub, id: `sub-${Date.now()}`, created_at: new Date().toISOString() };
      list.push(newSub);
      setLocal('drftn_contact_submissions', list);
      return newSub;
    }
  },

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('contact_submissions').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return getLocal<ContactSubmission[]>('drftn_contact_submissions').sort((a, b) => 
        new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
      );
    }
  }
};

export const db = dbService;

