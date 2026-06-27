import { db } from './src/db/index.js';
import * as schema from './src/db/schema.js';

async function main() {
  const products = await db.select().from(schema.products);
  const categories = await db.select().from(schema.categories);
  console.log('Products length:', products.length);
  console.log('Categories length:', categories.length);
  process.exit(0);
}
main();
