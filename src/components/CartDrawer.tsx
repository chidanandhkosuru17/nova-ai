import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { X, Trash2, ArrowRight, ShieldCheck, CheckCircle2, ShoppingBag, Truck } from 'lucide-react';
import { Order } from '../types';

interface CartDrawerProps {
  onOpenAuth: () => void;
  onViewOrder: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenAuth, onViewOrder }) => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    shipping,
    tax,
    total,
    placeOrder,
  } = useCart();
  const { currentUser, userProfile } = useAuth();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [shippingAddress, setShippingAddress] = useState('');
  const [recipientName, setRecipientName] = useState(userProfile?.displayName || '');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'wire' | 'card'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  if (!isCartOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await placeOrder({
        fullName: recipientName || 'Nova Member',
        address: shippingAddress || '100 Studio Way, Suite 4B',
        city: city || 'San Francisco',
        postalCode: postalCode || '94107',
        email: currentUser.email || 'customer@novacart.design',
      });
      setConfirmedOrder(order);
      setCheckoutStep('success');
    } catch (err: any) {
      alert(err.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    // Reset state after transition
    setTimeout(() => {
      setCheckoutStep('cart');
      setConfirmedOrder(null);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#080808]/50 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFFFF] border-l border-[#E5E5E5] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#F0F1F3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#080808]" />
              <h2 className="text-sm font-semibold text-[#080808] uppercase tracking-wider font-mono">
                {checkoutStep === 'cart'
                  ? `Shopping Bag (${items.length})`
                  : checkoutStep === 'checkout'
                  ? 'Fulfillment Details'
                  : 'Order Confirmed'}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-[#777777] hover:text-[#080808] transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto p-6">
            {checkoutStep === 'cart' && (
              <>
                {/* Free shipping progress indicator */}
                <div className="p-3 bg-[#F8F9FB] border border-[#E5E5E5] rounded-xl mb-5">
                  <div className="flex items-center justify-between text-xs text-[#171717] mb-1.5">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Truck className="w-3.5 h-3.5" />
                      {subtotal >= 500
                        ? 'Complimentary Express Courier Included'
                        : `Add $${(500 - subtotal).toLocaleString()} for Free Courier Delivery`}
                    </span>
                  </div>
                  <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#080808] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }}
                    />
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-12 h-12 rounded-full bg-[#F0F1F3] flex items-center justify-center mx-auto mb-3 text-[#777777]">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-[#080808]">Your bag is currently empty</p>
                    <p className="text-xs text-[#777777] mt-1">Explore our curated catalog to acquire pieces.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl hover:border-[#171717]/30 transition-all shadow-2xs"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg bg-[#F0F1F3]"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="text-xs font-semibold text-[#080808] leading-tight">
                                {item.title}
                              </h4>
                              <p className="text-[11px] text-[#777777] font-mono capitalize mt-0.5">
                                Finish: {item.materialFinish.replace('-', ' ')}
                              </p>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-[#777777] hover:text-red-600 transition-colors p-1 cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex justify-between items-center mt-3">
                            {/* Quantity Stepper */}
                            <div className="flex items-center border border-[#E5E5E5] rounded-md bg-[#F8F9FB]">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-2 py-0.5 text-xs text-[#171717] hover:bg-[#FFFFFF] transition-colors cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2.5 text-xs font-mono tabular-nums text-[#080808]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-2 py-0.5 text-xs text-[#171717] hover:bg-[#FFFFFF] transition-colors cursor-pointer"
                              >
                                +
                              </button>
                            </div>

                            <span className="text-xs font-bold font-mono tabular-nums text-[#080808]">
                              ${(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {checkoutStep === 'checkout' && (
              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#171717] mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient Name"
                    className="w-full px-3.5 py-2 text-xs bg-[#F8F9FB] border border-[#E5E5E5] rounded-lg text-[#080808] focus:outline-none focus:border-[#080808]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#171717] mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Street Address, Penthouse/Apt"
                    className="w-full px-3.5 py-2 text-xs bg-[#F8F9FB] border border-[#E5E5E5] rounded-lg text-[#080808] focus:outline-none focus:border-[#080808]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#171717] mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New York"
                      className="w-full px-3.5 py-2 text-xs bg-[#F8F9FB] border border-[#E5E5E5] rounded-lg text-[#080808] focus:outline-none focus:border-[#080808]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#171717] mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="10001"
                      className="w-full px-3.5 py-2 text-xs bg-[#F8F9FB] border border-[#E5E5E5] rounded-lg text-[#080808] focus:outline-none focus:border-[#080808]"
                    />
                  </div>
                </div>

                {/* Settlement Method */}
                <div>
                  <label className="block text-xs font-medium text-[#171717] mb-1.5">
                    Settlement Method
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'card', title: 'Corporate Credit / Debit Card', note: 'Encrypted Stripe Gateway' },
                      { id: 'wire', title: 'Direct Bank Wire (SWIFT / Fedwire)', note: 'Net 30 terms for verified partners' },
                      { id: 'cod', title: 'Cash on Courier Delivery (COD)', note: 'Verify identity upon white-glove arrival' },
                    ].map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                          paymentMethod === m.id
                            ? 'border-[#080808] bg-[#F8F9FB]'
                            : 'border-[#E5E5E5] hover:border-[#777777]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === m.id}
                          onChange={() => setPaymentMethod(m.id as any)}
                          className="mt-0.5 accent-[#080808]"
                        />
                        <div>
                          <div className="font-medium text-[#080808]">{m.title}</div>
                          <div className="text-[11px] text-[#777777]">{m.note}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </form>
            )}

            {checkoutStep === 'success' && confirmedOrder && (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#080808] tracking-tight">
                  Acquisition Verified
                </h3>
                <p className="text-xs text-[#777777] mt-1">
                  Order <span className="font-mono font-medium text-[#080808]">{confirmedOrder.id}</span> has been entered into the production ledger.
                </p>

                <div className="mt-6 p-4 rounded-xl bg-[#F8F9FB] border border-[#E5E5E5] text-left text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Tracking Ref:</span>
                    <span className="text-[#080808]">{confirmedOrder.trackingNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Status:</span>
                    <span className="text-emerald-700 capitalize font-medium">{confirmedOrder.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#777777]">Billed Amount:</span>
                    <span className="text-[#080808] font-bold">${confirmedOrder.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-8 space-y-2.5">
                  <button
                    onClick={() => {
                      handleClose();
                      onViewOrder(confirmedOrder);
                    }}
                    className="w-full py-2.5 px-4 bg-[#080808] text-[#FFFFFF] text-xs font-medium rounded-lg hover:bg-[#171717] transition-colors cursor-pointer"
                  >
                    View Real-time Tracking
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full py-2.5 px-4 bg-[#FFFFFF] border border-[#E5E5E5] text-[#171717] text-xs font-medium rounded-lg hover:bg-[#F8F9FB] transition-colors cursor-pointer"
                  >
                    Return to Catalog
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Ledger Breakdown */}
          {checkoutStep !== 'success' && (
            <div className="p-6 border-t border-[#F0F1F3] bg-[#FFFFFF] space-y-4">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[#777777]">
                  <span>Subtotal</span>
                  <span className="text-[#080808]">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#777777]">
                  <span>Insured Express Courier</span>
                  <span className="text-[#080808]">
                    {shipping === 0 ? 'Complimentary' : `$${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#777777]">
                  <span>Estimated Tax (8%)</span>
                  <span className="text-[#080808]">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-[#E5E5E5] pt-2 flex justify-between text-sm font-bold text-[#080808]">
                  <span>Total Investment</span>
                  <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {checkoutStep === 'cart' ? (
                <button
                  type="button"
                  disabled={items.length === 0}
                  onClick={() => {
                    if (!currentUser) {
                      onOpenAuth();
                    } else {
                      setCheckoutStep('checkout');
                    }
                  }}
                  className="w-full py-3.5 px-4 bg-[#080808] hover:bg-[#171717] disabled:opacity-40 text-[#FFFFFF] text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>{currentUser ? 'Proceed to Settlement' : 'Sign In to Checkout'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="w-1/3 py-3 px-3 bg-[#F8F9FB] hover:bg-[#F0F1F3] border border-[#E5E5E5] text-[#171717] text-xs font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    form="checkout-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-2/3 py-3 px-4 bg-[#080808] hover:bg-[#171717] disabled:opacity-50 text-[#FFFFFF] text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>{isSubmitting ? 'Authorizing...' : 'Authorize Transaction'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-[10px] text-[#777777]">
                <ShieldCheck className="w-3 h-3 text-[#171717]" />
                <span>256-Bit Encrypted Database Authentication</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
