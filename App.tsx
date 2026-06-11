
import React from 'react';
import { Menu } from 'lucide-react';
import { ViewState } from './types';
import { THEME_GROUPS } from './themes';
import { AppProvider, useApp } from './contexts/AppContext';
import { useAppLogic } from './hooks/useAppLogic';

// Components
import { Sidebar } from './components/layout/Sidebar';
import { LoginScreen } from './components/auth/LoginScreen';
import { LockScreenOverlay } from './components/auth/LockScreenOverlay';
import { MasterAuthModal } from './components/auth/MasterAuthModal';
import { VisitorChatWidget } from './components/SupportChat';
import { AccessRestrictedScreen } from './components/common/AccessRestrictedScreen';
import { POS } from './components/POS';
import { ViewManager } from './components/ViewManager';
import { TransactionDirectorModal } from './components/transactions/TransactionDirectorModal';
import { ClientPortal } from './components/ClientPortal';
import { AdminPortal } from './components/AdminPortal';
import { KitchenDisplay } from './components/KitchenDisplay';
import { ReceptionDisplay } from './components/ReceptionDisplay';
import { CommandPalette } from './components/common/CommandPalette';
import { BackendPageViewer } from './components/common/BackendPageViewer';

const AppContent: React.FC = () => {
  const { 
    isAuthenticated, isSuperAdmin, accountStatus, isExpired, currentUserRole,
    currentView, setCurrentView, mobileMenuOpen, setMobileMenuOpen, sidebarWidth,
    setPosEnabled, setActiveCashier, activeGroupIndex,
    isTransactionModalOpen, setIsTransactionModalOpen,
    logout
  } = useApp();

  const {
      cashiers, setCashiers,
      masterConfig, setMasterConfig,
      isLockScreenOpen, setIsLockScreenOpen,
      isCommandPaletteOpen, setIsCommandPaletteOpen,
      masterAuth, setMasterAuth,
      onLockScreenUnlock, onLockScreenOverride, onMasterAuthSuccess
  } = useAppLogic();

  // --- RENDER ---

  if (!isAuthenticated) return <LoginScreen />;

  // 1. POS Terminal (Cashier Role or Manual Launch)
  if (currentView === ViewState.TOOLS_POS) { 
      return (
          <POS 
              onExit={() => { setActiveCashier(null); logout(); }} 
              onBackToDashboard={() => setCurrentView(ViewState.DASHBOARD)}
          />
      ); 
  }
  
  // 2. Kitchen Display System (KDS) - Full Screen for Kitchen Role
  if (currentView === ViewState.TOOLS_KITCHEN && currentUserRole === 'kitchen') {
      return (
          <div className="relative h-screen bg-background">
              <KitchenDisplay />
              <button onClick={logout} className="fixed bottom-4 right-4 bg-danger/20 text-danger px-4 py-2 rounded-lg hover:bg-danger hover:text-white transition font-bold z-50">Exit KDS</button>
          </div>
      );
  }

  // 3. Reception Display - Full Screen for Reception Role
  if (currentView === ViewState.TOOLS_RECEPTION && currentUserRole === 'reception') {
      return (
          <div className="relative h-screen bg-background">
              <ReceptionDisplay />
              <button onClick={logout} className="fixed bottom-4 right-4 bg-danger/20 text-danger px-4 py-2 rounded-lg hover:bg-danger hover:text-white transition font-bold z-50">Exit Reception</button>
          </div>
      );
  }
  
  // 4. Client & Admin Portals
  if (currentView === ViewState.CLIENT_PORTAL) {
      return (
        <>
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
            <ClientPortal />
        </>
      );
  }

  if (currentView === ViewState.SUPER_ADMIN_PORTAL) {
      return <AdminPortal />;
  }

  if (!isSuperAdmin && accountStatus === 'RESTRICTED') {
      return <AccessRestrictedScreen companyName="Your Company" contactEmail="support@nexa.ai" />;
  }

  const currentThemeName = THEME_GROUPS[activeGroupIndex].name;
  const isReadOnly = isExpired || accountStatus === 'SUSPENDED';
  
  // Operational Roles (Kitchen, Reception) are handled above.
  if (currentUserRole === 'kitchen' || currentUserRole === 'reception') {
      return <AccessRestrictedScreen companyName="Restricted Area" contactEmail="manager@nexa.ai" />;
  }

  return (
    <div className="flex h-screen bg-background text-on-surface overflow-hidden font-sans relative transition-colors duration-500">
      
      {/* Global Overlays */}
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
      <BackendPageViewer />
      
      <LockScreenOverlay 
          isOpen={isLockScreenOpen} 
          cashiers={cashiers} 
          onUnlock={onLockScreenUnlock} 
          onClose={() => setIsLockScreenOpen(false)}
          onOverride={onLockScreenOverride}
      />

      <MasterAuthModal 
          isOpen={masterAuth.isOpen}
          mode={masterAuth.mode}
          currentConfig={masterConfig}
          onAuthSuccess={onMasterAuthSuccess}
          onClose={() => setMasterAuth({ ...masterAuth, isOpen: false })}
          isSuperAdmin={isSuperAdmin}
      />

      <TransactionDirectorModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)} 
      />

      {/* Admin/Manager Sidebar */}
      <Sidebar />

      <main 
        className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'ml-0' : 'ml-0 md:ml-[256px]'}`} 
        style={{ marginLeft: mobileMenuOpen ? 0 : `${sidebarWidth}px` }}
      >
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
            <div className="md:hidden flex items-center justify-between mb-6">
                <button onClick={() => setMobileMenuOpen(true)} className="p-2 bg-surface border border-border rounded-xl text-on-surface shadow-sm">
                    <Menu className="h-6 w-6" />
                </button>
                <span className="font-bold text-lg text-on-surface">Nexa Ledger</span>
                <div className="w-10"></div>
            </div>
            
            
            {/* Official Corporate Letterhead - Prepared for pre-printed letterhead and printing papers */}
            <div className="hidden print:flex flex-col w-full mb-8 border-b-2 border-slate-700 pb-4 text-black font-sans printable-letterhead" dir="rtl">
                <div className="flex justify-between items-start w-full">
                    {/* Right Section: Arabic Corporate Info */}
                    <div className="text-right text-[11px] leading-relaxed text-slate-800">
                        <h1 className="text-lg font-bold text-slate-900 tracking-tight">نكسـا ليدجـر للأنظمة المحاسبية</h1>
                        <p className="font-medium text-slate-600">شركة نكسا للحلول المالية والذكاء الاصطناعي</p>
                        <p>الرقم الضريبي: <span className="font-mono">٣٠٠٤٥١٢٩٨٤٠٠٠٠٣</span></p>
                        <p>السجل التجاري: <span className="font-mono">١٠١٠٣٤٥٧٢٢</span></p>
                        <p>المركز الرئيسي: الرياض، المملكة العربية السعودية</p>
                    </div>

                    {/* Center Section: Seal / Logo Symbol */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full border-2 border-slate-800 flex items-center justify-center font-bold text-xl text-slate-900 bg-slate-50 shadow-sm">
                            N
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-1">OFFICIAL DOCUMENT</span>
                    </div>

                    {/* Left Section: English Corporate Info */}
                    <div className="text-left text-[11px] leading-relaxed text-slate-800" dir="ltr">
                        <h1 className="text-base font-bold text-slate-900 tracking-tight">NEXA LEDGER SYSTEMS</h1>
                        <p className="font-medium text-slate-600">Nexa Financial Solutions & AI Corp.</p>
                        <p>Unified Tax ID: <span className="font-mono">300451298400003</span></p>
                        <p>Commercial Reg: <span className="font-mono">1010345722</span></p>
                        <p>HQ Support: info@nexa.ai | www.nexa.ai</p>
                    </div>
                </div>
                
                {/* Divider line / Accent bar */}
                <div className="w-full h-1 bg-gradient-to-r from-slate-400 via-slate-800 to-slate-400 mt-4 mb-2"></div>
                
                {/* Metadata bar below divider */}
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium px-1">
                    <div>تاريخ المستند: {new Date().toLocaleDateString('ar-SA')} م | {new Date().toLocaleDateString('en-US')}</div>
                    <div className="uppercase">نظام الحوكمة والتدقيق المالي الذكي (NEXALEDGER AI)</div>
                    <div>صفحة التقارير الرسمية الموحدة</div>
                </div>
            </div>

            <ViewManager 
              currentView={currentView}
              isReadOnly={isReadOnly}
              isSuperAdmin={isSuperAdmin}
              cashiers={cashiers}
              currentThemeName={currentThemeName}
              onUpdateCashiers={setCashiers}
              onNavigate={setCurrentView}
            />
            
        </div>
      </main>
      
      {!isSuperAdmin && <VisitorChatWidget />}
    </div>
  );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;
