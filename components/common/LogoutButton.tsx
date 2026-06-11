
import React from 'react';
import { LogOut } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface LogoutButtonProps {
    variant?: 'sidebar' | 'header' | 'icon-only';
    className?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ variant = 'header', className = '' }) => {
    const { logout } = useApp();

    const baseClasses = "transition-all duration-300 flex items-center justify-center gap-2 font-bold cursor-pointer";
    
    const variants = {
        sidebar: "w-full p-2 rounded-lg text-on-surface-muted hover:text-danger hover:bg-danger/10 justify-start",
        header: "px-4 py-2 rounded-xl bg-surface border border-border text-on-surface hover:bg-danger hover:border-danger hover:text-white shadow-sm text-xs uppercase tracking-wider",
        'icon-only': "p-2 rounded-lg text-on-surface-muted hover:text-danger hover:bg-danger/10"
    };

    return (
        <button 
            onClick={logout} 
            className={`${baseClasses} ${variants[variant]} ${className}`}
            title="Sign Out"
        >
            <LogOut className={variant === 'sidebar' ? "h-4 w-4" : "h-4 w-4"} />
            {variant !== 'icon-only' && <span>Log Out</span>}
        </button>
    );
};
