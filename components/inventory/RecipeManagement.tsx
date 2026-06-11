import React, { useState, useEffect } from 'react';
import { DbEngine } from '../../services/core/db';
import { InventoryItem, BillOfMaterials, BOMItem } from '../../services/core/types';
import { Plus, Trash2, Edit3, Save, X, BookOpen, Layers, DollarSign, Activity, AlertTriangle } from 'lucide-react';

export const RecipeManagement: React.FC = () => {
    const [boms, setBoms] = useState<BillOfMaterials[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFinishedGoodId, setSelectedFinishedGoodId] = useState('');
    const [recipeItems, setRecipeItems] = useState<{ itemId: string; quantity: number }[]>([]);
    const [laborCost, setLaborCost] = useState(0);
    const [overheadCost, setOverheadCost] = useState(0);
    const [errMsg, setErrMsg] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Load all items in inventory
            const items = await DbEngine.select<InventoryItem>('inventory');
            setInventory(items);

            // Load all BOMs
            const loadedBoms = await DbEngine.select<BillOfMaterials>('boms');
            setBoms(loadedBoms);
        } catch (err) {
            console.error('Error loading recipes data', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter finished goods or general items that can be sold
    const finishedGoods = inventory.filter(item => item.itemType === 'FINISHED' || item.sellingPrice > 0);
    // Filter raw materials
    const rawMaterials = inventory.filter(item => item.itemType === 'RAW' || item.sellingPrice === 0);

    const handleOpenAddModal = () => {
        setSelectedFinishedGoodId('');
        setRecipeItems([{ itemId: '', quantity: 1 }]);
        setLaborCost(0);
        setOverheadCost(0);
        setErrMsg('');
        setIsModalOpen(true);
    };

    const handleAddIngredientRow = () => {
        setRecipeItems([...recipeItems, { itemId: '', quantity: 1 }]);
    };

    const handleRemoveIngredientRow = (idx: number) => {
        setRecipeItems(recipeItems.filter((_, i) => i !== idx));
    };

    const handleIngredientChange = (idx: number, field: 'itemId' | 'quantity', value: any) => {
        const copy = [...recipeItems];
        if (field === 'itemId') {
            copy[idx].itemId = value;
        } else {
            copy[idx].quantity = parseFloat(value) || 0;
        }
        setRecipeItems(copy);
    };

    const handleSaveRecipe = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrMsg('');

        if (!selectedFinishedGoodId) {
            setErrMsg('Please select a finished product.');
            return;
        }

        // Validate duplicates or missing items
        const selectedItems = recipeItems.filter(item => item.itemId);
        if (selectedItems.length === 0) {
            setErrMsg('Please add at least one valid raw material.');
            return;
        }

        const fbItem = inventory.find(i => i.id === selectedFinishedGoodId);
        if (!fbItem) return;

        try {
            const bomId = `bom-${selectedFinishedGoodId}`;
            const newBom: BillOfMaterials = {
                id: bomId,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                finishedGoodId: selectedFinishedGoodId,
                name: `${fbItem.name} Standard Recipe`,
                bomVersion: '1.0',
                items: selectedItems.map(item => ({
                    itemId: item.itemId,
                    quantity: item.quantity
                })),
                laborCostPerUnit: laborCost,
                overheadCostPerUnit: overheadCost,
                isActive: true
            };

            await DbEngine.insert('boms', newBom);
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Error saving recipe:', err);
            setErrMsg('Failed to save recipe to database.');
        }
    };

    const handleDeleteRecipe = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this recipe?')) {
            try {
                await DbEngine.delete('boms', id);
                fetchData();
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Calculate recipe cost metrics
    const getRecipeMetrics = (bom: BillOfMaterials) => {
        let rawCost = 0;
        bom.items.forEach(ingredient => {
            const item = inventory.find(i => i.id === ingredient.itemId);
            if (item) {
                rawCost += item.unitPrice * ingredient.quantity;
            }
        });

        const finishedGood = inventory.find(i => i.id === bom.finishedGoodId);
        const totalManufacturingCost = rawCost + bom.laborCostPerUnit + bom.overheadCostPerUnit;
        const retailPrice = finishedGood?.sellingPrice || 0;
        const profitMargin = retailPrice - totalManufacturingCost;
        const marginPct = retailPrice > 0 ? (profitMargin / retailPrice) * 100 : 0;

        // Calculate max producible quantity based on current raw stock levels
        let maxProducible = Infinity;
        let bindingIngredientName = 'All clear';

        bom.items.forEach(ingredient => {
            const rawItem = inventory.find(i => i.id === ingredient.itemId);
            if (rawItem && ingredient.quantity > 0) {
                const limit = Math.floor(rawItem.quantity / ingredient.quantity);
                if (limit < maxProducible) {
                    maxProducible = limit;
                    bindingIngredientName = rawItem.name;
                }
            }
        });

        if (bom.items.length === 0) maxProducible = 0;

        return {
            rawCost,
            totalCost: totalManufacturingCost,
            retailPrice,
            profitMargin,
            marginPct,
            maxProducible: maxProducible === Infinity ? 0 : maxProducible,
            bindingIngredient: bindingIngredientName
        };
    };

    return (
        <div className="glass-panel p-6 rounded-2xl border border-border animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                        <BookOpen className="h-5 w-5 text-primary" /> Recipe Management & Cost Control (BOM)
                    </h2>
                    <p className="text-sm text-on-surface-muted mt-1">
                        Link finished sellable products to raw materials. Set recipe ratios, calculate real-time production costs, and monitor profit margins.
                    </p>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-hover shadow-glow-primary transition flex items-center gap-1.5"
                >
                    <Plus className="h-4 w-4" /> Assemble Recipe
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-on-surface-muted">
                    Loading recipes and materials...
                </div>
            ) : boms.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <Layers className="h-10 w-10 text-on-surface-muted mx-auto mb-2" />
                    <p className="text-sm text-on-surface-muted">No manufacturing recipes compiled yet.</p>
                    <button
                        onClick={handleOpenAddModal}
                        className="mt-3 text-xs font-bold text-primary hover:underline"
                    >
                        Create your first bill of materials
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {boms.map(bom => {
                        const fg = inventory.find(i => i.id === bom.finishedGoodId);
                        const metrics = getRecipeMetrics(bom);

                        return (
                            <div key={bom.id} className="bg-surface rounded-2xl border border-border/80 overflow-hidden shadow-md flex flex-col justify-between">
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-bold px-2 py-0.5 rounded-full uppercase">
                                                Active BOM v{bom.bomVersion}
                                            </span>
                                            <h3 className="text-md font-bold mt-2 text-white">{fg?.name || bom.name}</h3>
                                            <p className="text-xs text-on-surface-muted font-mono uppercase">{fg?.sku || 'SKU-NONE'}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteRecipe(bom.id!)}
                                            className="text-on-surface-muted hover:text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg transition"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Cost Breakdown */}
                                    <div className="bg-background/60 p-3 rounded-xl border border-border/50 divide-y divide-border/40 text-xs">
                                        <div className="pb-2 flex justify-between">
                                            <span className="text-on-surface-muted">Raw Ingredients:</span>
                                            <span className="font-mono text-white">${metrics.rawCost.toFixed(2)}</span>
                                        </div>
                                        <div className="py-2 flex justify-between">
                                            <span className="text-on-surface-muted">Labor & Overhead:</span>
                                            <span className="font-mono text-white">${(bom.laborCostPerUnit + bom.overheadCostPerUnit).toFixed(2)}</span>
                                        </div>
                                        <div className="py-2 flex justify-between font-bold">
                                            <span className="text-white">Total Cost of Goods:</span>
                                            <span className="font-mono text-white">${metrics.totalCost.toFixed(2)}</span>
                                        </div>
                                        <div className="py-2 flex justify-between text-primary font-bold">
                                            <span>Retail Selling Price:</span>
                                            <span className="font-mono">${metrics.retailPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-2 flex justify-between items-center">
                                            <span className="text-on-surface-muted">Estimated Margin:</span>
                                            <span className={`font-mono font-bold ${metrics.profitMargin >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                                ${metrics.profitMargin.toFixed(2)} ({metrics.marginPct.toFixed(0)}%)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Ingredients List */}
                                    <div>
                                        <h4 className="text-xs font-bold uppercase text-on-surface-muted mb-2">Recipe Composition</h4>
                                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                                            {bom.items.map((ingredient, i) => {
                                                const rm = inventory.find(it => it.id === ingredient.itemId);
                                                return (
                                                    <div key={i} className="flex justify-between items-center text-xs p-2 bg-background/30 rounded-lg border border-border/30">
                                                        <span className="text-white font-medium">{rm?.name || 'Unknown raw material'}</span>
                                                        <span className="font-mono text-on-surface-muted">
                                                            {ingredient.quantity} units (${((rm?.unitPrice || 0) * ingredient.quantity).toFixed(2)})
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Bar: Capacity Indicator */}
                                <div className="bg-background border-t border-border p-4 flex justify-between items-center">
                                    <div className="flex items-center gap-1.5">
                                        <Activity className="h-4 w-4 text-emerald-500" />
                                        <div>
                                            <p className="text-[10px] text-on-surface-muted uppercase font-bold">Manufacturing Limit</p>
                                            <p className="text-xs font-bold text-white">
                                                {metrics.maxProducible} items possible
                                            </p>
                                        </div>
                                    </div>
                                    {metrics.maxProducible <= 5 && (
                                        <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3 shrink-0" /> Low Stock
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Assemble Recipe Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-surface border border-border p-6 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Assemble Product BOM Recipe</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-on-surface-muted hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {errMsg && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-xs font-semibold mb-4">
                                {errMsg}
                            </div>
                        )}

                        <form onSubmit={handleSaveRecipe} className="space-y-4">
                            {/* Product Selection */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Finished Good / Menu Item</label>
                                <select
                                    required
                                    value={selectedFinishedGoodId}
                                    onChange={e => setSelectedFinishedGoodId(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary"
                                >
                                    <option value="">-- Choose Sellable Finished Product --</option>
                                    {finishedGoods.map(fg => (
                                        <option key={fg.id} value={fg.id}>
                                            {fg.name} (${fg.sellingPrice.toFixed(2)} - SKU: {fg.sku})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Cost parameters */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Est. Labor Cost per unit ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={laborCost}
                                        onChange={e => setLaborCost(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary font-mono"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Est. Overhead Cost per unit ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={overheadCost}
                                        onChange={e => setOverheadCost(parseFloat(e.target.value) || 0)}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary font-mono"
                                    />
                                </div>
                            </div>

                            {/* Raw ingredients composition */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                                    <span className="text-xs font-bold text-on-surface-muted uppercase">Constituent Ingredients (Raw Materials)</span>
                                    <button
                                        type="button"
                                        onClick={handleAddIngredientRow}
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        + Add Ingredient
                                    </button>
                                </div>

                                <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
                                    {recipeItems.map((recipeItem, idx) => (
                                        <div key={idx} className="flex gap-3 items-center">
                                            <div className="flex-1">
                                                <select
                                                    value={recipeItem.itemId}
                                                    onChange={e => handleIngredientChange(idx, 'itemId', e.target.value)}
                                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-primary"
                                                >
                                                    <option value="">-- Choose Raw Material --</option>
                                                    {rawMaterials.map(rm => (
                                                        <option key={rm.id} value={rm.id}>
                                                            {rm.name} (Unit cost: ${rm.unitPrice.toFixed(2)} - Stock: {rm.quantity})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-24">
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    required
                                                    placeholder="Qty"
                                                    value={recipeItem.quantity}
                                                    onChange={e => handleIngredientChange(idx, 'quantity', e.target.value)}
                                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-primary font-mono"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveIngredientRow(idx)}
                                                className="text-on-surface-muted hover:text-red-500 p-1.5 transition"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3 border-t border-border/40">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 border border-border rounded-xl font-bold text-on-surface hover:bg-surface-highlight transition text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-glow-primary hover:bg-primary-hover transition text-sm flex items-center justify-center gap-1.5"
                                >
                                    <Save className="h-4 w-4" /> Save Recipe
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
