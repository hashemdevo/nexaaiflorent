import React, { useState, useEffect } from 'react';
import { 
    Calendar, CheckCircle2, XCircle, Clock, User, Plus, Search, 
    ShieldCheck, ArrowRight, DollarSign, HelpCircle, Users, Briefcase, ChevronRight, Activity
} from 'lucide-react';
import { LeaveRequest } from '../../services/core/types';
import { Nexa } from '../../services/api';
import { useApp } from '../../contexts/AppContext';

// Types for Hierarchical User Positions
interface HierarchyUser {
    id: string;
    name: string;
    email: string;
    role: string;
    managerRole: string | null;
    managerName: string | null;
}

export const LeaveManagement: React.FC = () => {
    const { currentUserIdentity, currentUniversalRole } = useApp();
    const [requests, setRequests] = useState<any[]>([]);
    const [employeesList, setEmployeesList] = useState<any[]>([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'danger' | 'info' | null; text: string }>({ type: null, text: '' });

    // Simulation states
    const [simulatedRole, setSimulatedRole] = useState<string>('');
    const [simulatedUser, setSimulatedUser] = useState<HierarchyUser>({
        id: 'u-cashier',
        name: 'رامي الكاشير',
        email: 'ramy@nexa.com',
        role: 'CASHIER',
        managerRole: 'ACCOUNTANT',
        managerName: 'فهد المحاسب'
    });

    const [newRequest, setNewRequest] = useState({
        type: 'VACATION' as 'VACATION' | 'SICK' | 'UNPAID',
        startDate: '',
        endDate: '',
        reason: '',
        requestedForName: '',
        requestedForEmail: ''
    });

    // Simulated directory representing the company organization hierarchy
    const HIERARCHY_DIRECTORY: HierarchyUser[] = [
        { id: 'u-owner', name: 'سلمان الأونر (Owner)', email: 'owner@nexa.com', role: 'OWNER', managerRole: null, managerName: null },
        { id: 'u-cfo', name: 'أحمد المدير المالي (CFO)', email: 'cfo@nexa.com', role: 'CHIEF_ACCOUNTANT', managerRole: 'OWNER', managerName: 'سلمان الأونر' },
        { id: 'u-acc', name: 'فهد المحاسب (Accountant)', email: 'accountant@nexa.com', role: 'ACCOUNTANT', managerRole: 'CHIEF_ACCOUNTANT', managerName: 'أحمد المدير المالي' },
        { id: 'u-cashier', name: 'رامي الكاشير (Cashier)', email: 'ramy@nexa.com', role: 'CASHIER', managerRole: 'ACCOUNTANT', managerName: 'فهد المحاسب' },
        { id: 'u-kitchen', name: 'خالد من طاقم المطبخ', email: 'khaled@nexa.com', role: 'KITCHEN_STAFF', managerRole: 'ACCOUNTANT', managerName: 'فهد المحاسب' }
    ];

    // Align simulation role with initially logged in role
    useEffect(() => {
        const initialRole = currentUniversalRole || 'OWNER';
        setSimulatedRole(initialRole);
        const match = HIERARCHY_DIRECTORY.find(u => u.role === initialRole) || HIERARCHY_DIRECTORY[0];
        setSimulatedUser(match);
    }, [currentUniversalRole]);

    // Handle simulation role change
    const handleSimulatedRoleChange = (role: string) => {
        setSimulatedRole(role);
        const match = HIERARCHY_DIRECTORY.find(u => u.role === role) || HIERARCHY_DIRECTORY[0];
        setSimulatedUser(match);
        setStatusMsg({
            type: 'info',
            text: `تم محاكاة تسجيل الدخول ببوزيشن: ${match.name} [الرتبة: ${match.role}]`
        });
    };

    // Load active employee profiles and leave requests from Firestore / mock database
    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load real leaves from db
            const dbLeaves = await Nexa.Core.Db.select<any>('leave_requests');
            
            if (dbLeaves && dbLeaves.length > 0) {
                setRequests(dbLeaves);
            } else {
                // Prepopulate with mock dataset if empty
                const initialMocks = [
                    {
                        id: 'leave-1',
                        tenantId: 'default',
                        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
                        employeeId: 'u-cashier',
                        employeeName: 'رامي الكاشير',
                        employeeEmail: 'ramy@nexa.com',
                        employeeRole: 'CASHIER',
                        type: 'VACATION',
                        startDate: '2026-06-01',
                        endDate: '2026-06-05',
                        days: 5,
                        status: 'PENDING',
                        reason: 'إجازة سنوية عائلية',
                        targetApproverRole: 'ACCOUNTANT',
                        payrollProcessed: false
                    },
                    {
                        id: 'leave-2',
                        tenantId: 'default',
                        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
                        employeeId: 'u-acc',
                        employeeName: 'فهد المحاسب',
                        employeeEmail: 'accountant@nexa.com',
                        employeeRole: 'ACCOUNTANT',
                        type: 'UNPAID',
                        startDate: '2026-05-10',
                        endDate: '2026-05-12',
                        days: 3,
                        status: 'PENDING',
                        reason: 'ظرف طارئ شخصي',
                        targetApproverRole: 'CHIEF_ACCOUNTANT',
                        payrollProcessed: false
                    },
                    {
                        id: 'leave-3',
                        tenantId: 'default',
                        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
                        employeeId: 'u-cfo',
                        employeeName: 'أحمد المدير المالي',
                        employeeEmail: 'cfo@nexa.com',
                        employeeRole: 'CHIEF_ACCOUNTANT',
                        type: 'SICK',
                        startDate: '2026-05-01',
                        endDate: '2026-05-03',
                        days: 2,
                        status: 'APPROVED',
                        reason: 'وعكة صحية طارئة',
                        targetApproverRole: 'OWNER',
                        approvedBy: 'سلمان الأونر',
                        approvedByEmail: 'owner@nexa.com',
                        payrollProcessed: true
                    }
                ];
                
                // Write standard seed data to Firestore so it behaves exactly the same
                for (const mock of initialMocks) {
                    await Nexa.Core.Db.insert<any>('leave_requests', {
                        ...mock,
                        updatedAt: '',
                        version: 1
                    });
                }
                setRequests(initialMocks);
            }

            // Fetch list of active employees
            const emps = await Nexa.HRM.Employees.getAll();
            setEmployeesList(emps || []);
        } catch (e) {
            console.error("Failed loading leaves:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Calculate requested offset days
    const calculateDays = (start: string, end: string): number => {
        if (!start || !end) return 0;
        const d1 = new Date(start);
        const d2 = new Date(end);
        const diff = d2.getTime() - d1.getTime();
        return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)) + 1);
    };

    // Submitting a new Leave request
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const days = calculateDays(newRequest.startDate, newRequest.endDate);
        if (days <= 0) {
            setStatusMsg({ type: 'danger', text: 'تاريخ الانتهاء يجب أن يكون مساوياً أو لاحقاً لتاريخ البدء.' });
            return;
        }

        // Determine who is the direct designated supervisor
        let targetApproverRole = 'OWNER';
        if (simulatedUser.role === 'CASHIER' || simulatedUser.role === 'KITCHEN_STAFF') {
            targetApproverRole = 'ACCOUNTANT'; // Goes to Accountant
        } else if (simulatedUser.role === 'ACCOUNTANT') {
            targetApproverRole = 'CHIEF_ACCOUNTANT'; // Goes to Financial Director
        } else if (simulatedUser.role === 'CHIEF_ACCOUNTANT') {
            targetApproverRole = 'OWNER'; // Goes to company Owner
        }

        const leavePayload: any = {
            id: `leave-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: '',
            version: 1,
            employeeId: simulatedUser.id,
            employeeName: simulatedUser.name,
            employeeEmail: simulatedUser.email,
            employeeRole: simulatedUser.role,
            type: newRequest.type,
            startDate: newRequest.startDate,
            endDate: newRequest.endDate,
            days: days,
            reason: newRequest.reason || 'إجازة روتينية',
            status: 'PENDING',
            targetApproverRole: targetApproverRole,
            payrollProcessed: false
        };

        try {
            await Nexa.Core.Db.insert<any>('leave_requests', leavePayload);
            setRequests(prev => [leavePayload, ...prev]);
            setIsCreateOpen(false);
            setNewRequest({
                type: 'VACATION',
                startDate: '',
                endDate: '',
                reason: '',
                requestedForEmail: '',
                requestedForName: ''
            });
            setStatusMsg({
                type: 'success',
                text: `تم إيداع طلب الإجازة بنجاح! وسيتوجه التماس المراجعة تلقائياً لمستوى الاعتماد الأعلى: (${targetApproverRole})`
            });
        } catch (error) {
            console.error("Failed submitting leave request:", error);
            setStatusMsg({ type: 'danger', text: 'عذراً، فشل تسجيل طلب الإجازة في قاعدة مصفوفات الفايرستور.' });
        }
    };

    // Approval gate
    const handleApprove = async (id: string, reqItem: any) => {
        try {
            // Check authorization according to user role hierarchy
            const isAuthorized = 
                simulatedUser.role === 'OWNER' || 
                simulatedUser.role === 'SYSTEM_ADMIN' ||
                (simulatedUser.role === 'CHIEF_ACCOUNTANT' && reqItem.targetApproverRole === 'CHIEF_ACCOUNTANT') ||
                (simulatedUser.role === 'ACCOUNTANT' && reqItem.targetApproverRole === 'ACCOUNTANT');

            if (!isAuthorized) {
                setStatusMsg({
                    type: 'danger',
                    text: `أنت غير مفوض لاعتماد هذا الطلب. الصلاحية مخصصة لرتبة (${reqItem.targetApproverRole}) فقط.`
                });
                return;
            }

            // Sync Update in Firestore
            await Nexa.Core.Db.update<any>('leave_requests', id, {
                status: 'APPROVED',
                approvedBy: simulatedUser.name,
                approvedByEmail: simulatedUser.email,
                updatedAt: new Date().toISOString()
            });

            // Update UI reflect
            setRequests(prev => prev.map(r => r.id === id ? { 
                ...r, 
                status: 'APPROVED', 
                approvedBy: simulatedUser.name, 
                approvedByEmail: simulatedUser.email 
            } : r));

            setStatusMsg({
                type: 'success',
                text: `تم اعتماد إجازة الموظف (${reqItem.employeeName}) بنجاح. ستنعكس آلياً على حسابات مسير الرواتب القادم.`
            });
        } catch (err) {
            console.error("Error approving leave:", err);
            setStatusMsg({ type: 'danger', text: 'فشلت عملية الاعتماد الجغرافي والوظيفي.' });
        }
    };

    // Rejection gate
    const handleReject = async (id: string, reqItem: any) => {
        try {
            const isAuthorized = 
                simulatedUser.role === 'OWNER' || 
                simulatedUser.role === 'SYSTEM_ADMIN' ||
                (simulatedUser.role === 'CHIEF_ACCOUNTANT' && reqItem.targetApproverRole === 'CHIEF_ACCOUNTANT') ||
                (simulatedUser.role === 'ACCOUNTANT' && reqItem.targetApproverRole === 'ACCOUNTANT');

            if (!isAuthorized) {
                setStatusMsg({
                    type: 'danger',
                    text: `أنت غير مفوض لرفض هذا الطلب. غير مسموح لهذه الهوية.`
                });
                return;
            }

            await Nexa.Core.Db.update<any>('leave_requests', id, {
                status: 'REJECTED',
                approvedBy: simulatedUser.name,
                approvedByEmail: simulatedUser.email,
                updatedAt: new Date().toISOString()
            });

            setRequests(prev => prev.map(r => r.id === id ? { 
                ...r, 
                status: 'REJECTED', 
                approvedBy: simulatedUser.name, 
                approvedByEmail: simulatedUser.email 
            } : r));

            setStatusMsg({
                type: 'info',
                text: `تم رفض التماس الإجازة الخاص بـ (${reqItem.employeeName}) بنجاح.`
            });
        } catch (err) {
            console.error(err);
        }
    };

    // Filter rules
    // 1. My own requests
    const myRequests = requests.filter(r => r.employeeEmail === simulatedUser.email);

    // 2. Pending Requests targeted to my management role, or ALL if I am Owner/Admin
    const pendingReviewRequests = requests.filter(r => {
        if (r.status !== 'PENDING') return false;
        if (simulatedUser.role === 'OWNER' || simulatedUser.role === 'SYSTEM_ADMIN') {
            return true; // Absolute admin sees all pending requests
        }
        return r.targetApproverRole === simulatedUser.role;
    });

    // 3. Completed history requests under my authorization circle
    const historyReviewRequests = requests.filter(r => {
        if (r.status === 'PENDING') return false;
        if (simulatedUser.role === 'OWNER' || simulatedUser.role === 'SYSTEM_ADMIN') return true;
        return r.targetApproverRole === simulatedUser.role;
    });

    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-[1600px] mx-auto text-right" dir="rtl">
            
            {/* Header section with Arabized branding */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-surface p-6 rounded-2xl border border-border/80 shadow-md">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-7 w-7 text-purple-500" />
                        <h1 className="text-2xl font-bold text-on-surface">إدارة الإجازات الهيكلية (Leave Management)</h1>
                    </div>
                    <p className="text-xs text-on-surface-muted">
                        تنظيم اعتمادات الإجازات والغياب بشكل تسلسلي ذكي يربط الموظفين بمدراءهم المباشرين ويؤثر تلقائياً بالخصم من مسيرات الرواتب.
                    </p>
                </div>
                
                <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 self-start md:self-center"
                >
                    <Plus className="h-4 w-4" />
                    <span>طلب إجازة جديدة (Request Leave)</span>
                </button>
            </div>

            {/* Simulated Identity Switcher for QA testing & evaluation */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/20 text-primary border border-primary/30">
                            <Activity className="h-3 w-3" />
                            لوحة محاكاة الهياكل الإدارية (QA Simulation Station)
                        </span>
                        <p className="text-xs text-zinc-400">
                            استخدم هذه اللوحة للتنقل الفوري بين الهويات لاختبار مسار تنقل طلب الإجازة وقيود الاعتماد التنازلية:
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {HIERARCHY_DIRECTORY.map((user) => (
                            <button
                                key={user.id}
                                onClick={() => handleSimulatedRoleChange(user.role)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                                    simulatedUser.role === user.role
                                        ? 'bg-purple-600/30 text-purple-300 border-purple-500'
                                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                                }`}
                            >
                                <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                                {user.name.split(' ')[0]} ({user.role})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-800/80 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-400">
                    <div>
                        <span className="text-zinc-500">الهوية النشطة حالياً: </span>
                        <span className="text-white font-bold">{simulatedUser.name}</span>
                    </div>
                    <div>
                        <span className="text-zinc-500">منصب الرتبة: </span>
                        <span className="text-purple-400 font-mono font-bold uppercase">{simulatedUser.role}</span>
                    </div>
                    <div>
                        <span className="text-zinc-500">جهة الاعتماد المباشرة: </span>
                        <span className="text-amber-400 font-bold">
                            {simulatedUser.managerName ? `${simulatedUser.managerName} (${simulatedUser.managerRole})` : 'صلاحية عليا (مستقل)'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Status alerts */}
            {statusMsg.text && (
                <div className={`p-4 rounded-xl border text-xs text-right font-bold flex gap-2 items-center ${
                    statusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    statusMsg.type === 'danger' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                    <span>💡</span>
                    <span>{statusMsg.text}</span>
                </div>
            )}

            {/* Primary Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Right hand: Pending actions for logged in managers (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    
                    {/* Inbox of approvals */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-md">
                        <div className="flex justify-between items-center mb-4 border-b border-border/60 pb-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                                <span>صندوق طلبات الاعتماد الواردة إليك ({pendingReviewRequests.length})</span>
                            </h3>
                            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-mono font-bold">
                                {simulatedUser.role} INBOX
                            </span>
                        </div>

                        {pendingReviewRequests.length === 0 ? (
                            <div className="p-12 text-center text-on-surface-muted text-xs opacity-60 bg-zinc-950/20 rounded-xl border border-dashed border-border/50">
                                لا توجد أي طلبات إجازة معلقة بانتظار موافقتك حالياً لـ {simulatedUser.name}.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pendingReviewRequests.map((req) => (
                                    <div key={req.id} className="bg-zinc-950/60 hover:bg-zinc-950 transition border border-border p-4 rounded-xl space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-9 w-9 bg-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-bold text-sm">
                                                    {req.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-white">{req.employeeName}</h4>
                                                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{req.employeeEmail} • {req.employeeRole}</p>
                                                </div>
                                            </div>

                                            <div className="text-left">
                                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                                    إجازة معلقة بانتظار {req.targetApproverRole}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-zinc-950 rounded-lg text-xs space-y-2 border border-zinc-900">
                                            <div className="flex justify-between text-zinc-300">
                                                <span>نوع الطلب المطلوب:</span>
                                                <span className="font-bold text-purple-400">
                                                    {req.type === 'VACATION' ? 'إجازة سنوية مدفوعة' :
                                                     req.type === 'SICK' ? 'إجازة مرضية معتمدة' : 'إجازة بدون راتب (Unpaid Leave)'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-zinc-300">
                                                <span>الفترة الزمنية:</span>
                                                <span className="font-mono text-zinc-200">{req.startDate} إلى {req.endDate} (المدة: {req.days} أيام)</span>
                                            </div>
                                            <div className="flex justify-between text-zinc-300">
                                                <span>السبب التبريري:</span>
                                                <span className="italic text-zinc-400">"{req.reason}"</span>
                                            </div>
                                        </div>

                                        {/* Impact warn indicator on payroll integration */}
                                        <div className="p-2.5 bg-purple-500/5 text-purple-300 rounded-lg text-[10px] font-bold border border-purple-500/10 flex items-center gap-1.5">
                                            <DollarSign className="h-3.5 w-3.5 text-primary" />
                                            <span>
                                                {req.type === 'UNPAID' 
                                                    ? 'تنويه السيرفر: هذه الإجازة غير مدفوعة وسيتم خصمها من مسير الراتب بالكامل آلياً بعد الدورة القادمة.'
                                                    : 'تنويه السيرفر: الإجازة مدفوعة بالكامل ولن تؤثر على مستحقات الموظف الأساسية.'}
                                            </span>
                                        </div>

                                        {/* Manager approval controller */}
                                        <div className="flex gap-2.5 pt-1">
                                            <button 
                                                onClick={() => handleApprove(req.id, req)}
                                                className="flex-1 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border border-emerald-500/20 active:scale-95"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span>اعتماد الإجازة وربطها بالرواتب</span>
                                            </button>
                                            <button 
                                                onClick={() => handleReject(req.id, req)}
                                                className="flex-1 py-2 bg-danger/15 text-danger border border-danger/20 hover:bg-danger/25 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                <span>رفض الطلب</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Archived history reviews */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-md">
                        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2 pb-2 border-b border-border/60">
                            <Activity className="h-4 w-4 text-purple-400" />
                            <span>سجل قرارات إجازات موظفي الإدارات الصادرة تحت يدك ({historyReviewRequests.length})</span>
                        </h3>

                        {historyReviewRequests.length === 0 ? (
                            <div className="p-6 text-center text-on-surface-muted text-xs opacity-50">
                                لا توجد قرارات مدونة في تتبع الأرشيف الفوري حالياً.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                                {historyReviewRequests.map((req) => (
                                    <div key={req.id} className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-800 text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-white">{req.employeeName}</span>
                                                <span className="text-[10px] text-zinc-400">({req.employeeRole})</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500">الفترة: {req.startDate} ~ {req.endDate} ({req.days} أيام • {req.type})</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'
                                            }`}>
                                                {req.status === 'APPROVED' ? 'مقبولة ومعتمدة' : 'مرفوضة'}
                                            </span>
                                            <span className="text-[10px] text-zinc-500">
                                                الموقع: {req.approvedBy || req.approvedByEmail || 'السيستم الآلي'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Left hand: My Personal leave requests list & balances (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Leave requests created by current identity */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-md">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/60">
                            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                                <User className="h-4.5 w-4.5 text-primary" />
                                <span>طلبات إجازاتي الشخصية ({myRequests.length})</span>
                            </h3>
                            <button 
                                onClick={() => setIsCreateOpen(true)}
                                className="text-xs text-purple-400 hover:text-purple-300 font-extrabold"
                            >
                                + طلب جديد
                            </button>
                        </div>

                        {myRequests.length === 0 ? (
                            <div className="p-8 text-center text-on-surface-muted text-xs opacity-60">
                                لم تقم بتقديم أي التماسات إجازة لحسابك بعد.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myRequests.map((req) => (
                                    <div key={req.id} className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-850 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-white">{req.type}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                req.status === 'PENDING' ? 'bg-amber-500/15 text-amber-400' :
                                                req.status === 'APPROVED' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                                            }`}>
                                                {req.status === 'PENDING' ? 'معلقة ومسارها للأعلى' :
                                                 req.status === 'APPROVED' ? 'معتمدة بالكامل' : 'مرفوضة'}
                                            </span>
                                        </div>

                                        <p className="text-[10px] text-zinc-400 font-mono">{req.startDate} إلـى {req.endDate} ({req.days} أيام)</p>
                                        <p className="text-[10px] text-zinc-500 italic">"{req.reason}"</p>
                                        
                                        <div className="pt-2 border-t border-zinc-900 flex justify-between text-[9px] text-zinc-500">
                                            <span>المدير المستهدف مراجعته للطلب:</span>
                                            <span className="text-amber-500 font-bold bg-amber-500/5 px-1 py-0.5 rounded">{req.targetApproverRole}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Balances card */}
                    <div className="bg-surface border border-border rounded-2xl p-6 shadow-md space-y-4">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">رصيد إجازاتي المدفوعة (Vacation Balance)</h4>
                        
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="p-3 bg-zinc-950/60 rounded-xl border border-border/80">
                                <span className="block text-[10px] text-zinc-400">الإجازات السنوية المتبقية</span>
                                <span className="text-xl font-mono font-bold text-white">25 يوم</span>
                            </div>
                            <div className="p-3 bg-zinc-950/60 rounded-xl border border-border/80">
                                <span className="block text-[10px] text-zinc-400">الإجازات المرضية المتاحة</span>
                                <span className="text-xl font-mono font-bold text-emerald-400">12 يوم</span>
                            </div>
                        </div>

                        <div className="p-3 bg-zinc-950/40 rounded-xl border border-zinc-850 space-y-2 text-xs text-zinc-400">
                            <div className="flex items-center gap-1 text-zinc-300 font-bold">
                                <Users className="h-3.5 w-3.5 text-purple-400" />
                                <span>مسار تدرج طلبك الحالي:</span>
                            </div>
                            <div className="space-y-1.5 pt-1 text-[11px]">
                                <div className="flex gap-2 items-center">
                                    <span className="bg-primary/20 text-white rounded-full px-1.5 py-0.2">1</span>
                                    <span>الموظف النشط: <strong className="text-white">{simulatedUser.name}</strong></span>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <ArrowRight className="h-3 w-3 text-purple-500 mr-2" />
                                    <span>الجهة المباشرة للمراجعة: <strong className="text-amber-400">{simulatedUser.managerName || 'مالك المؤسسة فورا'}</strong></span>
                                </div>
                                {simulatedUser.managerRole === 'ACCOUNTANT' && (
                                    <div className="flex gap-2 items-center text-[10px] text-zinc-500">
                                        <ArrowRight className="h-3 w-3 text-zinc-600 mr-4" />
                                        <span>ثم إلى المدير المالي (CHIEF_ACCOUNTANT) للاعتماد النهائي</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Request creation dialog with Arabized UI */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in text-right" dir="rtl">
                    <div className="bg-surface border border-border p-8 rounded-3xl shadow-2xl w-full max-w-lg">
                        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-purple-500" />
                            <span>تقديم التماس إجازة هيكلي جديد</span>
                        </h2>
                        <p className="text-xs text-zinc-400 mb-6">
                            يرجى إدخال التواريخ بدقة. سيتم توجيه طلبك تلقائياً لبوزيشن الإدارة الأعلى بالمسلسل الإداري للشركة لتجنب الازدواجية المالية.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            
                            {/* Auto Info Box */}
                            <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl text-xs space-y-1 text-zinc-400">
                                <div className="flex justify-between">
                                    <span>اسم الموظف مقدم الطلب:</span>
                                    <strong className="text-white">{simulatedUser.name}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span>رتبة البوزيشن الخاص بك:</span>
                                    <strong className="text-purple-400 font-mono">{simulatedUser.role}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span>المدير المستهدف بالطلب مباشرة:</span>
                                    <strong className="text-amber-400">
                                        {simulatedUser.role === 'CASHIER' || simulatedUser.role === 'KITCHEN_STAFF' ? 'المحاسب فهد' :
                                         simulatedUser.role === 'ACCOUNTANT' ? ' المدير المالي أحمد' : 'الأونر سلمان'}
                                    </strong>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase mb-1.5 block">نوع الإجازة المطلوبة</label>
                                <select 
                                    value={newRequest.type}
                                    onChange={e => setNewRequest({...newRequest, type: e.target.value as any})}
                                    className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                                >
                                    <option value="VACATION">إجازة سنوية مدفوعة بالكامل (Paid Vacation)</option>
                                    <option value="SICK">إجازة مرضية معتمدة (Sick Leave)</option>
                                    <option value="UNPAID">إجازة بدون مرتب - خصم مباشر من الراتب (Unpaid Leave)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase mb-1.5 block">تاريخ البدء</label>
                                    <input 
                                        type="date"
                                        value={newRequest.startDate}
                                        onChange={e => setNewRequest({...newRequest, startDate: e.target.value})}
                                        className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-zinc-400 uppercase mb-1.5 block">تاريخ الانتهاء</label>
                                    <input 
                                        type="date"
                                        value={newRequest.endDate}
                                        onChange={e => setNewRequest({...newRequest, endDate: e.target.value})}
                                        className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                                        required
                                    />
                                </div>
                            </div>

                            {newRequest.startDate && newRequest.endDate && (
                                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-900 flex justify-between text-xs items-center">
                                    <span className="text-zinc-400">إجمالي مدة الإجازة المحسوبة:</span>
                                    <strong className="text-primary font-mono text-sm">{calculateDays(newRequest.startDate, newRequest.endDate)} أيام عمل فندقي</strong>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-bold text-zinc-400 uppercase mb-1.5 block">التبرير والتفاصيل</label>
                                <textarea 
                                    value={newRequest.reason}
                                    onChange={e => setNewRequest({...newRequest, reason: e.target.value})}
                                    className="w-full bg-background border border-border/80 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 resize-none h-20 text-right"
                                    placeholder="اكتب هنا سبباً مختصراً لاعتماد مديرك الفوري..."
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border font-bold text-white hover:bg-zinc-800 transition">إلغاء الأمر</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition shadow-lg">إرسال لمدير الاعتماد الأعلی</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
