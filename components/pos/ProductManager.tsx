
import React, { useState } from 'react';
import { Search, Plus, Edit3, Trash2, Check, X, DollarSign, Image, Upload } from 'lucide-react';
import { Product } from '../../types';

// Mock Initial Data (Moved here)
const INITIAL_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Espresso', price: 3.50, category: 'Drinks', stock: 150, sku: 'DRK-001', taxable: true, color: 'bg-orange-500' },
    { id: 'p2', name: 'Latte', price: 4.50, category: 'Drinks', stock: 120, sku: 'DRK-002', taxable: true, color: 'bg-amber-400' },
    { id: 'p3', name: 'Cappuccino', price: 4.50, category: 'Drinks', stock: 80, sku: 'DRK-003', taxable: true, color: 'bg-amber-500' },
    { id: 'p8', name: 'Branded T-Shirt', price: 25.00, category: 'Merch', stock: 45, sku: 'MRC-001', taxable: true, color: 'bg-primary' },
];

export const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSaveProduct = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingProduct) return;

      if (products.find(p => p.id === editingProduct.id)) {
          setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      } else {
          setProducts([...products, { ...editingProduct, id: Math.random().toString(36).substr(2, 9) }]);
      }
      setIsEditModalOpen(false);
      setEditingProduct(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && editingProduct) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setEditingProduct({ ...editingProduct, image: ev.target?.result as string });
          };
          reader.readAsDataURL(file);
      }
  };

  return (
      <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
              <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                  <input 
                    type="text" 
                    placeholder="Search products by name or SKU..." 
                    className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary"
                  />
              </div>
              <button 
                onClick={() => {
                    setEditingProduct({ id: '', name: '', price: 0, category: 'General', stock: 0, sku: '', taxable: true, color: 'bg-gray-500' });
                    setIsEditModalOpen(true);
                }}
                className="bg-surface hover:bg-surface-highlight border border-border text-on-surface px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition"
              >
                  <Plus className="h-4 w-4" /> Add Product
              </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border custom-scrollbar">
              <table className="w-full text-sm text-left min-w-[800px]">
                  <thead className="bg-surface-highlight/50 text-on-surface-muted uppercase text-xs font-bold">
                      <tr>
                          <th className="px-6 py-4">Product</th>
                          <th className="px-6 py-4">SKU</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4 text-right">Price</th>
                          <th className="px-6 py-4 text-right">Stock</th>
                          <th className="px-6 py-4 text-center">Taxable</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                      {products.map(product => (
                          <tr key={product.id} className="hover:bg-surface-highlight/30 transition group">
                              <td className="px-6 py-4 font-bold text-on-surface flex items-center gap-3">
                                  {product.image ? (
                                      <img src={product.image} alt={product.name} className="h-8 w-8 rounded-lg object-cover" />
                                  ) : (
                                      <div className={`h-8 w-8 rounded-lg ${product.color}`}></div>
                                  )}
                                  {product.name}
                              </td>
                              <td className="px-6 py-4 text-on-surface-muted font-mono">{product.sku}</td>
                              <td className="px-6 py-4">
                                  <span className="px-2 py-1 rounded-lg bg-surface border border-border text-xs font-medium">{product.category}</span>
                              </td>
                              <td className="px-6 py-4 text-right font-mono font-bold">${product.price.toFixed(2)}</td>
                              <td className="px-6 py-4 text-right font-mono">
                                  <span className={`${product.stock && product.stock < 20 ? 'text-danger font-bold' : 'text-on-surface'}`}>
                                      {product.stock}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                  {product.taxable ? <Check className="h-4 w-4 text-secondary mx-auto" /> : <X className="h-4 w-4 text-on-surface-muted mx-auto" />}
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                      <button 
                                        onClick={() => {
                                            setEditingProduct(product);
                                            setIsEditModalOpen(true);
                                        }}
                                        className="p-2 bg-surface hover:bg-primary hover:text-white rounded-lg text-on-surface-muted transition shadow-sm border border-border"
                                        title="Edit Product"
                                      >
                                          <Edit3 className="h-4 w-4" />
                                      </button>
                                      <button 
                                        onClick={() => setProducts(products.filter(p => p.id !== product.id))}
                                        className="p-2 bg-surface hover:bg-danger hover:text-white rounded-lg text-on-surface-muted transition shadow-sm border border-border"
                                        title="Delete Product"
                                      >
                                          <Trash2 className="h-4 w-4" />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>

          {/* PRODUCT EDIT MODAL */}
          {isEditModalOpen && editingProduct && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                  <div className="bg-surface border border-border p-6 rounded-2xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]">
                      <h2 className="text-xl font-bold text-on-surface mb-6">
                          {editingProduct.id ? 'Edit Product' : 'New Product'}
                      </h2>
                      <form onSubmit={handleSaveProduct} className="space-y-4">
                          
                          {/* Image Upload */}
                          <div className="flex items-center gap-4">
                              <div className="h-20 w-20 bg-background border border-border rounded-xl flex items-center justify-center overflow-hidden">
                                  {editingProduct.image ? (
                                      <img src={editingProduct.image} alt="Preview" className="h-full w-full object-cover" />
                                  ) : (
                                      <Image className="h-8 w-8 text-on-surface-muted" />
                                  )}
                              </div>
                              <label className="flex-1 cursor-pointer">
                                  <div className="border border-dashed border-border hover:bg-surface-highlight rounded-xl p-4 flex flex-col items-center justify-center text-on-surface-muted transition">
                                      <Upload className="h-5 w-5 mb-1" />
                                      <span className="text-xs">Upload Product Image</span>
                                  </div>
                                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                              </label>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <label className="text-xs font-bold text-on-surface-muted uppercase">Name</label>
                                  <input 
                                    required
                                    type="text" 
                                    value={editingProduct.name}
                                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-xs font-bold text-on-surface-muted uppercase">SKU</label>
                                  <input 
                                    type="text" 
                                    value={editingProduct.sku || ''}
                                    onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary font-mono"
                                  />
                              </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <label className="text-xs font-bold text-on-surface-muted uppercase">Price</label>
                                  <div className="relative">
                                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-on-surface-muted" />
                                      <input 
                                        required
                                        type="number" 
                                        step="0.01"
                                        value={editingProduct.price}
                                        onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                                        className="w-full bg-background border border-border rounded-xl pl-8 pr-3 py-2 text-on-surface outline-none focus:border-primary font-mono"
                                      />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <label className="text-xs font-bold text-on-surface-muted uppercase">Stock Qty</label>
                                  <input 
                                    type="number" 
                                    value={editingProduct.stock || 0}
                                    onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary font-mono"
                                  />
                              </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-xs font-bold text-on-surface-muted uppercase">Category</label>
                              <select 
                                 value={editingProduct.category}
                                 onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                                 className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary"
                              >
                                  <option>Drinks</option>
                                  <option>Food</option>
                                  <option>Merch</option>
                                  <option>Cards</option>
                                  <option>General</option>
                              </select>
                          </div>

                          <div className="space-y-2">
                              <label className="text-xs font-bold text-on-surface-muted uppercase">Description</label>
                              <textarea 
                                 value={editingProduct.description || ''}
                                 onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                                 className="w-full bg-background border border-border rounded-xl px-3 py-2 text-on-surface outline-none focus:border-primary resize-none h-20"
                                 placeholder="Optional product details..."
                              />
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                              <input 
                                type="checkbox" 
                                checked={editingProduct.taxable}
                                onChange={e => setEditingProduct({...editingProduct, taxable: e.target.checked})}
                                id="taxable"
                                className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                              />
                              <label htmlFor="taxable" className="text-sm font-medium text-on-surface">Taxable Item</label>
                          </div>

                          <div className="pt-4 flex gap-3">
                              <button 
                                 type="button"
                                 onClick={() => setIsEditModalOpen(false)}
                                 className="flex-1 py-2.5 rounded-xl border border-border font-bold text-on-surface hover:bg-surface-highlight transition"
                              >
                                  Cancel
                              </button>
                              <button 
                                 type="submit"
                                 className="flex-1 py-2.5 rounded-xl bg-secondary text-white font-bold shadow-glow-secondary hover:bg-secondary/90 transition"
                              >
                                  Save Product
                              </button>
                          </div>
                      </form>
                  </div>
              </div>
          )}
      </div>
  );
};
