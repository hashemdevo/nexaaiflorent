
import React from 'react';
import { ViewState, Cashier } from '../types';
import { Dashboard } from './Dashboard';
import { ReportsContainer } from './Reports';
import { BankInsights, AnomalyDetection, ComplianceAudit } from './AIInsights';
import { AdvancedAnalytics } from './AdvancedAnalytics';
import { ManagementContainer } from './Management';
import { Inventory } from './Inventory';
import { SimulatorDashboard } from './simulation/SimulatorDashboard';
import { ClientSettings } from './workspace/ClientSettings';
import { AccessControlAdmin } from './admin/AccessControlAdmin';
import { KitchenDisplay } from './KitchenDisplay';
import { ReceptionDisplay } from './ReceptionDisplay';

// Sub-Routers
import { IndustryViews } from './routes/IndustryViews';
import { HrViews } from './routes/HrViews';
import { OperationsViews } from './routes/OperationsViews';

// Navigation & Security
import { useApp } from '../contexts/AppContext';
import { MAIN_NAVIGATION } from '../config/navigation';
import { ShieldAlert, Lock } from 'lucide-react';

interface ViewManagerProps {
    currentView: ViewState;
    isReadOnly: boolean;
    isSuperAdmin: boolean;
    cashiers: Cashier[];
    currentThemeName: string;
    onUpdateCashiers: (cashiers: Cashier[]) => void;
    onNavigate: (view: ViewState) => void;
}

export const ViewManager: React.FC<ViewManagerProps> = ({ 
    currentView, isReadOnly, isSuperAdmin, cashiers, currentThemeName, onUpdateCashiers, onNavigate 
}) => {
    const { currentUniversalRole } = useApp();

    // Enforce "Need-to-Know Basis" authorization check at the router level
    const navItem = MAIN_NAVIGATION.find(item => item.view === currentView);
    if (navItem && currentUniversalRole) {
        const isAllowed = !navItem.allowedRoles || navItem.allowedRoles.includes(currentUniversalRole);
        const isForbidden = navItem.forbiddenRoles && navItem.forbiddenRoles.includes(currentUniversalRole);
        if (!isAllowed || isForbidden) {
            return (
                <div id="unauthorized-module-card" className="bg-surface border border-rose-500/30 rounded-3xl p-8 shadow-xl max-w-2xl mx-auto my-12 relative overflow-hidden text-right animate-fade-in" dir="rtl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-red-650 to-amber-500" />
                    
                    <div className="flex flex-col items-center text-center gap-4 mb-6">
                        <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)] animate-pulse">
                            <ShieldAlert className="h-10 w-10" />
                        </div>
                        <h2 className="text-xl font-black text-white">منطقة غير مصرح بها (صلاحيات غير كافية)</h2>
                        <p className="text-xs text-on-surface-muted leading-relaxed max-w-md">
                            عذراً، لا تملك الصلاحيات المخصصة لعرض وحدة <strong>{navItem.label || currentView}</strong>. تم فرض هذا الإجراء الأمني استناداً لسياسات "مبدأ الحاجة إلى المعرفة" (Need-to-Know Basis) لفصل التشغيل اليومي عن القرارات المالية والاستراتيجية للمؤسسة.
                        </p>
                    </div>

                    <div className="bg-surface-highlight/30 border border-border p-5 rounded-2xl mb-6 space-y-3">
                        <div className="text-xs font-bold text-on-surface-muted flex items-center gap-2">
                            <Lock className="h-4 w-4 text-amber-500" />
                            <span>تفاصيل رقابة الامتثال وإذن التشغيل:</span>
                        </div>
                        <div className="text-xs space-y-1.5 text-on-surface-muted leading-normal">
                            <div>• الدور التنظيمي الحالي للمستخدم: <span className="font-mono text-secondary font-bold uppercase bg-secondary/10 px-1.5 py-0.5 rounded border border-secondary/20">{currentUniversalRole}</span></div>
                            {navItem.allowedRoles && (
                                <div className="leading-relaxed">• الأدوار المسموح لها باستعراض الوحدة حصراً: <span className="font-mono text-emerald-400 font-semibold bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">{navItem.allowedRoles.join(' | ')}</span></div>
                            )}
                            <div>• حالة العملية البرمجية: <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">ACCESS_DENIED (محجوبة تلقائياً)</span></div>
                        </div>
                    </div>

                    <p className="text-[11px] text-on-surface-muted text-center leading-relaxed">
                        إذا كنت ترى أن هذا الحظر غير مقصود، يرجى التواصل مع المدير المالي أو مالك المنشأة لتحديث صلاحيات المستخدم الخاص بك من شاشة الموارد البشرية.
                    </p>
                </div>
            );
        }
    }
    
    // 1. Core Dashboards
    if (currentView === ViewState.DASHBOARD) return <Dashboard currentTheme={currentThemeName} />;
    
    // 2. Specialized Full Screen Displays
    if (currentView === ViewState.TOOLS_KITCHEN) return <KitchenDisplay />;
    if (currentView === ViewState.TOOLS_RECEPTION) return <ReceptionDisplay />;

    // 3. Sub-Module Routing
    if (currentView.startsWith('INDUSTRY_')) return <IndustryViews view={currentView} />;
    if (currentView.startsWith('HRM_')) return <HrViews view={currentView} />;
    if (currentView.startsWith('TOOLS_')) return <OperationsViews view={currentView} readOnly={isReadOnly} cashiers={cashiers} onUpdateCashiers={onUpdateCashiers} onNavigate={onNavigate} />;

    // 4. Remaining Core Modules
    switch(currentView) {
        // Reports
        case ViewState.REPORTS_FINANCIAL:
        case ViewState.REPORTS_TRIAL_BALANCE:
        case ViewState.REPORTS_RECONCILIATION:
        case ViewState.REPORTS_FIXED_ASSETS:
            return <ReportsContainer view={currentView} readOnly={isReadOnly} />;
        case ViewState.REPORTS_BANK_INSIGHTS:
            return <BankInsights />;
        
        // Analytics
        case ViewState.ANALYTICS_ANOMALY:
            return <AnomalyDetection />;
        case ViewState.ANALYTICS_ADVANCED:
            return <AdvancedAnalytics currentTheme={currentThemeName} />;
        
        // Simulation
        case ViewState.SIMULATION_DASHBOARD:
            return <SimulatorDashboard />;

        // Management
        case ViewState.MANAGEMENT_COST_CONTROL:
        case ViewState.MANAGEMENT_PROVISIONS:
        case ViewState.MANAGEMENT_AUTOMATION:
            return <ManagementContainer view={currentView} readOnly={isReadOnly} />;
        case ViewState.MANAGEMENT_INVENTORY:
            return <Inventory readOnly={isReadOnly} />;

        // Compliance
        case ViewState.COMPLIANCE_INTEGRITY:
            return <ComplianceAudit />;
        
        // Settings
        case ViewState.SETTINGS:
            return <ClientSettings />;
            
        case ViewState.ADMIN_ACCESS_CONTROL:
            return <AccessControlAdmin />;
        
        default:
            return <div>Select a module</div>;
    }
};
