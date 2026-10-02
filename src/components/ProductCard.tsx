import React, { useRef, useState } from 'react';
import { Product, MaterialFinish } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Eye, Star } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onInspect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onInspect }) => {
  const { addToCart } = useCart();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  // 3D Card Tilt Math on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, product.materialFinish || 'matte-obsidian', 1);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 1400);
  };

  const formatCategory = (cat: string) => {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onInspect(product)}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(-4px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="group relative bg-[#FFFFFF] rounded-2xl border border-[#E5E5E5] hover:border-[#171717]/40 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image Stage (65-75% visual dominance) */}
      <div className="relative aspect-4/3 w-full bg-[#F0F1F3]/50 overflow-hidden flex items-center justify-center p-6">
        <img
          src={product.imageUrl}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-xl transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Floating 3D Inspect Action Badge */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#080808]/90 text-[#FFFFFF] text-[11px] font-medium backdrop-blur-xs shadow-xs">
            <Eye className="w-3 h-3" />
            <span>3D Studio</span>
          </span>
        </div>

        {/* Stock Alert kicker if low stock */}
        {product.stock <= 5 && (
          <div className="absolute bottom-4 left-4">
            <span className="text-[11px] font-mono text-[#171717] bg-[#FFFFFF]/90 px-2 py-0.5 rounded-sm border border-[#E5E5E5]">
              Only {product.stock} units remaining
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          {/* Zero-Pill Unboxed Metadata with Typographic Separator */}
          <div className="flex items-center gap-2 text-xs text-[#777777] mb-2 font-mono">
            <span>{formatCategory(product.category)}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-[#171717]">
              <Star className="w-3 h-3 fill-[#171717] text-[#171717]" />
              <span className="tabular-nums">{product.rating?.toFixed(2) || '4.95'}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{product.stock > 0 ? 'In Stock' : 'Preorder'}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-[#080808] tracking-tight group-hover:text-[#171717] transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Subtitle kicker */}
          {product.subtitle && (
            <p className="text-xs text-[#777777] mt-1 line-clamp-1 leading-relaxed">
              {product.subtitle}
            </p>
          )}
        </div>

        {/* Price & Primary Interactive Button */}
        <div className="mt-5 pt-4 border-t border-[#F0F1F3] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#777777] block font-mono">Edition Unit</span>
            <span className="text-lg font-bold text-[#080808] font-mono tabular-nums tracking-tight">
              ${product.price.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#080808] hover:bg-[#171717] text-[#FFFFFF] text-xs font-medium transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{addedNotice ? 'Added' : 'Acquire'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
