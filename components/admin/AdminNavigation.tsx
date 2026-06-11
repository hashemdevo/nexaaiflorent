
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TabDef {
    id: string;
    label: string;
    icon: LucideIcon;
    allowed: boolean;
}

interface AdminNavigationProps {
    tabs: TabDef[];
    activeTab: string;
    onTabChange: (id: string) => void;
    className?: string;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({ tabs, activeTab, onTabChange, className }) => {
    return (
        <nav className={`flex items-center gap-1 bg-surface/50 p-1.5 rounded-xl border border-border/50 backdrop-blur-sm overflow-x-auto custom-scrollbar ${className || ''}`}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap
                            ${isActive 
                                ? 'bg-primary text-black shadow-glow-primary' 
                                : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-highlight'
                            }
                        `}
                    >
                        <tab.icon className={`h-4 w-4 ${isActive ? 'text-black' : ''}`} />
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};
