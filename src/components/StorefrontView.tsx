import React, { useState, useMemo } from 'react';
import { Product, ProductCategory, MaterialFinish } from '../types';
import { ProductCard } from './ProductCard';
import { Search, SlidersHorizontal, ArrowDown, ShieldCheck, Sparkles, Box, Compass } from 'lucide-react';

interface StorefrontViewProps {
  products: Product[];
  onInspectProduct: (product: Product) => void;
  onOpenVisualizer: (product: Product, finish: MaterialFinish) => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  products,
  onInspectProduct,
  onOpenVisualizer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'All Silhouettes' },
    { id: 'audio', label: 'Acoustics' },
    { id: 'timepieces', label: 'Chronometers' },
    { id: 'sculptures', label: 'Sculptures' },
    { id: 'lighting', label: 'Luminaires' },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesQuery =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="relative z-10">
      
      {/* 1. Architectural Storefront Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="max-w-3xl">
          {/* Zero-Pill Unboxed Text Kicker */}
          <div className="flex items-center gap-2 text-xs font-mono text-[#777777] mb-4 uppercase tracking-widest">
            <span>Volume 04</span>
            <span aria-hidden="true">·</span>
            <span>Monochrome Architecture</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#171717]">Edition of 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold font-display tracking-tight text-[#080808] leading-[1.08] text-balance">
            Precision industrial design, sculpted in absolute black and white.
          </h1>

          <p className="mt-6 text-sm sm:text-base text-[#777777] leading-relaxed max-w-xl">
            A radical departure from transient tech aesthetics. Handcrafted planar acoustics, sintered zirconia ceramics, and monolithic lighting designed to endure for generations.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#catalog"
              className="px-6 py-3 rounded-xl bg-[#080808] text-[#FFFFFF] text-xs font-medium hover:bg-[#171717] transition-all cursor-pointer shadow-md inline-flex items-center gap-2 active:scale-98"
            >
              <span>Explore Collection</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => onOpenVisualizer(products[0], 'polished-chrome')}
              className="px-5 py-3 rounded-xl bg-[#FFFFFF] border border-[#E5E5E5] text-[#171717] text-xs font-medium hover:border-[#080808] transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-2"
            >
              <Compass className="w-3.5 h-3.5 text-[#171717]" />
              <span>Launch 3D Spatial Visualizer</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Catalog & Filter Controls */}
      <section id="catalog" className="max-w-7xl mx-auto px-6 py-10 scroll-mt-24">
        
        {/* Controls Bar: Search + Category Buttons */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5]">
          
          {/* Segmented Category Buttons (Functional filter controls, zero pills) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F0F1F3] rounded-xl overflow-x-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#FFFFFF] text-[#080808] shadow-2xs font-semibold'
                    : 'text-[#777777] hover:text-[#080808]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search silhouette or material..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl text-[#080808] placeholder:text-[#777777] focus:outline-none focus:border-[#080808] transition-all shadow-2xs"
            />
            <Search className="w-3.5 h-3.5 text-[#777777] absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Product Count & Notice */}
        <div className="py-4 flex justify-between items-center text-xs font-mono text-[#777777]">
          <span>
            Displaying {filteredProducts.length} {filteredProducts.length === 1 ? 'silhouette' : 'silhouettes'}
          </span>
          <span>Tactile 3D Tilt Enabled</span>
        </div>

        {/* Product Grid (3 cols desktop, 2 cols tablet, 1 col mobile) */}
        {filteredProducts.length === 0 ? (
          <div className="py-24 text-center bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] p-8">
            <p className="text-sm font-medium text-[#080808]">No matching silhouettes found</p>
            <p className="text-xs text-[#777777] mt-1">Try resetting your filter or search criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 text-xs font-medium text-[#080808] bg-[#F0F1F3] hover:bg-[#E5E5E5] rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onInspect={onInspectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* 3. Craftsmanship & Architectural Philosophy */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-[#E5E5E5] mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="text-xs font-mono text-[#777777] uppercase tracking-wider mb-2">
              01. Material Sintering
            </div>
            <h3 className="text-lg font-bold text-[#080808] tracking-tight">
              Dense Zirconia & Basalt
            </h3>
            <p className="text-xs text-[#777777] mt-2 leading-relaxed">
              Every structural frame is diamond-cut from solid sintered blanks, achieving Vickers hardness ratings rivaling sapphire crystals.
            </p>
          </div>

          <div>
            <div className="text-xs font-mono text-[#777777] uppercase tracking-wider mb-2">
              02. Acoustic Coherence
            </div>
            <h3 className="text-lg font-bold text-[#080808] tracking-tight">
              Zero Internal Resonance
            </h3>
            <p className="text-xs text-[#777777] mt-2 leading-relaxed">
              Chambers are computed with algorithmic cavity damping to eliminate harmonic standing waves, preserving uncolored musical purity.
            </p>
          </div>

          <div>
            <div className="text-xs font-mono text-[#777777] uppercase tracking-wider mb-2">
              03. Digital Ledger
            </div>
            <h3 className="text-lg font-bold text-[#080808] tracking-tight">
              Cloud Database Verified
            </h3>
            <p className="text-xs text-[#777777] mt-2 leading-relaxed">
              Every serial number is permanently anchored into a secure Firestore ledger, guaranteeing lifelong authenticity and transferability.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
