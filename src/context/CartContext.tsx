import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { useAuth } from './AuthContext';
import { CartItem, Order, Product, MaterialFinish } from '../types';
import confetti from 'canvas-confetti';

interface CartContextType {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, finish?: MaterialFinish, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  orders: Order[];
  loadingOrders: boolean;
  placeOrder: (shippingDetails: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    email: string;
  }) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Sync cart from Firestore when user logs in
  useEffect(() => {
    if (!currentUser) {
      setItems([]);
      return;
    }

    const loadRemoteCart = async () => {
      try {
        const cartRef = doc(db, 'carts', currentUser.uid);
        const cartSnap = await getDoc(cartRef);
        if (cartSnap.exists()) {
          const data = cartSnap.data();
          if (Array.isArray(data.items)) {
            setItems(data.items);
          }
        }
      } catch (err) {
        console.warn('Could not sync remote cart, using memory cart:', err);
      }
    };

    loadRemoteCart();
  }, [currentUser]);

  // Persist cart to Firestore when modified
  const persistCart = async (newItems: CartItem[]) => {
    setItems(newItems);
    if (!currentUser) return;
    try {
      const cartRef = doc(db, 'carts', currentUser.uid);
      await setDoc(cartRef, {
        userId: currentUser.uid,
        items: newItems,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Error saving cart to Firestore:', err);
    }
  };

  // Real-time listener for user orders
  useEffect(() => {
    if (!currentUser) {
      setOrders([]);
      return;
    }

    setLoadingOrders(true);
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('userId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const remoteOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          remoteOrders.push(docSnap.data() as Order);
        });
        // Sort descending by creation date
        remoteOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(remoteOrders);
        setLoadingOrders(false);
      },
      (error) => {
        setLoadingOrders(false);
        // Non-breaking fallback for mock or offline
        console.warn('Orders listener error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const addToCart = (product: Product, finish?: MaterialFinish, quantity: number = 1) => {
    const selectedFinish = finish || product.materialFinish || 'matte-obsidian';
    const itemId = `${product.id}-${selectedFinish}`;

    const existingIndex = items.findIndex((item) => item.id === itemId);
    let updated: CartItem[];

    if (existingIndex > -1) {
      updated = [...items];
      updated[existingIndex].quantity += quantity;
    } else {
      updated = [
        ...items,
        {
          id: itemId,
          productId: product.id,
          title: product.title,
          price: product.price,
          quantity,
          materialFinish: selectedFinish,
          imageUrl: product.imageUrl,
        },
      ];
    }
    persistCart(updated);
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    const updated = items.filter((item) => item.id !== itemId);
    persistCart(updated);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    const updated = items.map((item) => (item.id === itemId ? { ...item, quantity } : item));
    persistCart(updated);
  };

  const clearCart = () => {
    persistCart([]);
  };

  const cartCount = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.price * item.quantity, 0), [items]);

  // Complimentary shipping on orders above $500
  const shipping = useMemo(() => (subtotal > 500 || subtotal === 0 ? 0 : 45), [subtotal]);

  const tax = useMemo(() => Math.round(subtotal * 0.08 * 100) / 100, [subtotal]);

  const total = useMemo(() => subtotal + shipping + tax, [subtotal, shipping, tax]);

  const placeOrder = async (shippingDetails: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    email: string;
  }): Promise<Order> => {
    if (!currentUser) throw new Error('Authentication required to complete purchase.');
    if (items.length === 0) throw new Error('Your cart is empty.');

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `NV-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newOrder: Order = {
      id: orderId,
      userId: currentUser.uid,
      customerName: shippingDetails.fullName,
      customerEmail: shippingDetails.email,
      total,
      status: 'processing',
      trackingNumber,
      shippingAddress: `${shippingDetails.address}, ${shippingDetails.city} ${shippingDetails.postalCode}`,
      createdAt: new Date().toISOString(),
      items: [...items],
    };

    try {
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, newOrder);
    } catch (err) {
      console.warn('Failed saving order to remote Firestore, saving locally:', err);
      // Fallback local update
      setOrders((prev) => [newOrder, ...prev]);
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#080808', '#777777', '#FFFFFF', '#D1D5DB'],
      });
    } catch {
      // ignore in environments without canvas
    }

    clearCart();
    setIsCartOpen(false);
    return newOrder;
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: 'cancelled' });
    } catch (err) {
      console.warn('Error updating order status:', err);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)));
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        subtotal,
        shipping,
        tax,
        total,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        orders,
        loadingOrders,
        placeOrder,
        cancelOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
