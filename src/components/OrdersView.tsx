import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';
import { Box, Truck, CheckCircle2, Clock, ShieldAlert, ArrowRight, ExternalLink } from 'lucide-react';

interface OrdersViewProps {
  onExploreCatalog: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onExploreCatalog }) => {
  const { orders, loadingOrders, cancelOrder } = useCart();
  const { currentUser } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0] || null;

  const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'processing', label: 'Authorized', desc: 'Securely logged in Firestore & verified' },
    { key: 'assembled', label: 'Hand Crafting', desc: 'Sintered zirconia & chassis precision assembly' },
    { key: 'dispatched', label: 'Transit', desc: 'In custody of White-Glove Courier' },
    { key: 'delivered', label: 'Fulfilled', desc: 'Safely delivered to designated address' },
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'processing') return 0;
    if (status === 'assembled') return 1;
    if (status === 'dispatched') return 2;
    if (status === 'delivered') return 3;
    return -1;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
      
      {/* Editorial Header */}
      <div className="mb-10 pb-6 border-b border-[#E5E5E5] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#777777] font-mono mb-2 uppercase tracking-wider">
            <span>Client Custody</span>
            <span>·</span>
            <span>Verified Orders Ledger</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-[#080808] tracking-tight">
            Acquisitions & Tracking
          </h1>
          <p className="text-xs text-[#777777] mt-1.5 max-w-xl">
            Real-time status synchronization direct from your persistent database ledger.
          </p>
        </div>

        <button
          onClick={onExploreCatalog}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#171717] hover:border-[#080808] transition-colors cursor-pointer self-start md:self-auto shadow-2xs"
        >
          <span>Acquire More Pieces</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {loadingOrders ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-[#171717] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-[#777777]">Synchronizing order ledger...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-3xl p-16 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-[#F8F9FB] border border-[#E5E5E5] flex items-center justify-center mx-auto mb-4 text-[#777777]">
            <Box className="w-7 h-7 text-[#080808]" />
          </div>
          <h3 className="text-lg font-bold text-[#080808] tracking-tight">No Acquisitions Recorded</h3>
          <p className="text-xs text-[#777777] mt-2 mb-6 max-w-md mx-auto leading-relaxed">
            Your personal vault currently holds no purchase transactions. Explore the storefront to place your first piece into production.
          </p>
          <button
            onClick={onExploreCatalog}
            className="px-5 py-2.5 bg-[#080808] text-[#FFFFFF] text-xs font-medium rounded-xl hover:bg-[#171717] transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <span>Explore Curated Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Orders List (Left Column) */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono px-1">
              Order Records ({orders.length})
            </h3>
            {orders.map((ord) => {
              const isSelected = activeOrder?.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFFFFF] border-[#080808] shadow-md ring-1 ring-[#080808]'
                      : 'bg-[#FFFFFF] border-[#E5E5E5] hover:border-[#777777]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold font-mono text-[#080808] tracking-tight">
                        {ord.id}
                      </span>
                      <div className="text-[11px] text-[#777777] font-mono mt-0.5">
                        {new Date(ord.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-sm capitalize border ${
                        ord.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : ord.status === 'cancelled'
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-[#F8F9FB] text-[#080808] border-[#E5E5E5]'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#F0F1F3] text-xs">
                    <span className="text-[#777777]">
                      {ord.items?.length || 1} {ord.items?.length === 1 ? 'item' : 'items'}
                    </span>
                    <span className="font-bold font-mono tabular-nums text-[#080808]">
                      ${ord.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Timeline & Inspection (Right Column) */}
          {activeOrder && (
            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E5E5E5] rounded-3xl p-8 shadow-xs space-y-8">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#F0F1F3] gap-4">
                <div>
                  <span className="text-[11px] text-[#777777] font-mono uppercase tracking-wider">
                    Transaction Focus
                  </span>
                  <h3 className="text-xl font-bold font-mono text-[#080808]">
                    {activeOrder.id}
                  </h3>
                  <p className="text-xs text-[#777777] mt-0.5 font-mono">
                    Tracking Identifier: <span className="text-[#080808] font-semibold">{activeOrder.trackingNumber || 'NV-PENDING'}</span>
                  </p>
                </div>

                {activeOrder.status === 'processing' && (
                  <button
                    onClick={() => cancelOrder(activeOrder.id)}
                    className="self-start sm:self-auto px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              {/* Real-time Tracking Steps */}
              <div>
                <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono mb-6">
                  Fulfillment Status Tracker
                </h4>

                {activeOrder.status === 'cancelled' ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <span>This acquisition was cancelled. Any authorization hold has been released.</span>
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E5E5E5]">
                    {statusSteps.map((step, idx) => {
                      const currentIdx = getStepIndex(activeOrder.status);
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={step.key} className="relative flex items-start gap-4">
                          {/* Indicator dot */}
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center -ml-[25px] bg-[#FFFFFF] transition-all ${
                              isComplete
                                ? 'border-[#080808] bg-[#080808] text-[#FFFFFF]'
                                : 'border-[#D1D5DB] text-[#9CA3AF]'
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#E5E5E5]" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-semibold ${
                                  isComplete ? 'text-[#080808]' : 'text-[#777777]'
                                }`}
                              >
                                {step.label}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-mono text-[#080808] bg-[#F0F1F3] px-1.5 py-0.5 rounded-sm">
                                  Current Stage
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#777777] mt-0.5 leading-snug">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Items in this order */}
              <div className="pt-6 border-t border-[#F0F1F3]">
                <h4 className="text-xs font-semibold text-[#171717] uppercase tracking-wider font-mono mb-3">
                  Manifest Details
                </h4>

                <div className="space-y-3">
                  {activeOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FB] border border-[#E5E5E5]"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-lg bg-[#E5E5E5]"
                        />
                        <div>
                          <p className="text-xs font-semibold text-[#080808]">{item.title}</p>
                          <p className="text-[11px] text-[#777777] font-mono capitalize">
                            Finish: {item.materialFinish.replace('-', ' ')} · Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#080808] tabular-nums">
                        ${(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Destination */}
              <div className="pt-4 border-t border-[#F0F1F3] flex justify-between items-start text-xs font-mono text-[#777777]">
                <div>
                  <span className="block font-semibold text-[#171717] uppercase tracking-wider mb-1">
                    Destination
                  </span>
                  <p className="text-[#080808]">{activeOrder.shippingAddress || 'Primary Residence'}</p>
                </div>
                <div className="text-right">
                  <span className="block font-semibold text-[#171717] uppercase tracking-wider mb-1">
                    Total Settled
                  </span>
                  <p className="text-base font-bold text-[#080808] tabular-nums">
                    ${activeOrder.total.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
