import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, DiscountCode } from '../types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  discountCode: DiscountCode | null;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, quantity: number) => void;
  clearCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  applyDiscount: (code: DiscountCode | null) => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      discountCode: null,

      addItem: (item, quantity = 1) => {
        const currentItems = get().items;
        const existingIdx = currentItems.findIndex(
          (i) => i.id === item.id && i.size === item.size
        );

        if (existingIdx !== -1) {
          const updatedItems = [...currentItems];
          updatedItems[existingIdx].quantity += quantity;
          set({ items: updatedItems, isOpen: true });
        } else {
          set({
            items: [...currentItems, { ...item, quantity }],
            isOpen: true, // Automatically slide drawer open on add
          });
        }
      },

      removeItem: (id, size) => {
        set({
          items: get().items.filter((i) => !(i.id === id && i.size === size)),
        });
      },

      updateQuantity: (id, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id, size);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], discountCode: null }),
      
      setIsOpen: (isOpen) => set({ isOpen }),
      
      applyDiscount: (discountCode) => set({ discountCode }),

      getCartTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getCartCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'drftn-cart-storage', // Key for localStorage persistence
    }
  )
);
