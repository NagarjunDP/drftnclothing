'use client';

import React from 'react';
import ProductForm from '@/components/ProductForm';

export default function NewProductPage() {
  return (
    <div className="py-6">
      <ProductForm mode="create" />
    </div>
  );
}
