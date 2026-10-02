export type MaterialFinish = 'matte-obsidian' | 'polished-chrome' | 'ceramic-white' | 'brushed-steel';

export type ProductCategory = 'audio' | 'timepieces' | 'sculptures' | 'lighting' | 'accessories';

export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  rating?: number;
  materialFinish?: MaterialFinish;
  imageUrl: string;
}

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  price: number;
  quantity: number;
  materialFinish: MaterialFinish;
  imageUrl: string;
}

export type OrderStatus = 'processing' | 'assembled' | 'dispatched' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  customerName?: string;
  customerEmail: string;
  total: number;
  status: OrderStatus;
  trackingNumber?: string;
  shippingAddress?: string;
  createdAt: string;
  items?: CartItem[];
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'customer' | 'merchant' | 'admin';
  createdAt?: string;
}

export type AppView = 'store' | 'orders' | 'dashboard' | 'visualizer';
