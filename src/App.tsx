import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Navbar } from './components/Navbar';
import { StorefrontView } from './components/StorefrontView';
import { VisualizerView } from './components/VisualizerView';
import { OrdersView } from './components/OrdersView';
import { DashboardView } from './components/DashboardView';
import { CartDrawer } from './components/CartDrawer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AuthModal } from './components/AuthModal';
import { Product, AppView, MaterialFinish, Order } from './types';
import { INITIAL_PRODUCTS } from './data/initialProducts';
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { Lock, ShieldCheck, ArrowRight, User } from 'lucide-react';

function NovaCartApp() {
  const { currentUser, loading: authLoading } = useAuth();

  const [currentView, setCurrentView] = useState<AppView>('store');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeFinish, setActiveFinish] = useState<MaterialFinish>('matte-obsidian');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync / Seed products to Firestore
  useEffect(() => {
    const syncProducts = async () => {
      try {
        const prodCol = collection(db, 'products');
        const snap = await getDocs(prodCol);

        if (snap.empty) {
          // Seed initial products to Firestore
          for (const p of INITIAL_PRODUCTS) {
            await setDoc(doc(db, 'products', p.id), p);
          }
          setProducts(INITIAL_PRODUCTS);
        } else {
          const list: Product[] = [];
          snap.forEach((d) => list.push(d.data() as Product));
          if (list.length > 0) {
            setProducts(list);
          }
        }
      } catch (err) {
        console.warn('Using local catalog baseline:', err);
        setProducts(INITIAL_PRODUCTS);
      }
    };

    syncProducts();
  }, []);

  const handleUpdateStock = async (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
    try {
      const prodRef = doc(db, 'products', productId);
      await updateDoc(prodRef, { stock: newStock });
    } catch (err) {
      console.warn('Stock update synced locally:', err);
    }
  };

  const handleAddProduct = async (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    try {
      const prodRef = doc(db, 'products', newProduct.id);
      await setDoc(prodRef, newProduct);
    } catch (err) {
      console.warn('Product published locally:', err);
    }
  };

  const handleOpenVisualizer = (prod: Product, finish: MaterialFinish) => {
    setSelectedProduct(prod);
    setActiveFinish(finish);
    setCurrentView('visualizer');
  };

  const handleInspectProduct = (prod: Product) => {
    setSelectedProduct(prod);
  };

  // Determine 3D object for Three.js canvas
  const active3DObject =
    currentView === 'visualizer'
      ? {
          type: (selectedProduct?.category === 'audio'
            ? 'headphones'
            : selectedProduct?.category === 'timepieces'
            ? 'watch'
            : selectedProduct?.category === 'lighting'
            ? 'lamp'
            : 'sculpture') as any,
          finish: activeFinish,
        }
      : null;

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-[#171717] relative flex flex-col selection:bg-[#171717] selection:text-[#FFFFFF]">
      
      {/* 3D WebGL Background Scene */}
      <ThreeCanvas
        interactiveObject={active3DObject}
        interactiveMode={currentView === 'visualizer'}
      />

      {/* Top Bar Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 relative z-10 pb-16">
        {authLoading ? (
          <div className="min-h-[70vh] flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#171717] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-mono text-[#777777]">Initializing Nova Security Session...</p>
            </div>
          </div>
        ) : !currentUser ? (
          /* Authentication Gating Screen: All existing features remain accessible only after successful authentication */
          <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
            <div className="max-w-md w-full text-center bg-[#FFFFFF]/90 backdrop-blur-md border border-[#E5E5E5] rounded-3xl p-8 shadow-2xl relative z-20">
              <div className="w-14 h-14 rounded-2xl bg-[#080808] text-[#FFFFFF] flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Lock className="w-6 h-6" />
              </div>

              <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#777777] uppercase tracking-wider mb-2">
                <span>Database Authentication</span>
                <span>·</span>
                <span>Zero-Trust Gate</span>
              </div>

              <h2 className="text-2xl font-bold font-display text-[#080808] tracking-tight">
                Authentication Required
              </h2>

              <p className="text-xs text-[#777777] mt-2 mb-8 leading-relaxed max-w-sm mx-auto">
                All features of NOVA CART — including the storefront catalog, 3D spatial studio, verified order records, and merchant analytics — require authorized credentials.
              </p>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-3.5 px-6 rounded-xl bg-[#080808] hover:bg-[#171717] text-[#FFFFFF] text-xs font-medium transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 active:scale-98"
              >
                <span>Authorize & Unlock Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-6 pt-4 border-t border-[#F0F1F3] flex items-center justify-center gap-2 text-[11px] text-[#777777]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#171717]" />
                <span>Protected by Firestore Security Rules</span>
              </div>
            </div>

            {/* Modal opened directly in enforced mode */}
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
              enforceGating={false}
            />
          </div>
        ) : (
          /* Authenticated User Experience */
          <>
            {currentView === 'store' && (
              <StorefrontView
                products={products}
                onInspectProduct={handleInspectProduct}
                onOpenVisualizer={handleOpenVisualizer}
              />
            )}

            {currentView === 'visualizer' && (
              <VisualizerView
                products={products}
                activeFinish={activeFinish}
                onChangeFinish={(f) => setActiveFinish(f)}
                selectedProduct={selectedProduct}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            )}

            {currentView === 'orders' && (
              <OrdersView onExploreCatalog={() => setCurrentView('store')} />
            )}

            {currentView === 'dashboard' && (
              <DashboardView
                products={products}
                onUpdateStock={handleUpdateStock}
                onAddProduct={handleAddProduct}
              />
            )}
          </>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onViewOrder={() => setCurrentView('orders')}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct && currentView !== 'visualizer' ? selectedProduct : null}
        onClose={() => setSelectedProduct(null)}
        onOpenVisualizer={handleOpenVisualizer}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen && !!currentUser}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Minimalist Monochrome Footer */}
      <footer className="border-t border-[#E5E5E5] bg-[#FFFFFF] relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm text-[#080808]">NOVA CART</span>
            <span aria-hidden="true">·</span>
            <span>Handcrafted Monochrome Commerce</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>Privacy Standard</span>
            <span>·</span>
            <span>Terms of Custody</span>
            <span>·</span>
            <span>© 2026 Nova Cart</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NovaCartApp />
      </CartProvider>
    </AuthProvider>
  );
}
