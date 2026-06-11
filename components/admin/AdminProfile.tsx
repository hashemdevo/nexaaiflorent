
import React, { useState, useEffect } from 'react';
import { User, Lock, Shield, Save, Key, Mail, Check, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { AuthService } from '../../services/authService';
import { SecurityService } from '../../services/securityService';
import { PortalAdmin } from '../../types';

export const AdminProfile: React.FC = () => {
    const { currentUserIdentity } = useApp();
    const [admin, setAdmin] = useState<PortalAdmin | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [isReset2FAOpen, setIsReset2FAOpen] = useState(false);

    useEffect(() => {
        (async () => {
            if (currentUserIdentity) {
                const found = await AuthService.findAdminByEmail(currentUserIdentity);
                if (found) {
                    setAdmin(found);
                    setFormData(prev => ({ ...prev, name: found.name, email: found.email }));
                }
            }
        })();
    }, [currentUserIdentity]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!admin) return;

        setStatus('saving');
        setErrorMessage('');

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setErrorMessage("New passwords do not match.");
            setStatus('error');
            return;
        }

        // In a real app, we would verify currentPassword against auth provider first
        if (formData.newPassword && admin.password !== formData.currentPassword) {
             setErrorMessage("Current password incorrect.");
             setStatus('error');
             return;
        }

        const updatedAdmin: PortalAdmin = {
            ...admin,
            name: formData.name,
            email: formData.email,
            password: formData.newPassword ? formData.newPassword : admin.password
        };

        try {
            await AuthService.updateAdmin(updatedAdmin);
            SecurityService.logAction('ADMIN', admin.name, 'UPDATE', 'My Profile', 'Updated personal details');
            
            setAdmin(updatedAdmin);
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
            
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (err) {
            setErrorMessage("Failed to save profile.");
            setStatus('error');
        }
    };

    const handleConfirmReset2FA = async () => {
        if (!admin) return;
        
        await AuthService.reset2FA(admin.id);
        SecurityService.logAction('ADMIN', admin.name, 'SECURITY', 'My Profile', 'Self-reset 2FA credentials');
        
        const updated = await AuthService.findAdminByEmail(admin.email);
        if (updated) setAdmin(updated);
        
        setIsReset2FAOpen(false);
        setStatus('success');
        setErrorMessage('2FA Reset Successful. Please re-configure on next login.');
        setTimeout(() => {
            setStatus('idle');
            setErrorMessage('');
        }, 4000);
    };

    if (!admin) return <div className="p-8 text-center text-on-surface-muted">Loading profile...</div>;

    return (
        <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-black shadow-lg ${admin.role === 'ROOT' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                    {admin.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-on-surface">{admin.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-on-surface-muted">
                        <span className="bg-surface-highlight px-2 py-0.5 rounded border border-border text-xs uppercase tracking-wider">{admin.role} Administrator</span>
                        <span>•</span>
                        <span>{admin.email}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Settings Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSaveProfile} className="glass-panel p-8 rounded-2xl border border-border space-y-6">
                        {/* ... Form Fields (Use standard JSX for inputs) ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Full Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Email</label>
                                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary" readOnly={admin.role !== 'ROOT'} />
                             </div>
                        </div>
                        
                        <div className="pt-6 border-t border-border">
                             <div className="flex items-center gap-2 mb-4"><Key className="h-5 w-5 text-primary" /> <h3 className="font-bold text-on-surface">Change Password</h3></div>
                             <div className="space-y-4">
                                <input type="password" value={formData.currentPassword} onChange={e => setFormData({...formData, currentPassword: e.target.value})} placeholder="Current Password" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary" />
                                <input type="password" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} placeholder="New Password" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary" />
                                <input type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} placeholder="Confirm New" className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary" />
                             </div>
                        </div>

                        {errorMessage && (
                            <div className={`p-3 rounded-xl flex items-center gap-2 text-sm font-bold ${status === 'error' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-secondary/10 text-secondary border border-secondary/20'}`}>
                                {status === 'error' ? <AlertCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />} {errorMessage}
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button type="submit" disabled={status === 'saving'} className="bg-primary hover:bg-primary-hover text-black font-bold py-3 px-8 rounded-xl shadow-glow-primary transition flex items-center gap-2 disabled:opacity-50">
                                {status === 'saving' ? 'Saving...' : <><Save className="h-4 w-4" /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* RIGHT COLUMN: Security Status */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-border">
                        <div className="flex items-center gap-2 mb-4 text-on-surface">
                            <Shield className="h-5 w-5 text-secondary" />
                            <h3 className="font-bold">Security Status</h3>
                        </div>
                        <div className="p-4 bg-surface-highlight/20 border border-border rounded-xl flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-on-surface">Two-Factor Auth</p>
                                <p className={`text-xs ${admin.twoFaSecret ? 'text-secondary' : 'text-warning'}`}>
                                    {admin.twoFaSecret ? 'Enabled' : 'Disabled'}
                                </p>
                            </div>
                            {admin.twoFaSecret && (
                                <button onClick={() => setIsReset2FAOpen(true)} className="p-2 bg-surface hover:bg-warning/10 hover:text-warning text-on-surface-muted rounded-lg transition" title="Reset">
                                    <RefreshCw className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reset 2FA Modal */}
            {isReset2FAOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl w-full max-w-md text-center">
                         <RefreshCw className="h-12 w-12 text-warning mx-auto mb-4" />
                         <h2 className="text-2xl font-bold text-on-surface mb-2">Reset My 2FA</h2>
                         <p className="text-on-surface-muted text-sm mb-6">You will need to scan a new QR code next time you login.</p>
                         <div className="flex flex-col gap-3">
                            <button onClick={handleConfirmReset2FA} className="w-full py-3.5 bg-warning text-black font-bold rounded-xl">Confirm Reset</button>
                            <button onClick={() => setIsReset2FAOpen(false)} className="w-full py-3.5 bg-transparent border border-border text-on-surface font-bold rounded-xl">Cancel</button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
};
