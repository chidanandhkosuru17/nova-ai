import React, { useState } from 'react';
import { Product, MaterialFinish } from '../types';
import { useCart } from '../context/CartContext';
import { X, ShoppingBag, ShieldCheck, Check, Sparkles, Layers } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenVisualizer: (product: Product, finish: MaterialFinish) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenVisualizer,
}) => {
  if (!product) return null;

  const { addToCart } = useCart();
  const [selectedFinish, setSelectedFinish] = useState<MaterialFinish>(
    product.materialFinish || 'matte-obsidian'
  );
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const finishes: { id: MaterialFinish; label: string; swatch: string }[] = [
    { id: 'matte-obsidian', label: 'Matte Obsidian', swatch: 'bg-[#171717] border-[#080808]' },
    { id: 'polished-chrome', label: 'Polished Chrome', swatch: 'bg-gradient-to-tr from-[#9CA3AF] via-[#FFFFFF] to-[#9CA3AF] border-[#D1D5DB]' },
    { id: 'ceramic-white', label: 'Pure Ceramic', swatch: 'bg-[#FFFFFF] border-[#E5E5E5]' },
    { id: 'brushed-steel', label: 'Brushed Steel', swatch: 'bg-[#6B7280] border-[#4B5563]' },
  ];

  const handleAddToCart = () => {
    addToCart(product, selectedFinish, quantity);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#080808]/65 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-4xl bg-[#FFFFFF] border border-[#E5E5E5] rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col md:flex-row">
        
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 text-[#777777] hover:text-[#080808] bg-[#FFFFFF]/80 backdrop-blur-xs rounded-full border border-[#E5E5E5] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Imagery & 3D Visualizer Trigger */}
        <div className="md:w-1/2 bg-[#F8F9FB] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E5E5E5]">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FFFFFF] border border-[#E5E5E5] shadow-xs p-4 flex items-center justify-center">
            <img
              src={product.imageUrl}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-[#777777] font-mono">
              <span>SKU: {product.id.toUpperCase()}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenVisualizer(product, selectedFinish);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium bg-[#FFFFFF] hover:bg-[#F0F1F3] text-[#080808] border border-[#E5E5E5] rounded-lg transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-[#171717]" />
              <span>Launch 3D Spatial Studio</span>
            </button>
          </div>
        </div>

        {/* Right Side: Contiguous Purchase Module */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Category / Metadata */}
            <div className="flex items-center gap-2 text-xs text-[#777777] mb-2 font-mono">
              <span className="uppercase">{product.category}</span>
              <span>·</span>
              <span>Edition of 2026</span>
              <span>·</span>
              <span className="text-[#171717]">{product.stock > 0 ? 'Ready for Dispatch' : 'Backordered'}</span>
            </div>

            <h2 className="text-2xl font-bold text-[#080808] tracking-tight leading-snug">
              {product.title}
            </h2>

            <div className="mt-2 text-2xl font-mono font-bold text-[#080808] tabular-nums">
              ${product.price.toLocaleString()}
            </div>

            <p className="mt-4 text-xs text-[#777777] leading-relaxed">
              {product.description}
            </p>

            {/* Material Finish Selection */}
            <div className="mt-6">
              <label className="block text-xs font-semibold text-[#171717] mb-2 uppercase tracking-wider font-mono">
                Material Finish: <span className="font-sans normal-case text-[#777777]">{finishes.find(f => f.id === selectedFinish)?.label}</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {finishes.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFinish(f.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      selectedFinish === f.id
                        ? 'border-[#080808] bg-[#F8F9FB] shadow-xs'
                        : 'border-[#E5E5E5] hover:border-[#777777]'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full border ${f.swatch}`} />
                    <span className="text-[#171717]">{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="mt-6 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono">
                Quantity
              </span>
              <div className="flex items-center border border-[#E5E5E5] rounded-lg bg-[#F8F9FB]">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-sm font-mono text-[#171717] hover:bg-[#FFFFFF] rounded-l-lg transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 text-xs font-mono tabular-nums text-[#080808]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-sm font-mono text-[#171717] hover:bg-[#FFFFFF] rounded-r-lg transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Module */}
          <div className="mt-8 pt-6 border-t border-[#F0F1F3]">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-3.5 px-6 rounded-xl bg-[#080808] hover:bg-[#171717] text-[#FFFFFF] text-xs font-medium transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md active:scale-98"
            >
              {addedNotice ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Item Stored in Cart</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Acquire for ${(product.price * quantity).toLocaleString()}</span>
                </>
              )}
            </button>

            <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-[#777777]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#171717]" />
                Lifetime Guarantee
              </span>
              <span>·</span>
              <span>Express Insured Transit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
