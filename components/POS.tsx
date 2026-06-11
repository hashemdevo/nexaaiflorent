
import React, { useState, useEffect, useRef } from 'react';
import { LogOut, ChevronRight } from 'lucide-react';
import { Product, CartItem, POSSettings, ServiceType, Order } from '../types';
import { PosHeader } from './pos/terminal/PosHeader';
import { ProductGrid } from './pos/terminal/ProductGrid';
import { CartSidebar } from './pos/terminal/CartSidebar';
import { CheckoutModal } from './pos/terminal/CheckoutModal';
import { KitchenOrderService } from '../services/pos/kitchenOrderService';
import { PartnerLedgerService } from '../services/pos/partnerLedgerService';
import { useApp } from '../contexts/AppContext';
import { ReceiptTemplate } from './pos/terminal/ReceiptTemplate';
import { DbEngine } from '../services/core/db';
import { BillOfMaterials } from '../services/core/types';
import { InventoryService } from '../services/inventory/items';

interface POSProps {
    onExit: () => void;
    onBackToDashboard?: () => void;
}

export const POS: React.FC<POSProps> = ({ onExit, onBackToDashboard }) => {
    const { currentUserIdentity, currentUniversalRole } = useApp();
    const isOwnerOperator = currentUniversalRole === 'OWNER';
    const isInspectOnly = ['ACCOUNTANT', 'CHIEF_ACCOUNTANT', 'AUDITOR'].includes(currentUniversalRole || '');
    const [isOwnerOrderSelected, setIsOwnerOrderSelected] = useState(isOwnerOperator);

    useEffect(() => {
        setIsOwnerOrderSelected(currentUniversalRole === 'OWNER');
    }, [currentUniversalRole]);

    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showExitConfirmation, setShowExitConfirmation] = useState(false);
    
    // Service Type State
    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [showServiceSelection, setShowServiceSelection] = useState(false);

    // Printing State
    const [lastOrder, setLastOrder] = useState<Order | null>(null);
    const [settings, setSettings] = useState<POSSettings>({
        defaultTaxRate: 8,
        currencySymbol: '$',
        storeName: 'Store',
        receiptHeader: 'Welcome',
        receiptFooter: 'Thank you',
        serviceTypes: []
    });

    useEffect(() => {
        const storedSettings = localStorage.getItem('nexa_pos_settings');
        if (storedSettings) {
            const parsed: POSSettings = JSON.parse(storedSettings);
            setSettings(parsed);
            if (parsed.serviceTypes && parsed.serviceTypes.length > 0) {
                setServiceTypes(parsed.serviceTypes);
                setSelectedServiceId(parsed.serviceTypes[0].id);
            }
        }
    }, []);

    const addToCart = (product: Product) => {
        if (isInspectOnly) return;
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1, cartId: Math.random().toString() }];
        });
    };

    const removeFromCart = (productId: string) => {
        if (isInspectOnly) return;
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        if (isInspectOnly) return;
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : item;
            }
            return item;
        }));
    };

    const clearCart = () => {
        if (isInspectOnly) return;
        setCart([]);
    };

    const initiateCheckout = () => {
        if (isInspectOnly) return;
        if (serviceTypes.length > 1) {
            setShowServiceSelection(true);
        } else {
            processOrder();
        }
    };

    const processOrder = async () => {
        const selectedService = serviceTypes.find(s => s.id === selectedServiceId) || { taxRate: 8, name: 'Standard' };
        const orderTotal = subtotal * (1 + (selectedService.taxRate || settings.defaultTaxRate) / 100);
        const orderNo = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const orderId = `ord-${Date.now()}`;
        
        const newOrder: Order = {
            id: orderId,
            orderNumber: orderNo,
            status: 'PENDING',
            items: cart,
            total: orderTotal,
            serviceType: selectedService.name || 'Standard',
            createdAt: new Date().toISOString(),
            isOwnerOrder: isOwnerOrderSelected,
            ownerEmail: isOwnerOrderSelected ? (currentUserIdentity || 'owner@nexa.ai') : undefined,
            ownerName: isOwnerOrderSelected ? (currentUserIdentity?.split('@')[0].toUpperCase() || 'OWNER') : undefined,
            paymentMethod: isOwnerOrderSelected ? 'Partner Current Account' : 'Credit Card'
        };

        if (isOwnerOrderSelected) {
            try {
                const oEmail = currentUserIdentity || 'owner@nexa.ai';
                const oName = currentUserIdentity?.split('@')[0].toUpperCase() || 'OWNER';
                await PartnerLedgerService.recordWithdrawal(
                    oEmail,
                    oName,
                    orderTotal,
                    orderId,
                    orderNo,
                    'مسحوبات عينية شريك من شاشة البيع - أوردر مطبخ'
                );
            } catch (ledgerError) {
                console.error("Owner Ledger record error", ledgerError);
            }
        }

        // Live Stock Decoupling: Deduct inventory items (either raw ingredients via recipe BOM or direct sellable item)
        try {
            for (const cartItem of cart) {
                const boms = await DbEngine.select<BillOfMaterials>('boms', {
                    where: { finishedGoodId: cartItem.id, isActive: true }
                });

                if (boms && boms.length > 0) {
                    const activeRecipe = boms[0];
                    console.log(`Deducting ingredients using Recipe BOM details for ${cartItem.name}`);
                    for (const ingredient of activeRecipe.items) {
                        const requiredQuantity = ingredient.quantity * cartItem.quantity;
                        try {
                            await InventoryService.adjustStock(
                                ingredient.itemId,
                                -requiredQuantity,
                                `POS Checkout order #${orderNo} - Recipe Comp`,
                                currentUserIdentity || 'POS Terminal'
                            );
                        } catch (subErr) {
                            console.error(`BOM Deduction error for raw ingredient ${ingredient.itemId}:`, subErr);
                        }
                    }
                } else {
                    console.log(`No active BOM recipe found for ${cartItem.name}. Direct fallback item deduction...`);
                    try {
                        await InventoryService.adjustStock(
                            cartItem.id,
                            -cartItem.quantity,
                            `POS Checkout order #${orderNo} - Direct Sale`,
                            currentUserIdentity || 'POS Terminal'
                        );
                    } catch (subErr) {
                        console.error(`Direct product deduction fallback error for ${cartItem.name}:`, subErr);
                    }
                }
            }
        } catch (stockDeltaErr) {
            console.error("Stock adjustment in POS failed:", stockDeltaErr);
        }

        // 1. Create Kitchen Order
        KitchenOrderService.createOrder(newOrder);

        // 2. Prepare for Printing
        setLastOrder(newOrder);

        // 3. UI Updates
        setShowServiceSelection(false);
        setShowCheckout(true);

        // 4. Trigger Print (Small delay to ensure state updates and DOM renders the receipt)
        setTimeout(() => {
            document.body.classList.add('print-receipt-mode');
            window.print();
            document.body.classList.remove('print-receipt-mode');
        }, 500);
    };

    // Calculate totals dynamically based on selected service
    const currentService = serviceTypes.find(s => s.id === selectedServiceId);
    const taxRate = currentService ? currentService.taxRate : settings.defaultTaxRate;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal * (1 + (taxRate / 100));

    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden animate-fade-in print:hidden">
            <PosHeader 
                onExit={onExit} 
                setShowExitConfirmation={setShowExitConfirmation} 
                onBackToDashboard={onBackToDashboard}
            />

            {isInspectOnly && (
                <div className="bg-amber-500/10 border-b border-amber-500/25 px-6 py-2.5 flex items-center justify-between text-xs text-amber-500 font-semibold animate-fade-in relative z-20">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                        <span className="text-right">⚠️ <strong>نمط تدقيق ومراجعة الحسابات (قراءة فقط)</strong> - يحق للمحاسب مراجعة ومطابقة شاشة البيع، ولكن صلاحيات التعديل وإرسال الطلبات معطلة حمايةً للدفاتر.</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-bold bg-amber-500/15 border border-amber-500/20 px-2.5 py-1 rounded-md font-mono shrink-0">POS Compliance Mode (Read-Only)</span>
                </div>
            )}

            <div className="flex-1 flex overflow-hidden">
                <ProductGrid onAddToCart={addToCart} />
                <CartSidebar 
                    cart={cart} 
                    onUpdateQuantity={updateQuantity} 
                    onRemove={removeFromCart} 
                    onClear={clearCart}
                    onCheckout={initiateCheckout}
                    isOwnerOrderSelected={isOwnerOrderSelected}
                    onToggleOwnerOrderSelected={setIsOwnerOrderSelected}
                    operatorRole={currentUniversalRole}
                />
            </div>

            {/* Hidden Receipt Template - Only visible during print */}
            <div className="hidden print:block fixed inset-0 z-[100] bg-white">
                <ReceiptTemplate order={lastOrder} settings={settings} />
            </div>

            {/* Service Selection Modal */}
            {showServiceSelection && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center animate-fade-in">
                    <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl max-w-sm w-full">
                        <h2 className="text-xl font-bold text-on-surface mb-6">Select Order Type</h2>
                        <div className="space-y-3">
                            {serviceTypes.map(st => (
                                <button
                                    key={st.id}
                                    onClick={() => setSelectedServiceId(st.id)}
                                    className={`w-full p-4 rounded-xl border flex justify-between items-center transition ${selectedServiceId === st.id ? 'bg-primary/20 border-primary text-white shadow-glow-primary' : 'bg-surface hover:bg-surface-highlight border-border text-on-surface'}`}
                                >
                                    <span className="font-bold">{st.name}</span>
                                    {selectedServiceId === st.id && <ChevronRight className="h-5 w-5" />}
                                </button>
                            ))}
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button 
                                onClick={() => setShowServiceSelection(false)}
                                className="flex-1 py-3 rounded-xl border border-border font-bold text-on-surface hover:bg-surface-highlight transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={processOrder}
                                className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-glow-primary hover:bg-primary-hover transition"
                            >
                                Confirm & Print
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showExitConfirmation && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
                    <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative">
                        <div className="mx-auto bg-primary/20 h-16 w-16 rounded-full flex items-center justify-center mb-4 text-primary">
                            <LogOut className="h-8 w-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-on-surface mb-2">مغادرة نقطة البيع؟</h2>
                        <p className="text-xs text-on-surface-muted mb-6">حدد خيارك لمغادرة نظام نقطة البيع والرجوع أو تسجيل الخروج.</p>
                        <div className="flex flex-col gap-2.5">
                            {onBackToDashboard && (
                                <button 
                                    onClick={() => {
                                        setShowExitConfirmation(false);
                                        onBackToDashboard();
                                    }}
                                    className="w-full py-3 bg-primary text-black font-bold rounded-xl text-xs hover:bg-primary-hover transition flex items-center justify-center gap-2"
                                >
                                    <span>العودة للوحة التحكم (بدون خروج)</span>
                                </button>
                            )}
                            <button 
                                onClick={onExit}
                                className="w-full py-3 bg-danger/20 hover:bg-danger text-white border border-danger/30 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                            >
                                <span>إنهاء وتسجيل خروج من الحساب</span>
                            </button>
                            <button 
                                onClick={() => setShowExitConfirmation(false)}
                                className="w-full py-3 rounded-xl border border-border text-xs text-on-surface font-semibold hover:bg-surface-highlight transition"
                            >
                                إلغاء / تراجع
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCheckout && (
                <CheckoutModal 
                    total={lastOrder ? lastOrder.total : total} 
                    isOwnerOrder={isOwnerOrderSelected}
                    onClose={() => {
                        setCart([]);
                        setShowCheckout(false);
                        setLastOrder(null); 
                    }} 
                />
            )}
        </div>
    );
};
