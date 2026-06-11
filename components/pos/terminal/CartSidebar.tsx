
import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { CartItem } from '../../../types';

interface CartSidebarProps {
    cart: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemove: (id: string) => void;
    onClear: () => void;
    onCheckout: () => void;
    isOwnerOrderSelected?: boolean;
    onToggleOwnerOrderSelected?: (val: boolean) => void;
    operatorRole?: string | null;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ 
    cart, 
    onUpdateQuantity, 
    onRemove, 
    onClear, 
    onCheckout,
    isOwnerOrderSelected = false,
    onToggleOwnerOrderSelected,
    operatorRole
}) => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.08; 
    const total = subtotal + tax;

    return (
        <div className="w-96 bg-surface border-l border-border flex flex-col shadow-2xl relative z-10">
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface-highlight/20">
                <h2 className="font-bold text-on-surface flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" /> Current Order
                </h2>
                <span className="bg-primary/20 text-primary px-2 py-1 rounded-lg text-xs font-bold">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)} Items
                </span>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-on-surface-muted opacity-50">
                        <ShoppingCart className="h-12 w-12 mb-3" />
                        <p>Cart is empty</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.id} className="bg-background/50 rounded-xl p-3 border border-border flex justify-between items-center animate-fade-in">
                            <div className="flex-1">
                                <div className="font-bold text-on-surface text-sm">{item.name}</div>
                                <div className="text-xs text-on-surface-muted font-mono">${item.price.toFixed(2)}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-surface rounded-lg border border-border">
                                    <button 
                                        onClick={() => onUpdateQuantity(item.id, -1)}
                                        className="p-1 hover:text-danger hover:bg-danger/10 rounded-l-lg transition"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-6 text-center font-mono text-sm font-bold text-on-surface">{item.quantity}</span>
                                    <button 
                                        onClick={() => onUpdateQuantity(item.id, 1)}
                                        className="p-1 hover:text-secondary hover:bg-secondary/10 rounded-r-lg transition"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="text-right w-16">
                                    <div className="font-bold text-on-surface font-mono text-sm">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onRemove(item.id)}
                                    className="text-on-surface-muted hover:text-danger transition p-1"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Totals Section */}
            <div className="p-6 bg-surface-highlight/10 border-t border-border space-y-3">
                <div className="flex justify-between text-sm text-on-surface-muted">
                    <span>Subtotal</span>
                    <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-on-surface-muted">
                    <span>Tax (8%)</span>
                    <span className="font-mono">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-on-surface pt-4 border-t border-border">
                    <span>Total</span>
                    <span className="font-mono text-primary">${total.toFixed(2)}</span>
                </div>

                {onToggleOwnerOrderSelected && (
                    <div className={`p-3 rounded-2xl border transition-all duration-300 flex flex-col gap-2 mt-2 ${
                        isOwnerOrderSelected 
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' 
                        : 'bg-surface-highlight/25 border-border text-on-surface-muted'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className={`text-[11px] font-bold font-sans flex items-center gap-1.5 ${isOwnerOrderSelected ? 'text-amber-400' : 'text-on-surface'}`}>
                                    <span className={`w-2 h-2 rounded-full ${isOwnerOrderSelected ? 'bg-amber-500 animate-pulse' : 'bg-on-surface-muted'}`}></span>
                                    تسجيل كطلب شريك
                                </span>
                                <span className="text-[10px] text-on-surface-muted leading-tight mt-0.5">
                                    {isOwnerOrderSelected ? 'يُخصم من حساب جاري الشريك' : 'دفع نقدي كأوردر عادي'}
                                </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input 
                                    type="checkbox" 
                                    checked={isOwnerOrderSelected} 
                                    onChange={(e) => onToggleOwnerOrderSelected(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-surface-highlight border border-border rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-600"></div>
                            </label>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button 
                        onClick={onClear}
                        disabled={cart.length === 0}
                        className="py-3 rounded-xl border border-border text-on-surface-muted font-bold hover:bg-danger hover:text-white hover:border-danger transition disabled:opacity-50 text-sm"
                    >
                        Clear
                    </button>
                    <button 
                        onClick={onCheckout}
                        disabled={cart.length === 0}
                        className={`py-3 rounded-xl font-bold transition disabled:opacity-50 text-sm ${isOwnerOrderSelected ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-glow-amber' : 'bg-primary text-white shadow-glow-primary hover:bg-primary-hover'}`}
                    >
                        {isOwnerOrderSelected ? 'سحب جاري الشريك' : 'Checkout'}
                    </button>
                </div>
            </div>
        </div>
    );
};
