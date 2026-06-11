
import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, FileText, Package, ChevronRight } from 'lucide-react';
import { Nexa } from '../../services/api';
import { SearchResult } from '../../services/search/types';

export const GlobalSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const search = async () => {
            if (query.length < 2) {
                setResults([]);
                return;
            }
            
            setIsLoading(true);
            try {
                // Simulate network delay for realism
                await new Promise(r => setTimeout(r, 300));
                const hits = await Nexa.Core.Search.search(query);
                setResults(hits);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(search, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [query]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'CUSTOMER': return <User className="h-4 w-4 text-secondary" />;
            case 'INVOICE': return <FileText className="h-4 w-4 text-primary" />;
            case 'PRODUCT': return <Package className="h-4 w-4 text-warning" />;
            default: return <Search className="h-4 w-4" />;
        }
    };

    return (
        <div className="relative w-full max-w-md" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
                <input 
                    type="text" 
                    placeholder="Search invoices, customers, items..." 
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full bg-surface border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary transition shadow-sm placeholder:text-on-surface-muted/70"
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    </div>
                )}
            </div>

            {isOpen && (query.length >= 2) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in backdrop-blur-xl">
                    {results.length === 0 && !isLoading ? (
                        <div className="p-4 text-center text-on-surface-muted text-sm">
                            No results found.
                        </div>
                    ) : (
                        <div className="py-2">
                            <div className="px-4 py-2 text-[10px] font-bold text-on-surface-muted uppercase tracking-wider border-b border-border/50 mb-1">
                                Top Results
                            </div>
                            {results.map(result => (
                                <button 
                                    key={`${result.type}-${result.id}`}
                                    className="w-full text-left px-4 py-3 hover:bg-surface-highlight transition flex items-center gap-3 group"
                                    onClick={() => { 
                                        alert(`Navigating to ${result.link}`); 
                                        setIsOpen(false); 
                                        setQuery(''); 
                                    }}
                                >
                                    <div className="p-2 bg-surface border border-border rounded-lg group-hover:border-primary/30 transition">
                                        {getIcon(result.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm text-on-surface truncate">{result.title}</div>
                                        <div className="text-xs text-on-surface-muted truncate">{result.description}</div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-on-surface-muted opacity-0 group-hover:opacity-100 transition transform group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
