import React, { useState } from 'react';
import { Product, MaterialFinish } from '../types';
import { useCart } from '../context/CartContext';
import { RotateCcw, ShoppingBag, Eye, Sparkles, Layers, ShieldCheck } from 'lucide-react';

interface VisualizerViewProps {
  products: Product[];
  activeFinish: MaterialFinish;
  onChangeFinish: (finish: MaterialFinish) => void;
  selectedProduct: Product | null;
  onSelectProduct: (p: Product) => void;
}

export const VisualizerView: React.FC<VisualizerViewProps> = ({
  products,
  activeFinish,
  onChangeFinish,
  selectedProduct,
  onSelectProduct,
}) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const currentPiece = selectedProduct || products[0];

  const finishes: { id: MaterialFinish; label: string; swatch: string; desc: string }[] = [
    {
      id: 'matte-obsidian',
      label: 'Matte Obsidian',
      swatch: 'bg-[#171717] border-[#080808]',
      desc: 'Micro-textured volcanic basalt coating with zero specular glare.',
    },
    {
      id: 'polished-chrome',
      label: 'Polished Mirror Chrome',
      swatch: 'bg-gradient-to-tr from-[#9CA3AF] via-[#FFFFFF] to-[#9CA3AF] border-[#D1D5DB]',
      desc: 'Electro-plated nickel chrome substrate with optical mirror reflectivity.',
    },
    {
      id: 'ceramic-white',
      label: 'Sintered Zirconia Ceramic',
      swatch: 'bg-[#FFFFFF] border-[#E5E5E5]',
      desc: 'High-density pure white ceramic baked at 1,500°C for extreme hardness.',
    },
    {
      id: 'brushed-steel',
      label: 'Brushed Aerospace Steel',
      swatch: 'bg-[#6B7280] border-[#4B5563]',
      desc: 'Directional micro-grain hairline brushed finish with passivation layer.',
    },
  ];

  const handleAddConfigured = () => {
    addToCart(currentPiece, activeFinish, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
      
      {/* Studio Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#E5E5E5] gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#777777] font-mono mb-2 uppercase tracking-wider">
            <span>Spatial Engine</span>
            <span>·</span>
            <span>WebGL 3D Studio</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-[#080808] tracking-tight">
            Interactive Material Visualizer
          </h1>
          <p className="text-xs text-[#777777] mt-1.5 max-w-xl">
            Inspect physical reflection models, material roughness, and form factor in full 3D spatial orbit.
          </p>
        </div>

        {/* Product Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F0F1F3] rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                currentPiece.id === p.id
                  ? 'bg-[#FFFFFF] text-[#080808] shadow-2xs font-semibold'
                  : 'text-[#777777] hover:text-[#080808]'
              }`}
            >
              {p.title.split(' ')[0]} {p.title.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Studio Floor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main 3D Viewport Backdrop Area (Left 8 Cols) */}
        <div className="lg:col-span-8 bg-[#FFFFFF]/80 backdrop-blur-md border border-[#E5E5E5] rounded-3xl p-8 shadow-md relative min-h-[500px] flex flex-col justify-between overflow-hidden">
          
          {/* Top HUD Overlay */}
          <div className="flex justify-between items-center z-20">
            <div className="flex items-center gap-2 bg-[#F8F9FB] border border-[#E5E5E5] px-3 py-1.5 rounded-lg text-xs font-mono text-[#080808]">
              <Layers className="w-3.5 h-3.5 text-[#171717]" />
              <span>3D Orbit Active: Drag to rotate view</span>
            </div>

            <div className="text-xs font-mono text-[#777777]">
              FPS: <span className="text-[#080808] font-bold">60</span> · AA: 2x
            </div>
          </div>

          {/* Centered Guide Callout */}
          <div className="py-24 text-center z-10 pointer-events-none select-none">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF]/90 border border-[#E5E5E5] text-[11px] text-[#777777] font-mono shadow-xs mb-2">
              <Eye className="w-3.5 h-3.5 text-[#171717]" />
              Click & drag anywhere to inspect geometry
            </div>
          </div>

          {/* Bottom HUD Overlay */}
          <div className="z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-[#F0F1F3]">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#777777]">
                Selected Silhouette
              </span>
              <h3 className="text-base font-bold text-[#080808]">
                {currentPiece.title}
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-lg font-bold font-mono text-[#080808] tabular-nums">
                ${currentPiece.price.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={handleAddConfigured}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#080808] text-[#FFFFFF] text-xs font-medium rounded-xl hover:bg-[#171717] transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{added ? 'Configured & Added' : 'Acquire Configuration'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Configuration Inspector Panel (4 Cols) */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-[#E5E5E5] rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#080808] uppercase tracking-wider font-mono mb-1">
              Material Substrate
            </h3>
            <p className="text-xs text-[#777777]">
              Physically-based surface material shaders
            </p>
          </div>

          {/* Finish Selection List */}
          <div className="space-y-3">
            {finishes.map((f) => (
              <div
                key={f.id}
                onClick={() => onChangeFinish(f.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  activeFinish === f.id
                    ? 'border-[#080808] bg-[#F8F9FB] shadow-xs'
                    : 'border-[#E5E5E5] hover:border-[#777777]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-4 h-4 rounded-full border ${f.swatch}`} />
                    <span className="text-xs font-semibold text-[#080808]">{f.label}</span>
                  </div>
                  {activeFinish === f.id && (
                    <span className="text-[10px] font-mono text-[#080808] bg-[#FFFFFF] border border-[#E5E5E5] px-1.5 py-0.5 rounded-sm">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#777777] leading-relaxed pl-6">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Technical Specs Breakdown */}
          <div className="pt-4 border-t border-[#F0F1F3] space-y-2.5 text-xs font-mono">
            <div className="flex justify-between text-[#777777]">
              <span>Specular Coefficient</span>
              <span className="text-[#080808]">
                {activeFinish === 'polished-chrome' ? '0.95 (Mirror)' : '0.12 (Matte)'}
              </span>
            </div>
            <div className="flex justify-between text-[#777777]">
              <span>Surface Roughness</span>
              <span className="text-[#080808]">
                {activeFinish === 'matte-obsidian' ? '0.75' : '0.10'}
              </span>
            </div>
            <div className="flex justify-between text-[#777777]">
              <span>Z-Depth Tolerance</span>
              <span className="text-[#080808]">±0.02 mm</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleAddConfigured}
              className="w-full py-3 px-4 bg-[#080808] text-[#FFFFFF] text-xs font-medium rounded-xl hover:bg-[#171717] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Acquire this Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
