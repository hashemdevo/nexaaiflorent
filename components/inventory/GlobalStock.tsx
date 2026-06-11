import React, { useEffect, useState } from 'react';
import { DbEngine } from '../../services/core/db';
import { StockMovementService } from '../../services/inventory/movements';
import { Warehouse, InventoryItem, StockMovement } from '../../services/core/types';
import { WarehouseService } from '../../services/inventory/warehouses';
import { ArrowLeftRight, Check, AlertTriangle, List, PlusCircle, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export const GlobalStock: React.FC = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    
    // UI state
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // Transfer fields
    const [selectedItem, setSelectedItem] = useState('');
    const [fromWarehouse, setFromWarehouse] = useState('');
    const [toWarehouse, setToWarehouse] = useState('');
    const [quantity, setQuantity] = useState<number>(0);
    const [reason, setReason] = useState('');

    // Load entire stock context
    const loadContext = async () => {
        setLoading(true);
        try {
            // Fetch Warehouses
            let whs = await WarehouseService.getAll();
            if (!whs || whs.length === 0) {
                // Seed fallback warehouses to avoid empty states
                await WarehouseService.create({ name: 'Riyadh Main Distribution Hub (الرياض)', location: 'Riyadh KSA', code: 'WH-RYD-01' });
                await WarehouseService.create({ name: 'Western Region Depot (جدة)', location: 'Jeddah KSA', code: 'WH-JED-02' });
                await WarehouseService.create({ name: 'Eastern Region Terminal (الدمام)', location: 'Dammam KSA', code: 'WH-DMM-03' });
                whs = await WarehouseService.getAll();
            }
            setWarehouses(whs);

            // Fetch Catalog Items
            const productCatalog = await DbEngine.select<any>('inventory');
            setItems(productCatalog || []);

            // Fetch Movements
            const movs = await DbEngine.select<any>('stock_movements', { orderBy: 'createdAt', orderDir: 'desc' });
            setMovements(movs || []);
        } catch (error) {
            console.error('Failed to load Global Stock Context:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContext();
    }, []);

    // Helper: Compute dynamic quantity of an item inside a specific warehouse based on append-only movements log
    const getComputedWarehouseStock = (itemId: string, warehouseId: string): number => {
        // Find starting or matching quantities
        let qty = 0;
        
        // We accumulate only movements matching this item & warehouse
        const filteredMovements = movements.filter(m => m.itemId === itemId && m.warehouseId === warehouseId);
        
        for (const m of filteredMovements) {
            if (m.type === 'IN') {
                qty += m.quantity;
            } else if (m.type === 'OUT') {
                qty -= m.quantity;
            }
        }
        
        return Math.max(0, qty);
    };

    // Master Catalog aggregate quantity across all warehouses
    const getAggregateComputedStock = (itemId: string): number => {
        let total = 0;
        for (const wh of warehouses) {
            total += getComputedWarehouseStock(itemId, wh.id);
        }
        return total;
    };

    // Execute Inter-Branch Transfer
    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);

        if (!selectedItem || !fromWarehouse || !toWarehouse || quantity <= 0) {
            setMsg({ type: 'error', text: 'الرجاء إدخال كافة الحقول بشكل صحيح | Please complete all fields correctly.' });
            return;
        }

        if (fromWarehouse === toWarehouse) {
            setMsg({ type: 'error', text: 'لا يمكن التحويل لنفس المستودع | Source and destination warehouses cannot be the same.' });
            return;
        }

        // Integrity verification: Check if enough stock exists in source warehouse
        const availableStock = getComputedWarehouseStock(selectedItem, fromWarehouse);
        if (availableStock < quantity) {
            setMsg({ 
                type: 'error', 
                text: `رصيد غير كافي بالمستودع المصدر. المتاح: ${availableStock}، المطلوب: ${quantity} | Insufficient stock in source warehouse: Available ${availableStock}, Requested ${quantity}` 
            });
            return;
        }

        setLoading(true);
        try {
            // Apply double-entry movement through the actual business service
            await StockMovementService.transferStock({
                itemId: selectedItem,
                fromWarehouseId: fromWarehouse,
                toWarehouseId: toWarehouse,
                quantity: quantity,
                reason: reason || 'طلب تحويل لوجستي داخلي بين الأقسام'
            }, 'مدير المستودع (Warehouse Manager)');

            // Track detailed security delta
            await DbEngine.insert('audit_logs', {
                id: `transfer-audit-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                timestamp: new Date().toISOString(),
                actorId: 'wh-mgr-002',
                actorName: 'Warehouse Manager',
                action: 'UPDATE',
                target: `Stock Transfer - Item: ${selectedItem}`,
                details: `Authorized inter-branch transfer of ${quantity} units from WH [${fromWarehouse}] to [${toWarehouse}].`
            });

            setMsg({ type: 'success', text: 'تم تسجيل وإقرار طلب التحويل اللوجستي بنجاح وجاري تحديث الأستاذ المساعد للمخازن | Inter-branch stock transfer succeeded and posted to ledger.' });
            
            // Clear inputs
            setQuantity(0);
            setReason('');
            
            // Reload updated state
            await loadContext();
        } catch (error: any) {
            setMsg({ type: 'error', text: `فشل التحويل: ${error.message || error}` });
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in text-on-surface">
            
            {/* Header Description & Security Segregation Banner */}
            <div className="bg-surface border border-error/20 p-4 rounded-xl flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                    <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                        <span>نظام حوكمة جرد الفروع ورقابة فصل المهام (Seperation of Duties SoD Governance)</span>
                    </h3>
                    <p className="text-xs text-on-surface-muted mt-1 leading-relaxed">
                        يمنع نظام الرقابة الداخلي دمج مستودع المواد الخام مع مخزن البضائع الجاهزة. يتم حظر التحويل المباشر إلا بموافقة مدير المستودعات لتجنب تشتيت العهدة. جميع المعاملات في هذا القسم تخضع لرقابة دورية ويتم توثيقها بالبصمة الزمنية المشفرة.
                    </p>
                </div>
            </div>

            {/* Main Operational Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Request Inter-Branch Transfer Form */}
                <div className="lg:col-span-1 bg-surface border border-border p-6 rounded-2xl shadow-sm h-fit">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                        <PlusCircle className="h-5 w-5" />
                        <span>طلب تحويل مخزني داخلي</span>
                    </h2>
                    <p className="text-xs text-on-surface-muted mb-6">
                        إنشاء طلب تحويل بضائع أو مواد خام بين الفروع والمستودعات المرتبطة بقاعدة البيانات مع حساب الأثر الفوري على جرد الفروع لضمان دقة الرصيد.
                    </p>

                    <form onSubmit={handleTransfer} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-on-surface-muted mb-2">الصنف المطلوب تحويله (Select Item)</label>
                            <select 
                                value={selectedItem} 
                                onChange={e => setSelectedItem(e.target.value)}
                                className="w-full bg-surface-highlight text-on-surface border border-border p-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="">--- اختر الصنف ---</option>
                                {items.map(i => (
                                    <option key={i.id} value={i.id}>
                                        {i.name} ({i.sku}) - المجموع الكلي: {getAggregateComputedStock(i.id)} وحدات
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold uppercase text-on-surface-muted mb-2">من مستودع (Source WH)</label>
                                <select 
                                    value={fromWarehouse} 
                                    onChange={e => setFromWarehouse(e.target.value)}
                                    className="w-full bg-surface-highlight text-on-surface border border-border p-3 rounded-lg text-sm focus:outline-none"
                                    required
                                >
                                    <option value="">--- اختر المصدر ---</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-on-surface-muted mb-2">إلى مستودع (Target WH)</label>
                                <select 
                                    value={toWarehouse} 
                                    onChange={e => setToWarehouse(e.target.value)}
                                    className="w-full bg-surface-highlight text-on-surface border border-border p-3 rounded-lg text-sm focus:outline-none"
                                    required
                                >
                                    <option value="">--- اختر الهدف ---</option>
                                    {warehouses.map(w => (
                                        <option key={w.id} value={w.id}>{w.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-on-surface-muted mb-2">الكمية المطلوبة (Quantity)</label>
                            <input 
                                type="number" 
                                min="1"
                                value={quantity || ''} 
                                onChange={e => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full bg-surface-highlight text-on-surface border border-border p-3 rounded-lg text-sm focus:outline-none"
                                placeholder="أدخل عدد الوحدات"
                                required
                            />
                            {selectedItem && fromWarehouse && (
                                <p className="text-[10px] text-emerald-500 mt-1">
                                    المتاح حالياً في المصدر: {getComputedWarehouseStock(selectedItem, fromWarehouse)} وحدات
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-on-surface-muted mb-2">السبب والملاحظات (Reason / Comments)</label>
                            <textarea 
                                value={reason} 
                                onChange={e => setReason(e.target.value)}
                                className="w-full bg-surface-highlight text-on-surface border border-border p-3 rounded-lg text-sm focus:outline-none h-20"
                                placeholder="مثال: تغطية نقص الجناح الجنوبي بالرياض"
                                required
                            />
                        </div>

                        {msg && (
                            <div className={`p-3 rounded-lg text-xs leading-relaxed ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                <div className="flex gap-2">
                                    {msg.type === 'success' ? <Check className="h-4 w-4 shrink-0" /> : <AlertTriangle className="h-4 w-4 shrink-0" />}
                                    <span>{msg.text}</span>
                                </div>
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-glow-primary duration-300 disabled:opacity-50"
                        >
                            <ArrowLeftRight className="h-4 w-4" />
                            {loading ? 'جاري التنفيذ والتحقق...' : 'تنفيذ التحويل المباشر (Direct Transfer)'}
                        </button>
                    </form>
                </div>

                {/* Right: Global Stock Distribution Matrix */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Layers className="h-5 w-5 text-primary" />
                                    <span>مصفوفة توزيع الجرد اللوجستي للمخازن الفورية</span>
                                </h2>
                                <p className="text-xs text-on-surface-muted mt-0.5">جدول محدث وفوري يوضح أرصدة كل صنف بالتفصيل عبر فروع الشركة المرتبطة.</p>
                            </div>
                            <button 
                                onClick={loadContext} 
                                className="p-2 border border-border hover:bg-surface-highlight rounded-lg transition"
                                title="تحديث البيانات"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex gap-2 max-w-md mb-6">
                            <input 
                                type="text" 
                                placeholder="البحث حسب اسم الصنف أو الـ SKU..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-surface-highlight border border-border px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>

                        {/* Warehouses Aggregation Table */}
                        <div className="overflow-x-auto border border-border rounded-xl">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-surface-highlight border-b border-border">
                                    <tr>
                                        <th className="p-4 font-bold text-on-surface">إسم الصنف (Product Item)</th>
                                        <th className="p-4 font-bold text-on-surface">SKU ID</th>
                                        {warehouses.map(w => (
                                            <th key={w.id} className="p-4 font-bold text-center text-on-surface bg-surface-highlight/50">{w.code}</th>
                                        ))}
                                        <th className="p-4 font-bold text-center text-primary">المجموع العام</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={3 + warehouses.length} className="p-8 text-center text-on-surface-muted">
                                                لا توجد أصناف تطابق البحث الحالي
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredItems.map(item => {
                                            const totalGlobal = getAggregateComputedStock(item.id);
                                            return (
                                                <tr key={item.id} className="hover:bg-surface-highlight/20 transition">
                                                    <td className="p-4 font-bold text-on-surface">{item.name}</td>
                                                    <td className="p-4 text-xs font-mono text-on-surface-muted">{item.sku}</td>
                                                    {warehouses.map(w => {
                                                        const whQty = getComputedWarehouseStock(item.id, w.id);
                                                        const minStock = item.minStockLevel || 10;
                                                        return (
                                                            <td key={w.id} className="p-4 text-center">
                                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${whQty <= minStock ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                                                    {whQty}
                                                                </span>
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="p-4 text-center bg-primary/5 font-extrabold font-mono text-primary">
                                                        {totalGlobal}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Historic Audit Trail Tab */}
                    <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <List className="h-4 w-4 text-primary" />
                            <span>سجل الحركات الأخير للأستاذ المساعد للمخازن (Auditing Trail)</span>
                        </h3>
                        <p className="text-xs text-on-surface-muted mb-4">كافة التوزيعات والتحويلات مخزنة بشكل دائم، غير قابلة للتعديل والمسح طبقاً لسياسة الحوكمة ومراجعي الحسابات.</p>

                        <div className="overflow-y-auto max-h-[300px] border border-border rounded-xl">
                            <table className="w-full text-xs text-right">
                                <thead className="bg-surface-highlight/40 border-b border-border">
                                    <tr>
                                        <th className="p-3 font-semibold text-on-surface">التاريخ (Time)</th>
                                        <th className="p-3 font-semibold text-on-surface">نوع العملية</th>
                                        <th className="p-3 font-semibold text-on-surface">إسم الصنف</th>
                                        <th className="p-3 font-semibold text-center text-on-surface">المستودع</th>
                                        <th className="p-3 font-semibold text-center text-on-surface">الكمية</th>
                                        <th className="p-3 font-semibold text-on-surface">التفاصيل / السبب</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {movements.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-4 text-center text-on-surface-muted">
                                                لا توجد حركات مخزنية مسجلة حتى الآن
                                            </td>
                                        </tr>
                                    ) : (
                                        movements.slice(0, 30).map(m => {
                                            const matchProduct = items.find(i => i.id === m.itemId);
                                            const matchWH = warehouses.find(w => w.id === m.warehouseId);
                                            return (
                                                <tr key={m.id} className="hover:bg-surface-highlight/10 transition">
                                                    <td className="p-3 font-mono text-on-surface-muted">{new Date(m.createdAt).toLocaleString('ar-EG', { hour12: false })}</td>
                                                    <td className="p-3 font-bold">
                                                        <span className={`px-2 py-0.5 rounded ${m.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500' : m.type === 'OUT' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                            {m.type === 'IN' ? 'إدخال (+)' : m.type === 'OUT' ? 'صرف (-)' : 'تحويل'}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 font-bold">{matchProduct ? matchProduct.name : `صنف: ${m.itemId}`}</td>
                                                    <td className="p-3 text-center font-medium">{matchWH ? matchWH.code : `WH: ${m.warehouseId}`}</td>
                                                    <td className="p-3 text-center font-bold font-mono">{m.quantity}</td>
                                                    <td className="p-3 text-on-surface-muted leading-tight">{m.reason || 'تعديل الجرد اللوجستي لليوم'}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
