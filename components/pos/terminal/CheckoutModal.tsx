
import React from 'react';
import { Check } from 'lucide-react';

interface CheckoutModalProps {
    total: number;
    onClose: () => void;
    isOwnerOrder?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ total, onClose, isOwnerOrder = false }) => {
    return (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
            <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center relative">
                <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 animate-pulse-slow ${
                    isOwnerOrder ? 'bg-amber-500/20 text-amber-500' : 'bg-secondary/20 text-secondary'
                }`}>
                    <Check className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-on-surface mb-2">
                    {isOwnerOrder ? 'قيد مسحوبات الشريك' : 'Payment Successful'}
                </h2>
                <p className="text-xs text-on-surface-muted mb-6">
                    {isOwnerOrder ? 'تم ترحيل الطلب للمطبخ وخصمه كمسحوبات من حساب جاري الشريك بنجاح.' : 'Order has been processed.'}
                </p>
                <div className="bg-surface-highlight p-4 rounded-xl mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-on-surface-muted">قيمة الأوردر / Amount</span>
                        <span className="text-on-surface font-bold font-mono">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-on-surface-muted">طريقة السداد / Method</span>
                        <span className={`font-bold text-xs ${isOwnerOrder ? 'text-amber-400' : 'text-on-surface'}`}>
                            {isOwnerOrder ? 'جاري الشريك (مسحوبات)' : 'Credit Card **** 4242'}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className={`w-full py-3 rounded-xl font-bold transition ${
                        isOwnerOrder 
                        ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-glow-amber' 
                        : 'bg-primary text-white shadow-glow-primary hover:bg-primary-hover'
                    }`}
                >
                    {isOwnerOrder ? 'أوردر جديد' : 'New Order'}
                </button>
            </div>
        </div>
    );
};
