
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Coffee, Utensils, Shirt, CreditCard, LayoutGrid, Loader2 } from 'lucide-react';
import { Product } from '../../../types';
import { DbEngine } from '../../../services/core/db';
import { InventoryItem } from '../../../services/core/types';

const CATEGORIES = ['All', 'Drinks', 'Food', 'Merch', 'Cards'];

const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Espresso', price: 3.50, category: 'Drinks', color: 'bg-orange-500' },
    { id: 'p2', name: 'Latte', price: 4.50, category: 'Drinks', color: 'bg-amber-400' },
    { id: 'p3', name: 'Cappuccino', price: 4.50, category: 'Drinks', color: 'bg-amber-500' },
    { id: 'p4', name: 'Iced Coffee', price: 4.00, category: 'Drinks', color: 'bg-amber-200' },
    { id: 'p5', name: 'Classic Big Burger', price: 9.99, category: 'Food', color: 'bg-yellow-600' },
    { id: 'p6', name: 'Bagel', price: 2.50, category: 'Food', color: 'bg-yellow-400' },
    { id: 'p7', name: 'Avocado Toast', price: 8.50, category: 'Food', color: 'bg-green-500' },
    { id: 'p8', name: 'Branded T-Shirt', price: 25.00, category: 'Merch', color: 'bg-primary' },
    { id: 'p9', name: 'Mug', price: 12.00, category: 'Merch', color: 'bg-indigo-500' },
    { id: 'p10', name: 'Gift Card $20', price: 20.00, category: 'Cards', color: 'bg-secondary' },
];

interface ProductGridProps {
    onAddToCart: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ onAddToCart }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [liveProducts, setLiveProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadLiveProducts = async () => {
        setIsLoading(true);
        try {
            const dbItems = await DbEngine.select<InventoryItem>('inventory');
            if (dbItems && dbItems.length > 0) {
                const sellable = dbItems
                    .filter(item => item.itemType !== 'RAW')
                    .map((item, index) => ({
                        id: item.id || `p-db-${index}`,
                        name: item.name,
                        price: item.sellingPrice || item.unitPrice || 1.00,
                        category: item.category || 'General',
                        sku: item.sku,
                        stock: item.quantity,
                        color: item.category === 'Drinks' ? 'bg-amber-500' :
                               item.category === 'Food' ? 'bg-yellow-600' :
                               item.category === 'Merch' ? 'bg-primary' : 'bg-indigo-500'
                    }));
                setLiveProducts(sellable);
            } else {
                setLiveProducts(MOCK_PRODUCTS);
            }
        } catch (err) {
            console.error("Failed loading POS products from database:", err);
            setLiveProducts(MOCK_PRODUCTS);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLiveProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        return liveProducts.filter(p => {
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery, liveProducts]);

    const getCategoryIcon = (cat: string) => {
        switch(cat) {
            case 'Drinks': return <Coffee className="h-4 w-4" />;
            case 'Food': return <Utensils className="h-4 w-4" />;
            case 'Merch': return <Shirt className="h-4 w-4" />;
            case 'Cards': return <CreditCard className="h-4 w-4" />;
            default: return <LayoutGrid className="h-4 w-4" />;
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-background/50">
            {/* Toolbar */}
            <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4">
                <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar flex-1">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition border ${
                                selectedCategory === cat 
                                ? 'bg-primary text-white border-primary shadow-glow-primary' 
                                : 'bg-surface text-on-surface-muted border-border hover:bg-surface-highlight'
                            }`}
                        >
                            {getCategoryIcon(cat)} {cat}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                    <input 
                        type="text" 
                        placeholder="Search items..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-surface border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-on-surface focus:ring-2 focus:ring-primary outline-none"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-on-surface-muted gap-2 animate-pulse">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="text-sm font-bold uppercase tracking-wider">Syncing Menu with Live inventory...</span>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-on-surface-muted">
                        <LayoutGrid className="h-10 w-10 mb-2 opacity-50" />
                        <span className="text-sm">No sellable menu items available.</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => onAddToCart(product)}
                                className="bg-surface hover:bg-surface-highlight border border-border rounded-2xl p-4 flex flex-col items-start text-left transition-all hover:-translate-y-1 hover:shadow-lg group h-full"
                            >
                                <div className={`w-full aspect-square rounded-xl mb-4 ${product.color || 'bg-gray-500'} opacity-80 group-hover:opacity-100 transition flex items-center justify-center shadow-inner`}>
                                    <span className="text-2xl font-bold text-white/50">{product.name.charAt(0)}</span>
                                </div>
                                <h3 className="font-bold text-on-surface text-sm leading-tight mb-1">{product.name}</h3>
                                <div className="mt-auto pt-2 w-full flex justify-between items-center text-xs">
                                    <span className="text-on-surface-muted truncate max-w-[80px]">{product.category}</span>
                                    <span className="font-mono font-bold text-primary">${product.price.toFixed(2)}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
