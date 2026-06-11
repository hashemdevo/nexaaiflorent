import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { 
    GripVertical, Eye, EyeOff, RotateCcw, LayoutGrid, 
    ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { StatCards } from './StatCards';
import { TrendChart } from './TrendChart';
import { KeyPerformanceIndicators } from './KeyPerformanceIndicators';
import { CashFlowForecastWidget } from './CashFlowForecastWidget';
import { TopProductsWidget } from './TopProductsWidget';
import { AgingSummary } from './AgingSummary';
import { RecentTransactions } from './RecentTransactions';
import { ExpenseBreakdown } from './ExpenseBreakdown';

interface WidgetConfig {
    id: string;
    title: string;
    colSpan: 4 | 6 | 8 | 12;
    visible: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
    { id: 'stat-cards', title: 'Key Metric Summary', colSpan: 12, visible: true },
    { id: 'trend-chart', title: 'Revenue & Sales Trend', colSpan: 8, visible: true },
    { id: 'kpis', title: 'Core KPI Gauges', colSpan: 4, visible: true },
    { id: 'cash-flow', title: 'Cash Flow Forecast', colSpan: 8, visible: true },
    { id: 'top-products', title: 'Top Performing Products', colSpan: 4, visible: true },
    { id: 'aging-summary', title: 'Accounts Receivable Aging', colSpan: 12, visible: true },
    { id: 'recent-transactions', title: 'Recent Transaction Ledger', colSpan: 8, visible: true },
    { id: 'expense-breakdown', title: 'Expense Category Breakdown', colSpan: 4, visible: true }
];

const LOCAL_STORAGE_KEY = 'nexa_dashboard_bento_config';

export const FinancialOverview: React.FC = () => {
    const { isCustomizingLayout, setIsCustomizingLayout, currentUserIdentity } = useApp();
    const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // Load from LocalStorage & Cloud (Firestore)
    useEffect(() => {
        const localKey = currentUserIdentity 
            ? `${LOCAL_STORAGE_KEY}_${currentUserIdentity}` 
            : LOCAL_STORAGE_KEY;
        try {
            const saved = localStorage.getItem(localKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const merged = DEFAULT_WIDGETS.map(def => {
                        const existing = parsed.find((p: any) => p.id === def.id);
                        return existing ? { ...def, ...existing } : def;
                    });
                    setWidgets(merged);
                }
            }
        } catch (e) {
            console.error("Local configuration loading failed", e);
        }

        // Direct Cloud Sync layout fetch
        if (currentUserIdentity) {
            const fetchCloudLayout = async () => {
                try {
                    const docRef = doc(db, 'user_bento_layouts', currentUserIdentity);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data && Array.isArray(data.widgets)) {
                            const cloudWidgets = data.widgets;
                            const merged = DEFAULT_WIDGETS.map(def => {
                                const existing = cloudWidgets.find((p: any) => p.id === def.id);
                                return existing ? { ...def, ...existing } : def;
                            });
                            setWidgets(merged);
                            localStorage.setItem(localKey, JSON.stringify(merged));
                        }
                    } else {
                        // Persist standard current configuration to cloud on initial setup
                        const currentLocal = localStorage.getItem(localKey);
                        const initialWidgets = currentLocal ? JSON.parse(currentLocal) : DEFAULT_WIDGETS;
                        await setDoc(docRef, {
                            userId: currentUserIdentity,
                            widgets: initialWidgets,
                            updatedAt: new Date().toISOString()
                        });
                    }
                } catch (err) {
                    console.error("Cloud layout sync loading failed:", err);
                }
            };
            fetchCloudLayout();
        }
    }, [currentUserIdentity]);

    // Save to LocalStorage & Cloud Storage (Firestore)
    const saveWidgets = async (newWidgets: WidgetConfig[]) => {
        const localKey = currentUserIdentity 
            ? `${LOCAL_STORAGE_KEY}_${currentUserIdentity}` 
            : LOCAL_STORAGE_KEY;
        try {
            localStorage.setItem(localKey, JSON.stringify(newWidgets));
            
            // Cloud Sync to Firestore
            if (currentUserIdentity) {
                const docRef = doc(db, 'user_bento_layouts', currentUserIdentity);
                await setDoc(docRef, {
                    userId: currentUserIdentity,
                    widgets: newWidgets,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            }
        } catch (e) {
            console.error("Failed to save dashboard layout configuration", e);
        }
    };

    const handleReset = async () => {
        if (window.confirm("Are you sure you want to reset your dashboard layout to default?")) {
            setWidgets(DEFAULT_WIDGETS);
            const localKey = currentUserIdentity 
                ? `${LOCAL_STORAGE_KEY}_${currentUserIdentity}` 
                : LOCAL_STORAGE_KEY;
            localStorage.removeItem(localKey);
            
            if (currentUserIdentity) {
                try {
                    const docRef = doc(db, 'user_bento_layouts', currentUserIdentity);
                    await deleteDoc(docRef);
                } catch (err) {
                    console.error("Failed to delete cloud bento layout config on reset:", err);
                }
            }
        }
    };

    // Toggle Visibility
    const toggleVisibility = (id: string) => {
        const updated = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
        setWidgets(updated);
        saveWidgets(updated);
    };

    // Change Column Span (4 -> 6 -> 8 -> 12)
    const cycleColSpan = (id: string) => {
        const updated = widgets.map(w => {
            if (w.id === id) {
                let nextColSpan: 4 | 6 | 8 | 12;
                if (w.colSpan === 4) nextColSpan = 6;
                else if (w.colSpan === 6) nextColSpan = 8;
                else if (w.colSpan === 8) nextColSpan = 12;
                else nextColSpan = 4;
                return { ...w, colSpan: nextColSpan };
            }
            return w;
        });
        setWidgets(updated);
        saveWidgets(updated);
    };

    // Directional arrow navigation
    const moveIndex = (index: number, direction: 'prev' | 'next') => {
        const targetIndex = direction === 'prev' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= widgets.length) return;

        const updated = [...widgets];
        const temp = updated[index];
        updated[index] = updated[targetIndex];
        updated[targetIndex] = temp;
        
        setWidgets(updated);
        saveWidgets(updated);
    };

    // Native Drag and Drop Implementation
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        
        // Setup transparent ghost spacing
        const ghost = document.createElement('div');
        ghost.style.display = 'none';
        e.dataTransfer.setDragImage(ghost, 0, 0);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        
        // Swap positions instantly during mouse dragging for premium feel
        const updated = [...widgets];
        const [movedItem] = updated.splice(draggedIndex, 1);
        updated.splice(index, 0, movedItem);
        
        setDraggedIndex(index);
        setWidgets(updated);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        saveWidgets(widgets);
    };

    // Render Widget Component
    const renderWidget = (id: string) => {
        switch (id) {
            case 'stat-cards':
                return <StatCards />;
            case 'trend-chart':
                return <TrendChart />;
            case 'kpis':
                return <KeyPerformanceIndicators />;
            case 'cash-flow':
                return <CashFlowForecastWidget />;
            case 'top-products':
                return <TopProductsWidget />;
            case 'aging-summary':
                return <AgingSummary />;
            case 'recent-transactions':
                return <RecentTransactions />;
            case 'expense-breakdown':
                return <ExpenseBreakdown />;
            default:
                return null;
        }
    };

    const getColSpanClass = (span: number) => {
        switch (span) {
            case 4: return 'lg:col-span-4';
            case 6: return 'lg:col-span-6';
            case 8: return 'lg:col-span-8';
            case 12: default: return 'lg:col-span-12';
        }
    };

    const getSpanLabel = (span: number) => {
        switch (span) {
            case 4: return 'Compact (1/3)';
            case 6: return 'Medium (1/2)';
            case 8: return 'Wide (2/3)';
            case 12: default: return 'Full (1/1)';
        }
    };

    return (
        <div className="animate-fade-in pb-12">
            {/* Bento header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-8 mb-4 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface-muted uppercase tracking-wider">Financial Overview</span>
                    {widgets.some(w => !w.visible) && (
                        <span className="text-[10px] px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full font-mono font-medium">
                            {widgets.filter(w => !w.visible).length} Hidden
                        </span>
                    )}
                </div>

                {isCustomizingLayout && (
                    <div className="flex items-center gap-3 animate-slide-in">
                        <button 
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-highlight hover:bg-surface-highlight-active text-on-surface text-xs font-semibold rounded-lg border border-border transition hover:text-red-400"
                            title="Reset layout to default"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset Layout
                        </button>
                        <button 
                            onClick={() => setIsCustomizingLayout(false)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-black text-xs font-bold rounded-lg hover:shadow-glow-primary transition"
                        >
                            <Check className="h-3.5 w-3.5" />
                            Finish Customizing
                        </button>
                    </div>
                )}
            </div>

            {/* Customization Ribbon */}
            {isCustomizingLayout && (
                <div className="mb-6 bg-amber-500/5 border border-amber-500/20 text-xs text-amber-500 p-4 rounded-xl flex items-start gap-3 animate-pulse shadow-sm font-mono max-w-4xl">
                    <LayoutGrid className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-bold">✨ Bento Grid Workspace Active</p>
                        <p className="text-on-surface-muted leading-relaxed font-sans">
                            Drag widgets by their <strong className="text-amber-500">handle</strong> to reposition. Use the built-in control actions on each card to cycle column grid span sizes, shift coordinates sequentially, or toggle visibility.
                        </p>
                    </div>
                </div>
            )}

            {/* Bento Widgets Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 transition-all duration-300">
                {widgets.map((widget, index) => {
                    const isDragged = draggedIndex === index;
                    const isVisible = widget.visible;
                    const colSpanClass = getColSpanClass(widget.colSpan);

                    // Skip displaying hidden widgets if we are in view (standard) mode
                    if (!isVisible && !isCustomizingLayout) {
                        return null;
                    }

                    return (
                        <div
                            key={widget.id}
                            id={`bento-widget-${widget.id}`}
                            className={`
                                transition-all duration-200 relative group rounded-2xl h-full
                                ${colSpanClass}
                                ${isCustomizingLayout ? 'p-1.5 border-2 border-dashed bg-surface/30' : ''}
                                ${isVisible ? (isCustomizingLayout ? 'border-amber-500/30 shadow-md' : '') : 'border-border/20 bg-surface/10 opacity-35'}
                                ${isDragged ? 'opacity-25 scale-95 border-primary duration-0' : ''}
                            `}
                            draggable={isCustomizingLayout}
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                        >
                            {/* Controller Bar Overlay */}
                            {isCustomizingLayout && (
                                <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between text-[11px] bg-background/95 backdrop-blur border border-border px-3 py-2 rounded-xl shadow-lg ring-1 ring-black/10">
                                    {/* Grabbing Handle & Label */}
                                    <div className="flex items-center gap-1.5 cursor-grab active:cursor-grabbing font-bold text-on-surface font-mono">
                                        <GripVertical className="h-4 w-4 text-amber-500 shrink-0" />
                                        <span className="truncate max-w-[125px] md:max-w-xs">{widget.title}</span>
                                    </div>

                                    {/* Layout Edit Operations */}
                                    <div className="flex items-center gap-1.5 select-none shrink-0 font-sans">
                                        {/* Grid Column Selector Button */}
                                        <button
                                            onClick={() => cycleColSpan(widget.id)}
                                            className="px-2 py-0.5 bg-surface-highlight hover:bg-surface-highlight-active text-on-surface border border-border/80 hover:border-amber-500/40 rounded-md transition-all text-[10px] font-mono font-medium"
                                            title="Cycle grid width span"
                                        >
                                            {getSpanLabel(widget.colSpan)}
                                        </button>

                                        {/* Shift arrow controls */}
                                        <div className="flex items-center border border-border/60 rounded-md bg-surface-highlight h-[22px]">
                                            <button
                                                disabled={index === 0}
                                                onClick={() => moveIndex(index, 'prev')}
                                                className="p-1 text-on-surface-muted hover:text-on-surface disabled:opacity-20 transition border-r border-border/40"
                                                title="Move widget up/left"
                                            >
                                                <ChevronLeft className="h-3 w-3" />
                                            </button>
                                            <button
                                                disabled={index === widgets.length - 1}
                                                onClick={() => moveIndex(index, 'next')}
                                                className="p-1 text-on-surface-muted hover:text-on-surface disabled:opacity-20 transition"
                                                title="Move widget down/right"
                                            >
                                                <ChevronRight className="h-3 w-3" />
                                            </button>
                                        </div>

                                        {/* Toggle Visibility */}
                                        <button
                                            onClick={() => toggleVisibility(widget.id)}
                                            className={`p-1 rounded transition-colors ${
                                                isVisible 
                                                ? 'text-green-500 hover:bg-green-500/10' 
                                                : 'text-red-400 hover:bg-red-500/10 bg-red-500/5'
                                            }`}
                                            title={isVisible ? 'Hide widget metrics' : 'Show widget metrics'}
                                        >
                                            {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Mask overlay when widget is hidden */}
                            {!isVisible && isCustomizingLayout && (
                                <div className="min-h-[175px] h-full flex flex-col items-center justify-center p-6 bg-surface/5 rounded-xl border border-dashed border-border/30 select-none">
                                    <EyeOff className="h-7 w-7 text-on-surface-muted mb-2 stroke-1" />
                                    <div className="text-xs font-bold text-on-surface/40 font-mono text-center mb-3">
                                        {widget.title} (Hidden)
                                    </div>
                                    <button 
                                        onClick={() => toggleVisibility(widget.id)}
                                        className="flex items-center gap-1.5 px-3 py-1 bg-green-500/15 border border-green-500/30 text-green-500 hover:bg-green-500/25 text-[11px] font-bold rounded-lg transition"
                                    >
                                        <Eye className="h-3 w-3" /> Show Widget
                                    </button>
                                </div>
                            )}

                            {/* Render Core Component */}
                            {isVisible && (
                                <div className={`h-full ${isCustomizingLayout ? 'pt-14' : ''}`}>
                                    {renderWidget(widget.id)}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
