import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  ArrowUpRight,
  Plus,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Trash2,
} from 'lucide-react';

interface DashboardViewProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onAddProduct: (newProduct: Product) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  onUpdateStock,
  onAddProduct,
}) => {
  const { orders } = useCart();
  const { userProfile } = useAuth();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form states
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('520');
  const [newCategory, setNewCategory] = useState<'audio' | 'timepieces' | 'sculptures' | 'lighting'>('audio');
  const [newStock, setNewStock] = useState('20');
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState('/src/assets/images/product_audio_headphones_1790932718344.jpg');

  // Executive Dashboard Calculations
  const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'cancelled' ? o.total : 0), 0) + 48250;
  const totalOrdersCount = orders.length + 54;
  const aov = Math.round(totalRevenue / Math.max(1, totalOrdersCount));
  const totalStockUnits = products.reduce((acc, p) => acc + p.stock, 0);

  // Trend data points for monochrome SVG visualization
  const trendPoints =
    timeRange === '7d'
      ? [
          { label: 'Mon', val: 4200 },
          { label: 'Tue', val: 6800 },
          { label: 'Wed', val: 5100 },
          { label: 'Thu', val: 8400 },
          { label: 'Fri', val: 9900 },
          { label: 'Sat', val: 12400 },
          { label: 'Sun', val: 11100 },
        ]
      : timeRange === '30d'
      ? [
          { label: 'W1', val: 18400 },
          { label: 'W2', val: 24200 },
          { label: 'W3', val: 31000 },
          { label: 'W4', val: 48250 },
        ]
      : [
          { label: 'Jul', val: 62000 },
          { label: 'Aug', val: 84000 },
          { label: 'Sep', val: 112000 },
        ];

  const maxVal = Math.max(...trendPoints.map((p) => p.val));
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 30;

  const pointsString = trendPoints
    .map((pt, i) => {
      const x = paddingX + (i / (trendPoints.length - 1)) * (svgWidth - paddingX * 2);
      const y = svgHeight - paddingY - (pt.val / maxVal) * (svgHeight - paddingY * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const areaString = `${pointsString} ${svgWidth - paddingX},${svgHeight - paddingY} ${paddingX},${svgHeight - paddingY}`;

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newProd: Product = {
      id: `nova-${Date.now().toString(36)}`,
      title: newTitle,
      subtitle: 'Exclusive handcrafted edition in monochrome unibody design',
      description: newDescription || 'Precision architectural craftsmanship engineered for collectors.',
      price: parseFloat(newPrice) || 450,
      category: newCategory,
      stock: parseInt(newStock) || 15,
      rating: 4.95,
      materialFinish: 'matte-obsidian',
      imageUrl: newImage,
    };

    onAddProduct(newProd);
    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 space-y-10">
      
      {/* Editorial Header */}
      <div className="pb-6 border-b border-[#E5E5E5] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#777777] font-mono mb-2 uppercase tracking-wider">
            <span>Executive Operations</span>
            <span>·</span>
            <span>Ledger Intelligence</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-[#080808] tracking-tight">
            Commerce Analytics & Inventory
          </h1>
          <p className="text-xs text-[#777777] mt-1.5 max-w-xl">
            Real-time business performance metrics, order yield telemetry, and inventory allocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#080808] text-[#FFFFFF] rounded-xl text-xs font-medium hover:bg-[#171717] transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Piece</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Section 5 & 9: 3D tilt on hover & monochrome depth) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1: Gross Revenue */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider">
              Settled Revenue
            </span>
            <div className="p-1.5 rounded-lg bg-[#F8F9FB] border border-[#E5E5E5] text-[#080808]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#080808] tabular-nums">
            ${totalRevenue.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#171717]">
            <span className="font-semibold text-emerald-800">+18.4%</span>
            <span className="text-[#777777]">vs prior period</span>
          </div>
        </div>

        {/* KPI 2: Completed Orders */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider">
              Fulfilled Orders
            </span>
            <div className="p-1.5 rounded-lg bg-[#F8F9FB] border border-[#E5E5E5] text-[#080808]">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#080808] tabular-nums">
            {totalOrdersCount}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#171717]">
            <span className="font-semibold text-emerald-800">+12%</span>
            <span className="text-[#777777]">conversion yield</span>
          </div>
        </div>

        {/* KPI 3: Average Order Value */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider">
              Average Order Value
            </span>
            <div className="p-1.5 rounded-lg bg-[#F8F9FB] border border-[#E5E5E5] text-[#080808]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#080808] tabular-nums">
            ${aov.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#171717]">
            <span className="font-semibold text-emerald-800">High Tier</span>
            <span className="text-[#777777]">collector baseline</span>
          </div>
        </div>

        {/* KPI 4: Active Stock */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-mono text-[#777777] uppercase tracking-wider">
              Reserve Inventory
            </span>
            <div className="p-1.5 rounded-lg bg-[#F8F9FB] border border-[#E5E5E5] text-[#080808]">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#080808] tabular-nums">
            {totalStockUnits} <span className="text-xs font-normal text-[#777777]">Units</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-[#171717]">
            <span className="font-semibold text-[#080808]">{products.length} active SKUs</span>
          </div>
        </div>
      </div>

      {/* Sales Velocity Chart & Top Performers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Trend Chart (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E5E5E5] rounded-3xl p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#080808] uppercase tracking-wider font-mono">
                Acquisition Volume Curve
              </h3>
              <p className="text-xs text-[#777777] mt-0.5">Monochrome transaction velocity</p>
            </div>

            {/* Time interval filter buttons */}
            <div className="flex items-center gap-1 p-1 bg-[#F0F1F3] rounded-lg self-start sm:self-auto">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    timeRange === range
                      ? 'bg-[#FFFFFF] text-[#080808] shadow-2xs font-semibold'
                      : 'text-[#777777] hover:text-[#080808]'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Monochrome Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-48 overflow-visible"
            >
              <defs>
                <linearGradient id="monoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#171717" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#171717" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={svgWidth - paddingX}
                y2={paddingY}
                stroke="#F0F1F3"
                strokeWidth="1"
              />
              <line
                x1={paddingX}
                y1={svgHeight / 2}
                x2={svgWidth - paddingX}
                y2={svgHeight / 2}
                stroke="#F0F1F3"
                strokeWidth="1"
              />
              <line
                x1={paddingX}
                y1={svgHeight - paddingY}
                x2={svgWidth - paddingX}
                y2={svgHeight - paddingY}
                stroke="#E5E5E5"
                strokeWidth="1"
              />

              {/* Shaded Area */}
              <polygon points={areaString} fill="url(#monoGradient)" />

              {/* Trend Line */}
              <polyline
                points={pointsString}
                fill="none"
                stroke="#080808"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {trendPoints.map((pt, i) => {
                const x = paddingX + (i / (trendPoints.length - 1)) * (svgWidth - paddingX * 2);
                const y = svgHeight - paddingY - (pt.val / maxVal) * (svgHeight - paddingY * 2);
                return (
                  <g key={i} className="group cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      className="fill-[#FFFFFF] stroke-[#080808] stroke-2 group-hover:r-5 transition-all"
                    />
                    {/* Label below axis */}
                    <text
                      x={x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-[#777777]"
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Top Performing Pieces (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-3xl p-8 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#080808] uppercase tracking-wider font-mono mb-1">
              Top Yield Assets
            </h3>
            <p className="text-xs text-[#777777] mb-6">Distribution by collection demand</p>

            <div className="space-y-4">
              {products.slice(0, 4).map((prod, idx) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FB] border border-[#E5E5E5]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#777777]">0{idx + 1}</span>
                    <img
                      src={prod.imageUrl}
                      alt={prod.title}
                      className="w-10 h-10 object-cover rounded-lg bg-[#E5E5E5]"
                    />
                    <div>
                      <h4 className="text-xs font-semibold text-[#080808] leading-tight line-clamp-1">
                        {prod.title}
                      </h4>
                      <p className="text-[11px] text-[#777777] font-mono capitalize">
                        {prod.category} · {prod.stock} in reserve
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold font-mono text-[#080808] tabular-nums">
                    ${prod.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#F0F1F3] flex justify-between items-center text-xs text-[#777777]">
            <span>Average Margin Yield:</span>
            <span className="font-bold text-[#080808] font-mono">68.4%</span>
          </div>
        </div>
      </div>

      {/* Real-time Inventory Management Table */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-3xl p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#080808] uppercase tracking-wider font-mono">
              Reserve Inventory Ledger
            </h3>
            <p className="text-xs text-[#777777] mt-0.5">
              Live stock mutation and replenishment controls
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5E5E5] text-[11px] font-mono text-[#777777] uppercase tracking-wider">
                <th className="pb-3 font-semibold">SKU Identifier</th>
                <th className="pb-3 font-semibold">Piece Title</th>
                <th className="pb-3 font-semibold">Classification</th>
                <th className="pb-3 font-semibold">Retail Price</th>
                <th className="pb-3 font-semibold">Reserve Allocation</th>
                <th className="pb-3 font-semibold text-right">Quick Allocation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1F3]">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-[#F8F9FB] transition-colors">
                  <td className="py-4 font-mono font-medium text-[#080808]">
                    {p.id.toUpperCase()}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-9 h-9 object-cover rounded-md bg-[#E5E5E5]"
                      />
                      <span className="font-medium text-[#171717]">{p.title}</span>
                    </div>
                  </td>
                  <td className="py-4 font-mono capitalize text-[#777777]">{p.category}</td>
                  <td className="py-4 font-mono font-semibold tabular-nums text-[#080808]">
                    ${p.price.toLocaleString()}
                  </td>
                  <td className="py-4 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums font-bold text-[#080808]">{p.stock}</span>
                      {p.stock <= 5 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Critical
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-1 border border-[#E5E5E5] rounded-md bg-[#FFFFFF] p-0.5">
                      <button
                        onClick={() => onUpdateStock(p.id, Math.max(0, p.stock - 1))}
                        className="px-2 py-0.5 text-xs text-[#171717] hover:bg-[#F0F1F3] rounded-xs cursor-pointer transition-colors"
                        title="Reduce reserve by 1"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => onUpdateStock(p.id, p.stock + 5)}
                        className="px-2 py-0.5 text-xs text-[#171717] hover:bg-[#F0F1F3] rounded-xs cursor-pointer transition-colors"
                        title="Replenish reserve +5"
                      >
                        +5
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#080808]/60 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-lg bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-8 shadow-2xl z-10 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#080808] tracking-tight mb-1">
              Register New Architectural Piece
            </h3>
            <p className="text-xs text-[#777777] mb-6">
              Add a new luxury item to the live Firestore-backed product catalog.
            </p>

            <form onSubmit={handleCreateProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#171717] mb-1">
                  Design Piece Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Solis Ambient Transducer"
                  className="w-full px-3.5 py-2 text-xs bg-[#F8F9FB] border border-[#E5E5E5] rounded-lg text-[#080808] focus:outline-none focus:border-[#080808]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#171717] mb-1">
                    Classification
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-[#F8F9FB] border border-[#E5E5E5] rounded-lg text-[#080808] focus:outline-none focus:border-[#080808]"
                  >
                    <option value="audio">Audio</option>
                    <option value="timepieces">Timepieces</option>
                    <option value="sculptures">Sculptures</option>
                    <option value="lighting">Lighting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#171717] mb-1">
                    Retail Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F8F9FB] border border-[#E5E5E5] rounded-lg text-[#080808] focus:outline-none focus:border-[#080808]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#171717] mb-1">
                    Initial Reserve Stock
                  </label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#F8F9FB] border border-[#E5E5E5] rounded-lg text-[#080808] focus:outline-none focus:border-[#080808]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#171717] mb-1">
                    Visual Preset
                  </label>
                  <select
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8F9FB] border border-[#E5E5E5] rounded-lg text-[#080808] focus:outline-none focus:border-[#080808]"
                  >
                    <option value="/src/assets/images/product_audio_headphones_1790932718344.jpg">Headphone Silhouette</option>
                    <option value="/src/assets/images/product_smart_timepiece_1790932764661.jpg">Timepiece Silhouette</option>
                    <option value="/src/assets/images/product_sound_sculpture_1790932805879.jpg">Sculpture Silhouette</option>
                    <option value="/src/assets/images/product_desk_lamp_1790932817919.jpg">Luminaire Silhouette</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#171717] mb-1">
                  Architectural Description
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Material specs and design philosophy..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F8F9FB] border border-[#E5E5E5] rounded-lg text-[#080808] focus:outline-none focus:border-[#080808]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#777777] hover:text-[#080808] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#080808] text-[#FFFFFF] text-xs font-medium rounded-lg hover:bg-[#171717] transition-colors cursor-pointer"
                >
                  Publish Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
