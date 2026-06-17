
import React, { useState, useEffect } from 'react';
import { Briefcase, ShieldAlert, Key, UserCheck, Info } from 'lucide-react';
import { AuthService } from '../../services/authService';
import { SecurityService } from '../../services/securityService';
import { ClientService } from '../../services/clientService'; 
import { useApp } from '../../contexts/AppContext';
import { ClientEmployee } from '../../types';
import { TwoFactorConfigurator } from './TwoFactorConfigurator';
import { IdentityForm } from './forms/IdentityForm';
import { PasswordForm } from './forms/PasswordForm';
import { SetupForm } from './forms/SetupForm';
import { TwoFactorForm } from './forms/TwoFactorForm';

export const LoginScreen: React.FC = () => {
    const { login, setActiveCashier } = useApp();
    const [loginStep, setLoginStep] = useState<'identity' | 'password' | 'setup_intro' | 'setup_password' | 'setup_2fa' | '2fa_verify' | 'locked'>('identity');
    const [authError, setAuthError] = useState('');
    const [lockoutTime, setLockoutTime] = useState<number>(0);
    const [failedAttempts, setFailedAttempts] = useState<number>(0);
    const [identifiedUser, setIdentifiedUser] = useState<ClientEmployee | null>(null);
    const [isPortalAdmin, setIsPortalAdmin] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [showTesterHelp, setShowTesterHelp] = useState(false);

    useEffect(() => {
        const savedAttempts = localStorage.getItem('nexa_failed_login');
        if (savedAttempts) setFailedAttempts(parseInt(savedAttempts, 10));
        const savedLockout = localStorage.getItem('nexa_lockout_until');
        if (savedLockout) {
            const lockTime = parseInt(savedLockout, 10);
            if (lockTime > Date.now()) {
                setLockoutTime(lockTime);
                setLoginStep('locked');
            }
        }
    }, []);

    const handleIdentityCheck = async (email: string) => {
        const input = email.toLowerCase().trim(); 
        if (!input) { setAuthError("Please enter your email or username."); return; }

        const portalAdmin = await AuthService.findAdminByEmail(input);
        if (portalAdmin) {
            setIsPortalAdmin(true);
            setIdentifiedUser({
                id: portalAdmin.id,
                name: portalAdmin.name,
                email: portalAdmin.email,
                role: 'ADMIN', 
                companyName: 'Nexa System',
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                password: portalAdmin.password,
                isSetupComplete: portalAdmin.isSetupComplete,
                twoFaSecret: portalAdmin.twoFaSecret,
                industry: 'GENERIC'
            } as any);
            setAuthError('');
            setLoginStep('password');
            return;
        }

        const clientUser = await AuthService.findUserByIdentity(input);
        if (clientUser) {
            setIsPortalAdmin(false);
            setIdentifiedUser(clientUser);
            setAuthError('');
            setLoginStep('password');
            return;
        }
        setAuthError("Account not found.");
    };

    const handlePasswordLogin = async (password: string) => {
        if (lockoutTime > Date.now()) { setLoginStep('locked'); return; }

        if (!identifiedUser) return;

        try {
            await AuthService.login(identifiedUser.email, password);

            setAuthError('');
            setFailedAttempts(0);
            AuthService.clearFailedAttempts();
            
            if (!identifiedUser.isSetupComplete) {
                setLoginStep('setup_intro');
            } else if (identifiedUser.twoFaSecret) {
                setLoginStep('2fa_verify');
            } else {
                completeLogin();
            }
        } catch (error) {
            console.error("Authentication failed: ", error);
            handleFailedAttempt();
        }
    };

    const handleFailedAttempt = () => {
        const newAttempts = AuthService.recordFailedAttempt(failedAttempts);
        setFailedAttempts(newAttempts);
        if (newAttempts >= 5) {
            const lock = Date.now() + 15 * 60 * 1000;
            setLockoutTime(lock);
            localStorage.setItem('nexa_lockout_until', lock.toString());
            setLoginStep('locked');
            setAuthError('SECURITY LOCKOUT.');
        } else {
            setAuthError(`Incorrect Password. Attempt ${newAttempts}/5`);
        }
    };

    const handleSetupPassword = (password: string, confirm: string) => {
        if (password.length < 6) { setAuthError("Password must be at least 6 characters."); return; }
        if (password !== confirm) { setAuthError("Passwords do not match."); return; }
        setNewPassword(password);
        setAuthError('');
        setLoginStep('setup_2fa');
    };

    const handleSetupComplete = (secret: string) => {
        if (!identifiedUser) return;
        const updatedUser = {
            ...identifiedUser,
            password: newPassword || identifiedUser.password,
            twoFaSecret: secret,
            isSetupComplete: true
        };
        if (isPortalAdmin) {
            AuthService.updateAdmin(updatedUser as any);
        } else {
            ClientService.updateEmployee(updatedUser, 'Self-Setup');
        }
        setIdentifiedUser(updatedUser);
        completeLogin(updatedUser);
    };

    const handle2FAVerify = async (otp: string) => {
        if (!identifiedUser?.twoFaSecret) return;
        const validToken = await SecurityService.getTOTPToken(identifiedUser.twoFaSecret);
        if (otp === validToken || (identifiedUser.twoFaSecret === 'MOCKSECRET' && otp === '000000')) {
            completeLogin();
        } else {
            setAuthError('Invalid Authenticator Code');
        }
    };

    const completeLogin = (user = identifiedUser) => {
        if (!user) return;
        if (isPortalAdmin) {
            login(user.email, 'super_dashboard', true, 'admin', 'GENERIC', 'SYSTEM_ADMIN');
        } else {
            let systemRole = 'admin'; 
            if (user.role === 'KITCHEN_STAFF') systemRole = 'kitchen';
            else if (user.role === 'RECEPTION') systemRole = 'reception';
            else if (user.role === 'CASHIER') systemRole = 'cashier';
            else if (user.role === 'RESTAURANT_MANAGER') systemRole = 'manager';
            
            if (systemRole === 'cashier' || systemRole === 'kitchen' || systemRole === 'reception') {
                setActiveCashier({ id: user.id, name: user.name, role: systemRole as any, companyName: user.companyName, industry: user.industry });
            }
            login(user.email, 'login', false, systemRole, user.industry || 'GENERIC', user.role);
        }
    };

    const handleAutoLogin = async (email: string, pass: string) => {
        setAuthError('');
        // Step 1: Check portal admin first
        const lowerEmail = email.toLowerCase().trim();
        const portalAdmin = await AuthService.findAdminByEmail(lowerEmail);
        if (portalAdmin) {
            setIsPortalAdmin(true);
            const adminProfile = {
                id: portalAdmin.id, name: portalAdmin.name, email: portalAdmin.email, role: 'ADMIN', 
                companyName: 'Nexa System', status: 'ACTIVE', password: portalAdmin.password,
                isSetupComplete: portalAdmin.isSetupComplete, twoFaSecret: portalAdmin.twoFaSecret, industry: 'GENERIC'
            };
            setIdentifiedUser(adminProfile as any);
            completeLogin(adminProfile as any);
            return;
        }

        // Development Fallback to bypass password entirely for Tester Buttons
        let role = 'ADMIN';
        if (lowerEmail.includes('owner')) role = 'OWNER';
        if (lowerEmail.includes('cfo')) role = 'CHIEF_ACCOUNTANT';
        if (lowerEmail.includes('accountant')) role = 'ACCOUNTANT';
        if (lowerEmail.includes('branch')) role = 'BRANCH_MANAGER';
        if (lowerEmail.includes('warehouse')) role = 'WAREHOUSE_MANAGER';
        if (lowerEmail.includes('posmgr')) role = 'RESTAURANT_MANAGER';
        if (lowerEmail.includes('sales')) role = 'CASHIER';
        if (lowerEmail.includes('procure')) role = 'PURCHASING_MANAGER';
        if (lowerEmail.includes('hr')) role = 'HR_MANAGER';
        if (lowerEmail.includes('employee')) role = 'VIEWER';

        const fallbackUser: any = {
            id: 'dev_' + lowerEmail,
            name: lowerEmail.split('@')[0],
            email: lowerEmail,
            role: role,
            status: 'ACTIVE',
            companyId: 'company_acme',
            companyName: 'Acme Corp',
            permissions: {},
            isSetupComplete: true,
            password: pass,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            industry: 'GENERIC'
        };

        setIsPortalAdmin(false);
        setIdentifiedUser(fallbackUser);
        completeLogin(fallbackUser as any);
    };

    if (loginStep === 'locked') {
        return (
            <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
                <div className="bg-surface border border-danger/50 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full">
                    <div className="w-16 h-16 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-4 text-danger border border-danger/30"><ShieldAlert className="h-8 w-8" /></div>
                    <h2 className="text-xl font-bold text-white mb-2">Security Lockout Active</h2>
                    <div className="bg-black/30 rounded-xl p-4 border border-danger/20 mt-4">
                        <p className="text-xs font-bold text-danger uppercase tracking-widest mb-1">Unlock Time</p>
                        <p className="font-mono text-xl text-white">{new Date(lockoutTime).toLocaleTimeString()}</p>
                    </div>
                    <button onClick={() => window.location.reload()} className="mt-6 text-sm text-zinc-500 hover:text-white underline">Check Status</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black z-0"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-lg mb-4 animate-fade-in">
                {!['setup_2fa', 'setup_intro', 'setup_password'].includes(loginStep) && (
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg mb-3">
                            <Briefcase className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Nexa Ledger AI</h1>
                        <p className="text-sm text-zinc-400">Enterprise Access Portal</p>
                    </div>
                )}

                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl relative">
                    {loginStep === 'identity' && <IdentityForm onSubmit={handleIdentityCheck} error={authError} />}
                    {loginStep === 'password' && identifiedUser && <PasswordForm user={identifiedUser} onSubmit={handlePasswordLogin} onBack={() => { setLoginStep('identity'); setAuthError(''); }} error={authError} />}
                    {loginStep === 'setup_intro' && <SetupForm introMode onStart={() => setLoginStep('setup_password')} onSetup={() => {}} />}
                    {loginStep === 'setup_password' && <SetupForm onSetup={handleSetupPassword} error={authError} />}
                    {loginStep === 'setup_2fa' && identifiedUser && <TwoFactorConfigurator userEmail={identifiedUser.email} currentPasswordToCheck="" onComplete={(secret) => handleSetupComplete(secret)} onCancel={() => setLoginStep('identity')} />}
                    {loginStep === '2fa_verify' && <TwoFactorForm onVerify={handle2FAVerify} error={authError} />}
                </div>

                {/* Tester Autofills Drawer */}
                <div className="mt-4">
                    <button 
                        onClick={() => setShowTesterHelp(!showTesterHelp)}
                        className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-primary/40 rounded-xl text-xs font-bold text-zinc-400 hover:text-primary transition flex items-center justify-center gap-1.5"
                    >
                        <Key className="h-4 w-4" /> 
                        {showTesterHelp ? 'Hide System Access Credentials ✕' : 'View System Access Credentials / Roles 🔑'}
                    </button>
                    
                    {showTesterHelp && (
                        <div className="mt-2 p-4 bg-zinc-900 border border-zinc-800 rounded-xl max-h-[380px] overflow-y-auto custom-scrollbar animate-fade-in space-y-3">
                            <div className="flex items-start gap-2 text-[10px] text-primary bg-primary/10 p-2 rounded-lg border border-primary/20">
                                <Info className="h-4 w-4 shrink-0 text-primary" />
                                <span>Click on any profile to bypass the login forms and log in immediately.</span>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Super Administrator</p>
                                <button 
                                    onClick={() => handleAutoLogin('admin@nexa.ai', 'password123')}
                                    className="w-full p-2.5 bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-lg text-left text-xs transition flex justify-between items-center"
                                >
                                    <div>
                                        <p className="font-bold text-white flex items-center gap-1"><UserCheck className="h-3.5 w-3.5 text-amber-500" /> System Root / Project Owner</p>
                                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">admin@nexa.ai / password123 (OTP: 000000)</p>
                                    </div>
                                    <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded font-extrabold">SUPER ADMIN</span>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Acme Corporates Roles</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <button 
                                        onClick={() => handleAutoLogin('owner@acme.com', 'welcome123')}
                                        className="p-2 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 rounded text-left text-xs text-white"
                                    >
                                        <p className="font-bold">CEO / Company Owner</p>
                                        <p className="text-[9px] text-zinc-500 font-mono">owner@acme.com</p>
                                    </button>
                                    <button 
                                        onClick={() => handleAutoLogin('cfo@acme.com', 'welcome123')}
                                        className="p-2 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 rounded text-left text-xs text-white"
                                    >
                                        <p className="font-bold">CFO / Fin Manager</p>
                                        <p className="text-[9px] text-zinc-500 font-mono">cfo@acme.com</p>
                                    </button>
                                    <button 
                                        onClick={() => handleAutoLogin('accountant@acme.com', 'welcome123')}
                                        className="p-2 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 rounded text-left text-xs text-white"
                                    >
                                        <p className="font-bold">Lead Accountant</p>
                                        <p className="text-[9px] text-zinc-500 font-mono">accountant@acme.com</p>
                                    </button>
                                    <button 
                                        onClick={() => handleAutoLogin('branch@acme.com', 'welcome123')}
                                        className="p-2 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 rounded text-left text-xs text-white"
                                    >
                                        <p className="font-bold">Branch Manager</p>
                                        <p className="text-[9px] text-zinc-500 font-mono">branch@acme.com</p>
                                    </button>
                                    <button 
                                        onClick={() => handleAutoLogin('warehouse@acme.com', 'welcome123')}
                                        className="p-2 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 rounded text-left text-xs text-white"
                                    >
                                        <p className="font-bold">Inventory Manager</p>
                                        <p className="text-[9px] text-zinc-500 font-mono">warehouse@acme.com</p>
                                    </button>
                                    <button 
                                        onClick={() => handleAutoLogin('posmgr@acme.com', 'welcome123')}
                                        className="p-2 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 rounded text-left text-xs text-white"
                                    >
                                        <p className="font-bold">POS/Resto Manager</p>
                                        <p className="text-[9px] text-zinc-500 font-mono">posmgr@acme.com</p>
                                    </button>
                                    <button 
                                        onClick={() => handleAutoLogin('sales@acme.com', 'welcome123')}
                                        className="p-2 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 rounded text-left text-xs text-white"
                                    >
                                        <p className="font-bold">Cashier / Sales</p>
                                        <p className="text-[9px] text-zinc-500 font-mono">sales@acme.com</p>
                                    </button>
                                    <button 
                                        onClick={() => handleAutoLogin('procure@acme.com', 'welcome123')}
                                        className="p-2 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 rounded text-left text-xs text-white"
                                    >
                                        <p className="font-bold">Procurement</p>
                                        <p className="text-[9px] text-zinc-500 font-mono">procure@acme.com</p>
                                    </button>
                                    <button 
                                        onClick={() => handleAutoLogin('hr@acme.com', 'welcome123')}
                                        className="p-2 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 rounded text-left text-xs text-white"
                                    >
                                        <p className="font-bold">HR Director</p>
                                        <p className="text-[9px] text-zinc-500 font-mono">hr@acme.com</p>
                                    </button>
                                    <button 
                                        onClick={() => handleAutoLogin('employee@acme.com', 'welcome123')}
                                        className="p-2 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-800 rounded text-left text-xs text-white animate-pulse"
                                    >
                                        <p className="font-bold">Employee (Scan In)</p>
                                        <p className="text-[9px] text-zinc-500 font-mono">employee@acme.com</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
