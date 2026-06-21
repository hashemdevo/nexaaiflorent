
import React from 'react';
import { Order, POSSettings } from '../../../types';

interface ReceiptTemplateProps {
    order: Order | null;
    settings: POSSettings;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({ order, settings }) => {
    if (!order) return null;

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = order.total - subtotal;

    return (
        <div className="printable-receipt hidden print:block font-mono text-black bg-white p-2 w-[80mm] mx-auto text-xs leading-tight">
            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="text-base font-bold uppercase">{settings.storeName}</h1>
                <p className="text-[10px] mt-1 whitespace-pre-wrap">{settings.receiptHeader}</p>
            </div>

            {/* Meta */}
            <div className="border-b border-black border-dashed pb-2 mb-2 flex justify-between">
                <div>
                    <div>Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                    <div>Time: {new Date(order.createdAt).toLocaleTimeString()}</div>
                </div>
                <div className="text-right">
                    <div>Ord #: {order.orderNumber}</div>
                    <div>Type: {order.serviceType}</div>
                </div>
            </div>

            {order.isOwnerOrder && (
                <div className="bg-gray-100 p-2 border border-black text-center mb-2 font-bold text-[10px] space-y-0.5 rounded">
                    <div>⚠️ طلب شريك - تنفيذ فوري ⚠️</div>
                    <div>Charged to Partner Current Account</div>
                    <div className="text-red-700 font-mono">Owner: {order.ownerName} ({order.ownerEmail})</div>
                </div>
            )}

            {/* Items */}
            <div className="mb-2">
                <div className="flex font-bold border-b border-black border-dashed pb-1 mb-1">
                    <span className="w-8">Qty</span>
                    <span className="flex-1">Item</span>
                    <span className="w-16 text-right">Price</span>
                </div>
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex mb-1">
                        <span className="w-8">{item.quantity}</span>
                        <span className="flex-1">{item.name}</span>
                        <span className="w-16 text-right">{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="border-t border-black border-dashed pt-2 mb-4">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{settings.currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{settings.currencySymbol}{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm mt-1">
                    <span>TOTAL:</span>
                    <span>{settings.currencySymbol}{order.total.toFixed(2)}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] mt-4 border-t border-black border-dashed pt-2">
                <p className="whitespace-pre-wrap">{settings.receiptFooter}</p>
                <p className="mt-2">*** THANK YOU ***</p>
            </div>
        </div>
    );
};
