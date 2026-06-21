
import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types';
import { Search, Plus, Edit3, Trash2, X, Save, Loader2 } from 'lucide-react';
import { DbEngine } from '../../services/core/db';
import { InventoryService } from '../../services/inventory/items';
import { useApp } from '../../contexts/AppContext';

// Mock Initial Data for seeding if DB is empty
const INITIAL_INVENTORY: InventoryItem[] = [
    { id: 'p1', name: 'Espresso', sku: 'FIN-ESP', category: 'Drinks', quantity: 300, unitPrice: 0.15, sellingPrice: 3.50, minStockLevel: 20, lastUpdated: '2026-05-24', supplier: 'TechCoffee', itemType: 'FINISHED' },
    { id: 'p2', name: 'Latte', sku: 'FIN-LAT', category: 'Drinks', quantity: 300, unitPrice: 0.25, sellingPrice: 4.50, minStockLevel: 20, lastUpdated: '2026-05-24', supplier: 'TechCoffee', itemType: 'FINISHED' },
    { id: 'p5', name: 'Classic Big Burger', sku: 'FIN-BBQ', category: 'Food', quantity: 150, unitPrice: 2.10, sellingPrice: 9.99, minStockLevel: 15, lastUpdated: '2026-05-24', supplier: 'PrimeFoods', itemType: 'FINISHED' },
    { id: 'inv-espresso-beans', name: 'Espresso Coffee Beans', sku: 'RAW-COB', category: 'Drinks', quantity: 200, unitPrice: 0.10, sellingPrice: 0, minStockLevel: 15, lastUpdated: '2026-05-24', supplier: 'BeanWholesale', itemType: 'RAW' },
    { id: 'inv-fresh-milk', name: 'Fresh Whole Milk', sku: 'RAW-MILK', category: 'Drinks', quantity: 180, unitPrice: 0.05, sellingPrice: 0, minStockLevel: 15, lastUpdated: '2026-05-24', supplier: 'DairyCorp', itemType: 'RAW' },
    { id: 'inv-burger-bun', name: 'Burger Bun', sku: 'RAW-BUN', category: 'Food', quantity: 120, unitPrice: 0.40, sellingPrice: 0, minStockLevel: 12, lastUpdated: '2026-05-24', supplier: 'BakeryCentral', itemType: 'RAW' },
    { id: 'inv-beef-patty', name: 'Prime Beef Patty 150g', sku: 'RAW-MEAT', category: 'Food', quantity: 100, unitPrice: 1.50, sellingPrice: 0, minStockLevel: 12, lastUpdated: '2026-05-24', supplier: 'PrimeFoods', itemType: 'RAW' },
    { id: 'inv-cheese-slice', name: 'Cheddar Cheese Slice', sku: 'RAW-CHEESE', category: 'Food', quantity: 150, unitPrice: 0.20, sellingPrice: 0, minStockLevel: 15, lastUpdated: '2026-05-24', supplier: 'DairyCorp', itemType: 'RAW' },
].map(item => ({...item, id: item.id + '-' + Math.random().toString(36).substr(2, 6)}));

export const InventoryList: React.FC<{ readOnly?: boolean }> = ({ readOnly }) => {
    const { currentUniversalRole, currentUserIdentity } = useApp();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<InventoryItem>>({});

    // Read-only logic is forced for salespeople as they should only check stock levels
    const isEffectiveReadOnly = readOnly || currentUniversalRole === 'SALES_REP';

    const fetchInventory = async () => {
        setIsLoading(true);
        try {
            let items = await InventoryService.getAll();
            if (items.length === 0) {
                // Seed items into Firestore
                for (const item of INITIAL_INVENTORY) {
                    await DbEngine.insert('inventory', {
                        ...item,
                        tenantId: 'default',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        version: 1
                    } as any);
                }
                items = await InventoryService.getAll();
            }
            setInventory(items);
        } catch (e) {
            console.error("Failed to fetch inventory", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
        
        const handleUpdate = () => {
            fetchInventory();
        };
        
        window.addEventListener('nexa-storage-update', handleUpdate);
        window.addEventListener('inventory-scanned', handleUpdate);
        
        return () => {
            window.removeEventListener('nexa-storage-update', handleUpdate);
            window.removeEventListener('inventory-scanned', handleUpdate);
        };
    }, []);

    const filteredInventory = inventory.filter(item => {
        const matchesQuery = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (item.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesQuery) return false;

        // Strict segregation: Sales representatives MUST NOT see raw ingredients
        if (currentUniversalRole === 'SALES_REP' && item.itemType === 'RAW') {
            return false;
        }

        return true;
    });

    const handleOpenAddModal = () => {
        if (isEffectiveReadOnly) return;
        setCurrentItem({
            name: '', sku: '', category: 'General', quantity: 0, unitPrice: 0, sellingPrice: 0, minStockLevel: 5, supplier: '', itemType: 'FINISHED'
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: InventoryItem) => {
        if (isEffectiveReadOnly) return;
        setCurrentItem({ ...item });
        setIsModalOpen(true);
    };

    const handleDeleteItem = async (id: string) => {
        if (isEffectiveReadOnly) return;
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await DbEngine.delete('inventory', id);
                setInventory(inventory.filter(item => item.id !== id));
            } catch (err) {
                console.error("Failed to delete item", err);
            }
        }
    };

    const handleSaveItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEffectiveReadOnly) return;
        
        try {
            if (currentItem.id) {
                const updatedFields = {
                    ...currentItem,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
                await DbEngine.update('inventory', currentItem.id, updatedFields as any);
                setInventory(inventory.map(item => 
                    item.id === currentItem.id ? { ...item, ...updatedFields } as InventoryItem : item
                ));
            } else {
                const id = `inv-${Date.now()}`;
                const newItem: InventoryItem = {
                    ...currentItem,
                    id,
                    lastUpdated: new Date().toISOString().split('T')[0]
                } as InventoryItem;
                await DbEngine.insert('inventory', {
                    ...newItem,
                    tenantId: 'default',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    version: 1
                } as any);
                setInventory([...inventory, newItem]);
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to save item:", err);
            alert("Error saving item. Please try again.");
        }
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-border animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                    <input 
                        type="text" 
                        placeholder="Search by name or SKU..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                {!isEffectiveReadOnly && (
                    <button 
                        onClick={handleOpenAddModal}
                        className="bg-surface hover:bg-surface-highlight border border-border text-on-surface px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition"
                    >
                        <Plus className="h-4 w-4" /> Add Item
                    </button>
                )}
            </div>

            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                    <thead className="bg-surface-highlight/50 text-on-surface-muted uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Item Name</th>
                            <th className="px-6 py-4">SKU</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4 text-right">Stock</th>
                            <th className="px-6 py-4 text-right">Unit Cost</th>
                            <th className="px-6 py-4 text-right">Total Value</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            {!isEffectiveReadOnly && <th className="px-6 py-4 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                            <tr>
                                <td colSpan={isEffectiveReadOnly ? 7 : 8} className="px-6 py-12 text-center text-on-surface-muted">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                        <span>Loading Stock Items...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredInventory.length === 0 ? (
                            <tr>
                                <td colSpan={readOnly ? 7 : 8} className="px-6 py-12 text-center text-on-surface-muted">
                                    No inventory items match your search.
                                </td>
                            </tr>
                        ) : (
                            filteredInventory.map(item => (
                                <tr key={item.id} className="hover:bg-surface-highlight/30 transition group">
                                    <td className="px-6 py-4 font-medium text-on-surface">
                                        <div className="flex flex-col">
                                            <span>{item.name}</span>
                                            <span className={`text-[10px] w-fit font-bold uppercase mt-1 px-1.5 py-0.5 rounded ${
                                                item.itemType === 'RAW' 
                                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                                : 'bg-primary/10 text-primary border border-primary/20'
                                            }`}>
                                                {item.itemType === 'RAW' ? 'Raw Ingredient 🥩' : 'Finished Good 📦'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-on-surface-muted font-mono text-xs">{item.sku}</td>
                                    <td className="px-6 py-4 text-on-surface-muted">{item.category}</td>
                                    <td className="px-6 py-4 text-right font-mono">{item.quantity}</td>
                                    <td className="px-6 py-4 text-right font-mono text-on-surface-muted">${item.unitPrice.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right font-mono font-bold text-on-surface">${(item.quantity * item.unitPrice).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        {item.quantity <= item.minStockLevel ? (
                                            <span className="px-2 py-1 bg-warning/10 text-warning border border-warning/20 rounded-lg text-xs font-bold">Low Stock</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg text-xs font-bold">In Stock</span>
                                        )}
                                    </td>
                                    {!isEffectiveReadOnly && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleOpenEditModal(item)}
                                                    className="p-2 bg-surface hover:bg-primary hover:text-white rounded-lg text-on-surface-muted transition shadow-sm border border-border"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    className="p-2 bg-surface hover:bg-danger hover:text-white rounded-lg text-on-surface-muted transition shadow-sm border border-border"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD / EDIT ITEM MODAL */}
            {isModalOpen && !readOnly && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-surface border border-border p-6 rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-on-surface">
                                {currentItem.id ? 'Edit Inventory Item' : 'Add New Item'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-on-surface-muted hover:text-on-surface">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSaveItem} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Item Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={currentItem.name || ''}
                                        onChange={e => setCurrentItem({...currentItem, name: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary"
                                        placeholder="e.g. Office Chair"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">SKU</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={currentItem.sku || ''}
                                        onChange={e => setCurrentItem({...currentItem, sku: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary font-mono"
                                        placeholder="e.g. SKU-001"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Category</label>
                                    <select 
                                        value={currentItem.category || 'General'}
                                        onChange={e => setCurrentItem({...currentItem, category: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary"
                                    >
                                        <option value="General">General</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Furniture">Furniture</option>
                                        <option value="Supplies">Supplies</option>
                                        <option value="Drinks">Drinks</option>
                                        <option value="Food">Food</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Item Type (Decoupling)</label>
                                    <select 
                                        value={currentItem.itemType || 'FINISHED'}
                                        onChange={e => {
                                            const type = e.target.value as 'RAW' | 'FINISHED';
                                            setCurrentItem({
                                                ...currentItem, 
                                                itemType: type,
                                                // Raw materials don't have a retail selling price generally
                                                sellingPrice: type === 'RAW' ? 0 : (currentItem.sellingPrice || 0)
                                            });
                                        }}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary font-bold text-primary"
                                    >
                                        <option value="FINISHED">FINISHED GOOD (POS Sellable)</option>
                                        <option value="RAW">RAW INGREDIENT (Not in POS)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Supplier</label>
                                    <input 
                                        type="text" 
                                        value={currentItem.supplier || ''}
                                        onChange={e => setCurrentItem({...currentItem, supplier: e.target.value})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Selling Price (MSRP)</label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-muted text-xs">$</span>
                                        <input 
                                            disabled={currentItem.itemType === 'RAW'}
                                            type="number" 
                                            min="0"
                                            step="0.01"
                                            value={currentItem.sellingPrice || 0}
                                            onChange={e => setCurrentItem({...currentItem, sellingPrice: parseFloat(e.target.value) || 0})}
                                            className="w-full bg-background border border-border rounded-xl pl-5 pr-2 py-2 text-on-surface outline-none focus:border-primary font-mono disabled:opacity-40"
                                            placeholder="N/A for Raw"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Quantity</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={currentItem.quantity || 0}
                                        onChange={e => setCurrentItem({...currentItem, quantity: parseInt(e.target.value)})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Unit Cost</label>
                                    <div className="relative">
                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-on-surface-muted text-xs">$</span>
                                        <input 
                                            type="number" 
                                            min="0"
                                            step="0.01"
                                            value={currentItem.unitPrice || 0}
                                            onChange={e => setCurrentItem({...currentItem, unitPrice: parseFloat(e.target.value)})}
                                            className="w-full bg-background border border-border rounded-xl pl-5 pr-2 py-2 text-on-surface outline-none focus:border-primary font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Min Stock</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={currentItem.minStockLevel || 0}
                                        onChange={e => setCurrentItem({...currentItem, minStockLevel: parseInt(e.target.value)})}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary font-mono"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-xl border border-border font-bold text-on-surface hover:bg-surface-highlight transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold shadow-glow-primary hover:bg-primary-hover transition flex items-center justify-center gap-2"
                                >
                                    <Save className="h-4 w-4" /> Save Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
