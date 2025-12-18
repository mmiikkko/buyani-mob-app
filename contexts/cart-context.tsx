import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, type CartItem } from '@/lib/api';

interface CartContextType {
  cartCount: number;
  cartItems: CartItem[];
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateCartItem: (id: string, quantity: number) => Promise<boolean>;
  removeCartItem: (id: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      const token = await api.getToken();
      if (!token || token === 'demo-token-offline-mode') {
        setCartItems([]);
        setCartCount(0);
        return;
      }
      
      const items = await api.getCart();
      setCartItems(items);
      // Calculate number of unique products in cart (not total quantity)
      setCartCount(items.length);
    } catch (err: any) {
      console.log('Failed to refresh cart:', err?.message);
      // Don't reset cart on error - might be a temporary network issue
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: string, quantity: number = 1): Promise<boolean> => {
    try {
      await api.addToCart(productId, quantity);
      await refreshCart();
      return true;
    } catch (err: any) {
      console.error('Failed to add to cart:', err);
      return false;
    }
  }, [refreshCart]);

  const updateCartItem = useCallback(async (id: string, quantity: number): Promise<boolean> => {
    try {
      await api.updateCartItem(id, quantity);
      await refreshCart();
      return true;
    } catch (err: any) {
      console.error('Failed to update cart item:', err);
      return false;
    }
  }, [refreshCart]);

  const removeCartItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.removeCartItem(id);
      await refreshCart();
      return true;
    } catch (err: any) {
      console.error('Failed to remove cart item:', err);
      return false;
    }
  }, [refreshCart]);

  // Refresh cart on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        cartItems,
        loading,
        refreshCart,
        addToCart,
        updateCartItem,
        removeCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

