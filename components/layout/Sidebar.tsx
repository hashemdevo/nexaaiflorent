
import React, { useState, useEffect, useMemo } from 'react';
import { X, Palette, Moon, Sun, GripVertical, Command, Store, Settings } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { ViewState } from '../../types';
import { LogoutButton } from '../common/LogoutButton';
import { MAIN_NAVIGATION, NavItemConfig } from '../../config/navigation';

export const Sidebar: React.FC = () => {
    const { 
        currentView, setCurrentView, 
        mobileMenuOpen, setMobileMenuOpen, 
        sidebarWidth, setSidebarWidth,
        isDarkMode, toggleDarkMode, cycleTheme,
        isPosEnabled, currentUserIndustry, currentUniversalRole, setCurrentUniversalRole,
        currentUserIdentity, currentUserRole,
        isSuperAdmin, currentTenantName, setCurrentTenantName
    } = useApp();

    const [isResizing, setIsResizing] = useState(false);

    const formatUserRole = (uRole: string | null, legacyRole: string | null) => {
        const roleStr = uRole || legacyRole || 'User';
        const mapping: Record<string, string> = {
            'SYSTEM_ADMIN': 'System Admin',
            'ADMIN': 'Administrator',
            'CASHIER': 'Cashier',
            'KITCHEN_STAFF': 'Kitchen Staff',
            'RECEPTION': 'Receptionist',
            'RESTAURANT_MANAGER': 'Manager',
            'AUDITOR': 'Auditor',
            'ACCOUNTANT': 'Accountant',
            'kitchen': 'Kitchen Staff',
            'reception': 'Receptionist',
            'manager': 'Manager',
            'admin': 'Administrator'
        };
        if (mapping[roleStr]) {
            return mapping[roleStr];
        }
        return roleStr
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, c => c.toUpperCase());
    };

    const formatUserIdentity = (identity: string | null) => {
        if (!identity) return '';
        const namePart = identity.includes('@') ? identity.split('@')[0] : identity;
        return namePart
            .replace(/[._-]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizing) {
                const newWidth = Math.max(240, Math.min(400, e.clientX));
                setSidebarWidth(newWidth);
            }
        };
        const handleMouseUp = () => setIsResizing(false);

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, setSidebarWidth]);

    // Dynamic filtering logic
    const visibleItems = useMemo(() => {
        let items = [...MAIN_NAVIGATION];
        
        // Inject POS items if enabled
        if (isPosEnabled) {
            const posItems: NavItemConfig[] = [
                { id: 'pos_grp', type: 'group', label: 'Retail Point of Sale' },
                { 
                    id: 'pos_term', 
                    type: 'item', 
                    label: 'POS Terminal', 
                    view: ViewState.TOOLS_POS, 
                    icon: Store,
                    forbiddenRoles: ['OWNER', 'PARTNER', 'CEO', 'AUDITOR', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT']
                },
                { 
                    id: 'pos_mgmt', 
                    type: 'item', 
                    label: 'POS Management', 
                    view: ViewState.TOOLS_POS_MANAGEMENT, 
                    icon: Settings,
                    allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'RESTAURANT_MANAGER', 'BRANCH_MANAGER', 'GENERAL_MANAGER', 'ADMIN', 'SYSTEM_ADMIN']
                },
            ];
            // Insert before Tools group
            const toolsIndex = items.findIndex(i => i.id === 'tool_grp');
            if (toolsIndex > -1) {
                items.splice(toolsIndex, 0, ...posItems);
            } else {
                items.push(...posItems);
            }
        }

        const filtered = items.filter(item => {
            // Role Blacklist/Whitelist
            if (item.forbiddenRoles && currentUniversalRole && item.forbiddenRoles.includes(currentUniversalRole)) return false;
            if (item.allowedRoles && currentUniversalRole && !item.allowedRoles.includes(currentUniversalRole)) return false;

            // Industry Filter
            if (item.allowedIndustries) {
                if (currentUserIndustry && !item.allowedIndustries.includes(currentUserIndustry) && !item.allowedIndustries.includes('GENERIC')) {
                    return false;
                }
            }
            return true;
        });

        // Suppress group headers that have no items under them
        return filtered.filter((item, index, arr) => {
            if (item.type !== 'group') return true;
            // Scan forward to see if there is at least one item of type 'item' before the next group
            for (let i = index + 1; i < arr.length; i++) {
                if (arr[i].type === 'group') break;
                if (arr[i].type === 'item') return true;
            }
            return false;
        });
    }, [isPosEnabled, currentUniversalRole, currentUserIndustry]);

    return (
        <>
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
            )}

            <aside 
                className={`fixed top-0 left-0 h-full bg-surface border-r border-border z-50 flex flex-col transition-all duration-300 ease-in-out ${
                    mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
                }`}
                style={{ width: mobileMenuOpen ? 256 : sidebarWidth }}
            >
                <div className="min-h-[5.5rem] flex flex-col justify-center px-6 border-b border-border relative shrink-0 py-4 gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-glow-primary shrink-0">N</div>
                        <div className={`overflow-hidden transition-all duration-300 ${sidebarWidth < 180 ? 'opacity-0 w-0' : 'opacity-100'}`}>
                            <h1 className="font-bold text-sm text-on-surface leading-none mb-1 truncate max-w-[150px]" title={currentTenantName}>
                                {currentTenantName}
                            </h1>
                            <p className="text-[10px] text-on-surface-muted uppercase tracking-widest leading-none">Enterprise AI</p>
                        </div>
                    </div>
                    {sidebarWidth >= 180 && currentUserIdentity && (
                        <>
                            <div className="mt-1.5 bg-surface-highlight/45 border border-border/80 px-2.5 py-1.5 rounded-xl flex items-center gap-2 animate-fade-in">
                                <span className="relative flex h-2 w-2 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <p className="text-[10.5px] text-on-surface-muted font-medium truncate leading-tight">
                                    <span className="text-primary font-bold">{formatUserIdentity(currentUserIdentity)}</span>
                                    <span className="text-on-surface-muted text-[9.5px] mx-1">as</span>
                                    <span className="text-secondary font-semibold capitalize bg-secondary/10 px-1.5 py-0.5 rounded border border-secondary/20">{formatUserRole(currentUniversalRole, currentUserRole)}</span>
                                </p>
                            </div>
                            <div className="mt-2 text-[11px]">
                                <select 
                                    title="تبديل ملف الشركة (Multi-Tenant Selector)"
                                    value={currentView === ViewState.SUPER_ADMIN_PORTAL ? 'SUPER_ADMIN_CONSOLE' : currentTenantName}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'SUPER_ADMIN_CONSOLE') {
                                            setCurrentView(ViewState.SUPER_ADMIN_PORTAL);
                                        } else {
                                            setCurrentTenantName(val);
                                            // Switch view to dashboard so they load this enterprise operations layout
                                            if (currentView === ViewState.SUPER_ADMIN_PORTAL) {
                                                setCurrentView(ViewState.DASHBOARD);
                                            }
                                        }
                                    }}
                                    className="w-full bg-background border border-border/80 rounded-xl px-2.5 py-2 text-on-surface outline-none focus:border-primary font-bold shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
                                >
                                    {isSuperAdmin ? (
                                        <>
                                            <option value="شركة نكسا ليدجر المحدودة (العمليات)">🏢 شركة نكسا ليدجر (العمليات)</option>
                                            <option value="مجموعة أكمي للأغذية (الافتراضية)">🏬 مجموعة أكمي (الافتراضية)</option>
                                            <option value="SUPER_ADMIN_CONSOLE">⚙️ منصة الإدارة (Admin Panel)</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="الشركة الرئيسية (المقر)">🏢 الشركة الرئيسية (المقر)</option>
                                            <option value="فرع المصنع الأول">🏭 فرع المصنع الأول</option>
                                            <option value="فرع المبيعات المركزي">🏬 فرع المبيعات المركزي</option>
                                        </>
                                    )}
                                </select>
                            </div>
                            <div className="mt-2 text-[11px] space-y-1">
                                <label className="text-[9px] uppercase font-bold tracking-wider text-primary">🎭 Role Simulator:</label>
                                <select 
                                    title="محاكاة أدوار الموظفين (Role Simulator)"
                                    value={currentUniversalRole || ''}
                                    onChange={(e) => {
                                        const selectedRole = e.target.value;
                                        setCurrentUniversalRole(selectedRole as any);
                                    }}
                                    className="w-full bg-primary/10 border border-primary/25 rounded-xl px-2.5 py-1.5 text-primary outline-none focus:border-primary font-bold shadow-sm cursor-pointer hover:bg-primary/20 transition-all text-[11px]"
                                >
                                    <option value="OWNER">👑 Owner / CEO</option>
                                    <option value="ACCOUNTANT">📊 المحاسب (Accountant)</option>
                                    <option value="HR_SPECIALIST">👥 الموارد البشرية (HR Specialist)</option>
                                    <option value="PURCHASING_SPECIALIST">🛒 المشتريات (Procurement)</option>
                                    <option value="SALES_REP">📈 المبيعات (Sales Rep)</option>
                                </select>
                            </div>
                        </>
                    )}
                    {mobileMenuOpen && (
                        <button onClick={() => setMobileMenuOpen(false)} className="absolute right-4 text-on-surface-muted"><X className="h-6 w-6" /></button>
                    )}
                </div>

                {sidebarWidth > 180 && (
                    <div className="px-4 pt-4">
                        <button 
                            onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                            className="w-full flex items-center justify-between px-3 py-2 bg-surface-highlight/30 hover:bg-surface-highlight border border-border/50 rounded-xl text-xs text-on-surface-muted transition group"
                        >
                            <span className="flex items-center gap-2 font-medium"><Command className="h-3 w-3" /> Quick Command</span>
                            <span className="bg-surface border border-border px-1.5 py-0.5 rounded text-[9px] font-mono group-hover:border-primary/50 transition">Cmd+K</span>
                        </button>
                    </div>
                )}

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                    {visibleItems.map((item) => {
                        if (item.type === 'group') {
                            return sidebarWidth > 180 ? (
                                <div key={item.id} className="px-3 pt-6 pb-2">
                                    <p className="text-[10px] font-bold text-on-surface-muted uppercase tracking-widest">{item.label}</p>
                                </div>
                            ) : <div key={item.id} className="h-4" />;
                        }
                        
                        if (item.type === 'item') {
                            const isActive = currentView === item.view;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => { if (item.view) setCurrentView(item.view); setMobileMenuOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive ? 'bg-primary text-black font-bold shadow-glow-primary' : 'text-on-surface-muted hover:bg-surface-highlight hover:text-on-surface'}`}
                                >
                                    <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-black/10' : 'bg-surface border border-border group-hover:border-primary/50'}`}>
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    {sidebarWidth > 100 && <span className="text-sm truncate">{item.label}</span>}
                                    {isActive && sidebarWidth > 100 && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-black"></div>}
                                </button>
                            );
                        }
                        return null;
                    })}
                </nav>

                <div className="p-4 border-t border-border shrink-0 space-y-2">
                    {sidebarWidth > 180 && (
                        <div className="flex items-center justify-between bg-surface-highlight p-1 rounded-xl mb-2">
                            <button onClick={toggleDarkMode} className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-bold transition ${isDarkMode ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-muted'}`}><Moon className="h-3 w-3 mr-1" /> Dark</button>
                            <button onClick={toggleDarkMode} className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs font-bold transition ${!isDarkMode ? 'bg-surface text-on-surface shadow-sm' : 'text-on-surface-muted'}`}><Sun className="h-3 w-3 mr-1" /> Light</button>
                        </div>
                    )}
                    <button onClick={cycleTheme} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-on-surface-muted hover:bg-surface-highlight hover:text-on-surface transition text-sm font-medium">
                        <Palette className="h-4 w-4" />
                        {sidebarWidth > 180 && <span>Switch Theme</span>}
                    </button>
                    <LogoutButton variant="sidebar" />
                </div>

                <div 
                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/50 transition z-50"
                    onMouseDown={() => setIsResizing(true)}
                >
                    <div className="absolute top-1/2 -right-3 -mt-4 p-1 bg-surface border border-border rounded-full shadow-sm text-on-surface-muted hover:text-primary transition cursor-col-resize hidden md:flex">
                        <GripVertical className="h-3 w-3" />
                    </div>
                </div>
            </aside>
        </>
    );
};
