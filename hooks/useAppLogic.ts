
import { useState, useEffect } from 'react';
import { ViewState, Cashier } from '../types';
import { cleanAndParseJSON } from '../services/gemini/core';
import { useApp } from '../contexts/AppContext';
import { Nexa } from '../services/api';

export const useAppLogic = () => {
    const { 
        isSuperAdmin, setCurrentView, setPosEnabled, setActiveCashier, logout 
    } = useApp();

    // --- STATE ---
    const [cashiers, setCashiers] = useState<Cashier[]>(() => {
        try {
            const stored = localStorage.getItem('nexa_pos_cashiers');
            return cleanAndParseJSON(stored, [
              { id: 'admin', name: 'Store Manager', role: 'manager', password: 'admin', hint: 'Default is admin' },
              { id: 'c1', name: 'John Doe', role: 'cashier', password: '123', hint: '123' },
              { id: 'c2', name: 'Sarah Smith', role: 'cashier', password: '456', hint: '456' },
              { id: 'k1', name: 'Kitchen', role: 'kitchen', password: '111', hint: 'Kitchen Display' },
              { id: 'r1', name: 'Reception', role: 'reception', password: '222', hint: 'Reception Display' }
            ]);
        } catch { return []; }
    });

    const [masterConfig, setMasterConfig] = useState<{password: string | null, hint: string}>(() => {
        try {
            const stored = localStorage.getItem('nexa_master_config');
            return cleanAndParseJSON(stored, { password: null, hint: '' });
        } catch { return { password: null, hint: '' }; }
    });

    const [isLockScreenOpen, setIsLockScreenOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [masterAuth, setMasterAuth] = useState({ 
        isOpen: false, 
        mode: 'setup' as 'setup' | 'login' | 'change', 
        targetView: null as ViewState | null 
    });

    // --- EFFECTS ---
    useEffect(() => {
        Nexa.init().catch(console.error);
    }, []);

    useEffect(() => {
        localStorage.setItem('nexa_pos_cashiers', JSON.stringify(cashiers));
    }, [cashiers]);

    useEffect(() => {
        localStorage.setItem('nexa_master_config', JSON.stringify(masterConfig));
    }, [masterConfig]);

    useEffect(() => {
        const handlePosUnlock = () => setIsLockScreenOpen(true);
        
        const handlePosAuth = () => {
            if (isSuperAdmin || !masterConfig.password) setCurrentView(ViewState.TOOLS_POS_MANAGEMENT);
            else setMasterAuth({ isOpen: true, mode: 'login', targetView: ViewState.TOOLS_POS_MANAGEMENT });
        };
        
        const handleImportAuth = () => {
            if (isSuperAdmin || !masterConfig.password) setCurrentView(ViewState.TOOLS_IMPORT);
            else setMasterAuth({ isOpen: true, mode: 'login', targetView: ViewState.TOOLS_IMPORT });
        };
        
        const handlePosEnable = () => {
            if (!masterConfig.password && !isSuperAdmin) setMasterAuth({ isOpen: true, mode: 'setup', targetView: null });
            else window.dispatchEvent(new Event('enable-pos-confirmed')); 
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };

        window.addEventListener('request-pos-unlock', handlePosUnlock);
        window.addEventListener('request-pos-auth', handlePosAuth);
        window.addEventListener('request-import-auth', handleImportAuth);
        window.addEventListener('request-pos-enable', handlePosEnable);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('request-pos-unlock', handlePosUnlock);
            window.removeEventListener('request-pos-auth', handlePosAuth);
            window.removeEventListener('request-import-auth', handleImportAuth);
            window.removeEventListener('request-pos-enable', handlePosEnable);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSuperAdmin, masterConfig, setCurrentView]);

    // --- HANDLERS ---
    const onLockScreenUnlock = (userId: string) => {
        const user = cashiers.find(c => c.id === userId);
        if (user) {
            setActiveCashier(user);
            setIsLockScreenOpen(false);
            setCurrentView(ViewState.TOOLS_POS);
        }
    };

    const onLockScreenOverride = (managerId: string) => {
        const manager = cashiers.find(c => c.id === managerId);
        if (manager) alert(`Override Authorized by ${manager.name}`);
    };

    const onMasterAuthSuccess = (newPassword?: string, newHint?: string) => {
        if (masterAuth.mode === 'setup' || masterAuth.mode === 'change') {
            if (newPassword) {
                setMasterConfig({ password: newPassword, hint: newHint || '' });
                if (masterAuth.mode === 'setup') { 
                    setPosEnabled(true); 
                    alert("POS Module Enabled."); 
                } else {
                    alert("Master Password Updated.");
                }
            }
        } else if (masterAuth.mode === 'login') {
            if (masterAuth.targetView) setCurrentView(masterAuth.targetView);
        }
        setMasterAuth({ ...masterAuth, isOpen: false });
    };

    return {
        cashiers, setCashiers,
        masterConfig, setMasterConfig,
        isLockScreenOpen, setIsLockScreenOpen,
        isCommandPaletteOpen, setIsCommandPaletteOpen,
        masterAuth, setMasterAuth,
        onLockScreenUnlock, onLockScreenOverride, onMasterAuthSuccess
    };
};
