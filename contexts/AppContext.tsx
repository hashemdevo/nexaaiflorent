
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ViewState, Cashier, IndustryType, UniversalRole } from '../types';
import { THEME_GROUPS } from '../themes';

interface AppContextType {
    // Auth State
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    currentUserIdentity: string | null;
    currentUserRole: string | null; // Legacy simplified role
    currentUniversalRole: UniversalRole | null; // New granular role
    currentUserIndustry: IndustryType | 'GENERIC'; // New industry context
    authMode: 'loading' | 'setup' | 'login' | 'super_dashboard' | 'client_portal';
    accountStatus: 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED';
    isExpired: boolean;
    
    // View State
    currentView: ViewState;
    mobileMenuOpen: boolean;
    sidebarWidth: number;
    
    // Theme State
    isDarkMode: boolean;
    activeGroupIndex: number;
    
    // POS State
    isPosEnabled: boolean;
    activeCashier: Cashier | null;
    
    // Global Modal State
    isTransactionModalOpen: boolean;
    isCustomizingLayout: boolean;
    
    // Multi-tenant and Dynamic Company State
    currentTenantName: string;
    setCurrentTenantName: (name: string) => void;
    
    // Actions
    setCurrentUniversalRole: (role: UniversalRole | null) => void;
    setCurrentUserIndustry: (industry: IndustryType | 'GENERIC') => void;
    login: (identity: string, mode: 'super_dashboard' | 'client_portal' | 'login', isSuper?: boolean, role?: string, industry?: IndustryType, uRole?: UniversalRole) => void;
    logout: () => void;
    setCurrentView: (view: ViewState) => void;
    setMobileMenuOpen: (open: boolean) => void;
    setSidebarWidth: (width: number) => void;
    toggleDarkMode: () => void;
    cycleTheme: () => void;
    setPosEnabled: (enabled: boolean) => void;
    setActiveCashier: (cashier: Cashier | null) => void;
    setAccountStatus: (status: 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED') => void;
    setIsExpired: (expired: boolean) => void;
    setIsTransactionModalOpen: (open: boolean) => void;
    setIsCustomizingLayout: (customizing: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Auth
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        try {
            return !!localStorage.getItem('currentUserIdentity');
        } catch { return false; }
    });
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [currentUserIdentity, setCurrentUserIdentity] = useState<string | null>(() => {
        try {
            return localStorage.getItem('currentUserIdentity');
        } catch { return null; }
    });
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
    const [currentUniversalRole, setCurrentUniversalRole] = useState<UniversalRole | null>(() => {
        try {
            return localStorage.getItem('currentUniversalRole') as UniversalRole;
        } catch { return null; }
    });
    const [currentUserIndustry, setCurrentUserIndustry] = useState<IndustryType | 'GENERIC'>('GENERIC');
    
    const [authMode, setAuthMode] = useState<'loading' | 'setup' | 'login' | 'super_dashboard' | 'client_portal'>('loading');
    const [accountStatus, setAccountStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'RESTRICTED'>('ACTIVE');
    const [isExpired, setIsExpired] = useState(false);

    // View
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(() => {
        try {
            const saved = localStorage.getItem('sidebarWidth');
            return saved ? parseInt(saved, 10) : 256;
        } catch { return 256; }
    });

    // Theme
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [activeGroupIndex, setActiveGroupIndex] = useState(0);

    // POS - Persisted State
    const [isPosEnabled, setPosEnabledState] = useState(() => {
        try {
            const saved = localStorage.getItem('nexa_pos_enabled');
            // If key doesn't exist, default to false (disabled)
            return saved === 'true';
        } catch { return false; }
    });
    
    const [activeCashier, setActiveCashier] = useState<Cashier | null>(null);

    // Global Modals
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [isCustomizingLayout, setIsCustomizingLayout] = useState(false);

    // Multi-tenant Corporate Name State
    const [currentTenantName, setCurrentTenantName] = useState<string>(() => {
        try {
            const saved = localStorage.getItem('nexa_current_tenant_name');
            return saved || 'شركة نكسا ليدجر المحدودة (الرئيسية)';
        } catch {
            return 'شركة نكسا ليدجر المحدودة (الرئيسية)';
        }
    });

    useEffect(() => {
        localStorage.setItem('nexa_current_tenant_name', currentTenantName);
    }, [currentTenantName]);

    // Initialization
    useEffect(() => {
        setAuthMode('login');
    }, []);

    // Theme Effect
    useEffect(() => {
        const group = THEME_GROUPS[activeGroupIndex];
        const themeClass = isDarkMode ? group.darkId : group.lightId;
        document.body.className = `antialiased selection:bg-primary selection:text-white ${themeClass}`;
    }, [activeGroupIndex, isDarkMode]);

    // Sidebar Persistence
    useEffect(() => {
        localStorage.setItem('sidebarWidth', sidebarWidth.toString());
    }, [sidebarWidth]);

    const setPosEnabled = (enabled: boolean) => {
        setPosEnabledState(enabled);
        localStorage.setItem('nexa_pos_enabled', String(enabled));
    };

    const login = (identity: string, mode: 'super_dashboard' | 'client_portal' | 'login', isSuper: boolean = false, role: string = 'admin', industry: IndustryType = 'GENERIC', uRole: UniversalRole = 'ADMIN') => {
        setCurrentUserIdentity(identity);
        try {
            localStorage.setItem('currentUserIdentity', identity);
            localStorage.setItem('currentUniversalRole', uRole);
        } catch (e) { console.error(e); }
        setAuthMode(mode);
        setIsSuperAdmin(isSuper);
        setIsAuthenticated(true);
        setCurrentUserRole(role);
        setCurrentUserIndustry(industry);
        setCurrentUniversalRole(uRole);
        
        // Strict Role Routing
        if (role === 'kitchen') {
            setCurrentView(ViewState.TOOLS_KITCHEN);
        } else if (role === 'reception') {
            setCurrentView(ViewState.TOOLS_RECEPTION);
        } else if (role === 'cashier') {
            // Cashiers usually go to POS, but might need to unlock terminal first
            // We set them to POS view directly for this flow
            setCurrentView(ViewState.TOOLS_POS); 
        } else if (mode === 'super_dashboard') {
            setCurrentView(ViewState.SUPER_ADMIN_PORTAL);
        } else if (mode === 'client_portal') {
            setCurrentView(ViewState.CLIENT_PORTAL);
        } else {
            setCurrentView(ViewState.DASHBOARD);
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setIsSuperAdmin(false);
        setCurrentUserIdentity(null);
        setCurrentUserRole(null);
        try {
            localStorage.removeItem('currentUserIdentity');
            localStorage.removeItem('currentUniversalRole');
        } catch (e) { console.error(e); }
        setCurrentUniversalRole(null);
        setCurrentUserIndustry('GENERIC');
        setAuthMode('login');
        setCurrentView(ViewState.DASHBOARD);
        setAccountStatus('ACTIVE');
        setActiveCashier(null);
    };

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
    const cycleTheme = () => setActiveGroupIndex((prev) => (prev + 1) % THEME_GROUPS.length);

    return (
        <AppContext.Provider value={{
            isAuthenticated, isSuperAdmin, currentUserIdentity, currentUserRole, authMode, accountStatus, isExpired,
            currentUniversalRole, currentUserIndustry,
            currentView, mobileMenuOpen, sidebarWidth,
            isDarkMode, activeGroupIndex,
            isPosEnabled, activeCashier,
            isTransactionModalOpen, isCustomizingLayout,
            currentTenantName, setCurrentTenantName,
            setCurrentUniversalRole, setCurrentUserIndustry,
            login, logout, setCurrentView, setMobileMenuOpen, setSidebarWidth,
            toggleDarkMode, cycleTheme, setPosEnabled, setActiveCashier,
            setAccountStatus, setIsExpired, setIsTransactionModalOpen, setIsCustomizingLayout
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within AppProvider");
    return context;
};
