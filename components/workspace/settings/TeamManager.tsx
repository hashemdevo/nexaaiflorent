
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Shield, User, Check, X, Mail, Phone, RefreshCw, ShieldOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { ClientEmployee, ClientPermissions, UniversalRole } from '../../../types';
import { ClientService } from '../../../services/clientService';
import { useApp } from '../../../contexts/AppContext';
import { getRoleLabel } from '../../../config/roles';

const DEFAULT_PERMISSIONS: ClientPermissions = {
    viewFinancialReports: false,
    manageLedger: false,
    approveExpenses: false,
    createInvoices: false,
    accessPos: false,
    manageCustomers: false,
    viewInventory: true,
    adjustStock: false,
    manageSuppliers: false,
    manageTeam: false,
    viewAuditLogs: false,
    manageSettings: false,
    exportData: false
};

export const TeamManager: React.FC = () => {
    const { currentUserIdentity, currentUniversalRole } = useApp();
    const [employees, setEmployees] = useState<ClientEmployee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEmp, setCurrentEmp] = useState<Partial<ClientEmployee>>({});
    
    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        setIsLoading(true);
        try {
            const data = await ClientService.getEmployees();
            setEmployees(data);
        } catch (error) {
            console.error("Failed to load employees", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- HIERARCHY LOGIC ---
    const getRank = (role?: UniversalRole | string): number => {
        if (!role) return 0;
        if (['OWNER', 'CEO', 'SYSTEM_ADMIN'].includes(role)) return 3;
        if (role.includes('MANAGER') || role === 'ADMIN' || role.includes('HEAD')) return 2;
        if (['CASHIER', 'KITCHEN_STAFF', 'DELIVERY', 'NURSE', 'TEACHER', 'SALES_REP', 'ACCOUNTANT', 'LAWYER'].includes(role)) return 1;
        return 0;
    };

    const myRank = getRank(currentUniversalRole || 'VIEWER');

    const getAssignableRoles = (): UniversalRole[] => {
        const allRoles: UniversalRole[] = [
            'RESTAURANT_MANAGER', 'CASHIER', 'KITCHEN_STAFF', 'DELIVERY', 'RECEPTION',
            'PROJECT_MANAGER', 'SITE_ENGINEER', 'FOREMAN',
            'DOCTOR', 'NURSE', 'PHARMACIST',
            'SALES_MANAGER', 'SALES_REP',
            'ACCOUNTANT', 'HR_MANAGER', 'PLANT_MANAGER', 'PRODUCTION_LEAD',
            'PROPERTY_MANAGER', 'LEASING_AGENT', 'PRINCIPAL', 'TEACHER', 'LAWYER', 'PARALEGAL'
        ];
        return allRoles.filter(r => getRank(r) < myRank);
    };

    const canManageUser = (targetUser: ClientEmployee) => {
        return getRank(targetUser.role) < myRank;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const actor = currentUserIdentity || 'Owner';
        
        if (!currentEmp.id && currentEmp.role && getRank(currentEmp.role) >= myRank) {
            alert("Security Alert: You cannot create a user with equal or higher rank.");
            return;
        }

        if (currentEmp.id) {
            await ClientService.updateEmployee(currentEmp as ClientEmployee, actor);
        } else {
            const newEmployeeData: Partial<ClientEmployee> = {
                ...currentEmp,
                status: 'ACTIVE',
                permissions: currentEmp.permissions || DEFAULT_PERMISSIONS,
                isSetupComplete: false,
                password: 'temp',
                twoFaSecret: undefined
            };
            await ClientService.addEmployee(newEmployeeData, actor);
        }
        await loadEmployees();
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Permanently remove this user from the organization?")) {
            const actor = currentUserIdentity || 'Owner';
            await ClientService.deleteEmployee(id, actor);
            loadEmployees();
        }
    };

    const handleReset2FA = async (emp: ClientEmployee) => {
        if (window.confirm(`Reset 2FA for ${emp.name}? They will need to re-configure it next login.`)) {
            const actor = currentUserIdentity || 'Owner';
            const updated = { ...emp, twoFaSecret: undefined, isSetupComplete: false };
            await ClientService.updateEmployee(updated, actor);
            loadEmployees();
            alert("2FA Credentials Reset. User must setup account again.");
        }
    };

    const handleStatusChange = async (emp: ClientEmployee, newStatus: 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED') => {
        const actor = currentUserIdentity || 'Owner';
        const updated = { ...emp, status: newStatus };
        await ClientService.updateEmployee(updated, actor);
        loadEmployees();
    };

    if (isLoading) return <div className="p-8 text-center text-on-surface-muted">Loading Team...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-on-surface">Team Management</h3>
                    <p className="text-sm text-on-surface-muted">Control access, roles, and security for your staff.</p>
                </div>
                {myRank > 1 && (
                    <button 
                        onClick={() => { setCurrentEmp({ role: 'CASHIER', permissions: DEFAULT_PERMISSIONS }); setIsModalOpen(true); }}
                        className="px-6 py-2.5 bg-primary text-black font-bold rounded-xl flex items-center gap-2 hover:bg-primary-hover transition shadow-glow-primary"
                    >
                        <Plus className="h-5 w-5" /> Add New Member
                    </button>
                )}
            </div>

            {/* Employees List */}
            <div className="grid grid-cols-1 gap-4">
                {employees.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl text-on-surface-muted">
                        <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium">No team members found.</p>
                    </div>
                )}
                {employees.map(emp => (
                    <div key={emp.id} className="bg-surface border border-border p-6 rounded-2xl flex flex-col gap-6 hover:border-primary/30 transition shadow-sm group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg ${getRank(emp.role) >= 2 ? 'bg-gradient-to-br from-purple-600 to-blue-600' : 'bg-zinc-700'}`}>
                                    {emp.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-lg text-on-surface">{emp.name}</h4>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${emp.status === 'ACTIVE' ? 'bg-secondary/10 text-secondary border-secondary/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                                            {emp.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-muted mt-1">
                                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {emp.email}</span>
                                        {emp.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {emp.phone}</span>}
                                        <span className="bg-surface-highlight px-2 py-0.5 rounded border border-border text-[10px] uppercase font-bold tracking-wider text-primary">
                                            {getRoleLabel(emp.role)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {canManageUser(emp) && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <button 
                                        onClick={() => { setCurrentEmp(emp); setIsModalOpen(true); }}
                                        className="px-3 py-2 bg-surface hover:bg-surface-highlight border border-border rounded-lg text-xs font-bold text-on-surface transition flex items-center gap-2"
                                    >
                                        <Edit3 className="h-3 w-3" /> Edit
                                    </button>
                                    
                                    <div className="h-6 w-px bg-border mx-1"></div>

                                    <button 
                                        onClick={() => handleReset2FA(emp)}
                                        className={`p-2 rounded-lg transition ${emp.twoFaSecret ? 'text-secondary hover:bg-secondary/10' : 'text-on-surface-muted opacity-50 cursor-not-allowed'}`}
                                        title="Reset 2FA & Setup"
                                        disabled={!emp.twoFaSecret}
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </button>
                                    
                                    {emp.status === 'ACTIVE' ? (
                                        <button 
                                            onClick={() => handleStatusChange(emp, 'SUSPENDED')}
                                            className="p-2 text-on-surface-muted hover:text-warning hover:bg-warning/10 rounded-lg transition"
                                            title="Suspend User"
                                        >
                                            <ShieldOff className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleStatusChange(emp, 'ACTIVE')}
                                            className="p-2 text-on-surface-muted hover:text-secondary hover:bg-secondary/10 rounded-lg transition"
                                            title="Activate User"
                                        >
                                            <ShieldCheck className="h-4 w-4" />
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => handleDelete(emp.id)}
                                        className="p-2 text-on-surface-muted hover:text-danger hover:bg-danger/10 rounded-lg transition"
                                        title="Delete User"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {!emp.isSetupComplete && (
                            <div className="bg-warning/10 border border-warning/20 p-2 rounded-lg text-xs text-warning flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>Pending Setup: User must set password and 2FA on next login.</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-surface border border-border p-8 rounded-2xl w-full max-w-2xl overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
                            <h2 className="text-2xl font-bold text-on-surface">
                                {currentEmp.id ? 'Edit Team Member' : 'New Team Member'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-on-surface-muted hover:text-on-surface">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Full Name</label>
                                    <input required type="text" value={currentEmp.name || ''} onChange={(e) => setCurrentEmp({...currentEmp, name: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary" placeholder="Jane Doe" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Email Address</label>
                                    <input required type="email" value={currentEmp.email || ''} onChange={(e) => setCurrentEmp({...currentEmp, email: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary" placeholder="jane@company.com" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Phone (Optional)</label>
                                    <input type="tel" value={currentEmp.phone || ''} onChange={(e) => setCurrentEmp({...currentEmp, phone: e.target.value})} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary" placeholder="+1 (555) 000-0000" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-on-surface-muted uppercase">Role Assignment</label>
                                    <select 
                                        value={currentEmp.role} 
                                        onChange={(e) => setCurrentEmp({...currentEmp, role: e.target.value as UniversalRole})} 
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary"
                                    >
                                        {getAssignableRoles().map(role => (
                                            <option key={role} value={role}>{getRoleLabel(role)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {!currentEmp.id && (
                                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
                                    <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold text-primary uppercase">Security Note</h4>
                                        <p className="text-xs text-on-surface-muted mt-1">
                                            A temporary password (<strong>temp</strong>) will be assigned. 
                                            The user will be required to change it and set up 2FA upon first login.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 flex gap-4 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl border border-border font-bold text-on-surface hover:bg-surface-highlight transition">Cancel</button>
                                <button type="submit" className="flex-1 py-3.5 rounded-xl bg-primary text-black font-bold shadow-glow-primary hover:bg-primary-hover transition flex items-center justify-center gap-2">
                                    <Check className="h-5 w-5" /> Save Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
