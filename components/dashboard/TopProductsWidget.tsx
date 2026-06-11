
import React, { useEffect, useState } from 'react';
import { Package, ArrowRight } from 'lucide-react';
import { Nexa } from '../../services/api';
import { TopProduct } from '../../services/analytics/types';

export const TopProductsWidget: React.FC = () => {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [maxRevenue, setMaxRevenue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const topItems = await Nexa.Analytics.Sales.getTopProducts(5);
      setProducts(topItems);
      if (topItems.length > 0) {
        setMaxRevenue(Math.max(...topItems.map(i => i.revenue)));
      }
    };
    fetchData();
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border h-full animate-fade-in flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-on-surface text-lg flex items-center gap-2">
          <Package className="h-5 w-5 text-secondary" />
          Top Products
        </h3>
        <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
          View All <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-5">
        {products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-on-surface-muted">
            <p className="text-sm">No sales data yet.</p>
          </div>
        ) : (
          products.map((product, idx) => (
            <div key={idx} className="group">
              <div className="flex justify-between items-end mb-2 text-sm">
                <span className="font-medium text-on-surface truncate pr-4">{product.name}</span>
                <span className="font-mono font-bold text-on-surface">
                  ${product.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              
              {/* Progress Bar Container */}
              <div className="w-full bg-surface-highlight h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-secondary to-emerald-400 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between mt-1 text-[10px] text-on-surface-muted">
                <span>{product.quantitySold} units sold</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary cursor-pointer">Details</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
