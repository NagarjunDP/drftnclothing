'use client';

import React, { useEffect, useState } from 'react';
import ProductForm from '@/components/ProductForm';
import { db } from '@/lib/db';
import { Product } from '@/types';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ToastContainer';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const list = await db.getAllProducts();
        const found = list.find((p) => p.id === id);
        if (found) {
          setProduct(found);
        } else {
          addToast('Product not found in catalogue', 'error');
          router.push('/admin/products');
        }
      } catch (error) {
        console.error(error);
        addToast('Failed to fetch product details', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    if (id) {
      loadProduct();
    }
  }, [id, router, addToast]);

  if (isLoading) {
    return (
      <div className="py-12 text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="py-6">
      <ProductForm mode="edit" initialData={product} />
    </div>
  );
}
