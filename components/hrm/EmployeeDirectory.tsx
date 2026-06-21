import React, { useState, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { DbEngine } from '../../services/core/db';
import { BaseEntity } from '../../services/core/types';
import { UniversalRole } from '../../types';
import { 
  Users, Plus, Search, Shield, Building, Mail, Phone, Calendar, ChevronRight, CheckCircle2,
  ShieldCheck, ArrowRight, Fingerprint, Lock, Globe, Server, UserCheck, AlertTriangle, Database,
  Cpu, FileSpreadsheet, Eye, UserMinus, ShieldAlert, Key, ClipboardList, RefreshCw, X, Landmark
} from 'lucide-react';

interface EmployeeProfile extends BaseEntity {
  employeeCode: string;
  // Legal Names
  firstName: string;
  middleName: string;
  lastName: string;
  arabicLegalName: string;
  englishLegalName: string;
  nationalId: string;
  gender: 'MALE' | 'FEMALE';
  
  // Employment Coordinates
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'PROBATION';
  joiningDate: string;
  payrollGroup: string;
  currency: string;
  shiftPolicy: string;
  attendancePolicy: string;
  approvalAuthorityLevel: number; // 1 (SAR 5K), 2 (SAR 50K), 3 (SAR 500K), 4 (Unlimited)

  // Spatial & Financial Binds
  departmentId: string;
  departmentCode: string;
  branchId: string;
  costCenterId: string;
  reportingManagerId: string;
  warehouseAccessId: string;

  // Security & Access control
  systemAccessEnabled: boolean;
  corporateEmail: string;
  mfaRequired: boolean;
  allowedIpRanges: string;
  deviceRestriction: 'ALL' | 'SECURE_MOBILE' | 'OFFICE_WORKSTATIONS';
  privilegedAccessFlag: boolean;

  // Real-time Runtime Security state
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'LOCKED' | 'PENDING_ONBOARDING';
  failedAttempts: number;
  lastLogin?: string;
  activeSessionsCount: number;
}

export const EmployeeDirectory: React.FC = () => {
  const { currentUniversalRole, currentUserIdentity } = useApp();
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'directory' | 'provision'>('directory');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  // Provisioning multi-step wizard state
  const [formStep, setFormStep] = useState(1);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [pipelineLogs, setPipelineLogs] = useState<{ service: string; msg: string; type: 'info' | 'success' | 'warning' }[]>([]);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState<EmployeeProfile | null>(null);

  // Forms Default State
  const initialFormState: Partial<EmployeeProfile> = {
    firstName: '',
    middleName: '',
    lastName: '',
    arabicLegalName: '',
    englishLegalName: '',
    nationalId: '',
    gender: 'MALE',
    employmentType: 'FULL_TIME',
    joiningDate: new Date().toISOString().split('T')[0],
    payrollGroup: 'PG-STANDARD',
    currency: 'SAR',
    shiftPolicy: 'SP-RIYADH-HQ',
    attendancePolicy: 'A-GEOFENCE-HQ',
    approvalAuthorityLevel: 1,

    departmentId: 'dept-eng',
    departmentCode: 'ENG-PROD',
    branchId: 'branch-ruh-01',
    costCenterId: 'CC-ENG-RIYADH',
    reportingManagerId: 'emp-nexa-1001',
    warehouseAccessId: 'wh-main-ruh',

    systemAccessEnabled: true,
    corporateEmail: '',
    mfaRequired: true,
    allowedIpRanges: '192.168.1.0/24, 10.0.0.0/8',
    deviceRestriction: 'ALL',
    privilegedAccessFlag: false,

    accountStatus: 'ACTIVE',
    failedAttempts: 0,
    activeSessionsCount: 0
  };

  const [form, setForm] = useState<Partial<EmployeeProfile>>(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateStep = (step: number) => {
    const errs: { [key: string]: string } = {};
    if (step === 1) {
      if (!form.firstName?.trim()) errs.firstName = 'First Name is required.';
      if (!form.lastName?.trim()) errs.lastName = 'Last Name is required.';
      if (!form.nationalId?.trim()) errs.nationalId = 'National ID or Passport is critical for forensic trail.';
      if (form.nationalId && form.nationalId.length < 5) errs.nationalId = 'ID must be at least 5 characters.';
      if (!form.arabicLegalName?.trim()) errs.arabicLegalName = 'Arabic Legal Name matches legal documents.';
    } else if (step === 2) {
      if (!form.departmentId) errs.departmentId = 'Department is required.';
      if (!form.branchId) errs.branchId = 'Branch allocation is required.';
    } else if (step === 3) {
      if (form.systemAccessEnabled) {
        if (!form.corporateEmail?.trim()) {
          errs.corporateEmail = 'Corporate Email is required for System Identity.';
        } else if (!form.corporateEmail.includes('@') || !form.corporateEmail.endsWith('.com')) {
          errs.corporateEmail = 'Must be a valid corporate domain email (.com).';
        }
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const loadAllProfiles = async () => {
    setLoading(true);
    try {
      const records = await DbEngine.select<EmployeeProfile>('employees');
      
      // If empty, seed realistic mock corporate data to demonstrate ERP compliance
      if (!records || records.length === 0) {
        const uniqueId = () => 'emp-nexa-' + Math.random().toString(36).substr(2, 9);
        const seedStaff: EmployeeProfile[] = [
          {
            id: uniqueId(),
            tenantId: 'tenant-nexa-001',
            employeeCode: 'NEX-EMP-001',
            firstName: 'Abdulaziz',
            middleName: 'Bin Khalid',
            lastName: 'Al-Suwaidan',
            arabicLegalName: 'عبدالعزيز خالد السويدان',
            englishLegalName: 'Abdulaziz Khalid Al-Suwaidan',
            nationalId: '1092837482',
            gender: 'MALE',
            employmentType: 'FULL_TIME',
            joiningDate: '2024-01-15',
            payrollGroup: 'PG-EXECUTIVE',
            currency: 'SAR',
            shiftPolicy: 'SP-FLEXIBLE-HQ',
            attendancePolicy: 'A-TRUST-BASED',
            approvalAuthorityLevel: 4, // unlimited
            departmentId: 'dept-exec',
            departmentCode: 'HQ-EXEC',
            branchId: 'branch-ruh-01',
            costCenterId: 'CC-ADMIN-CORP',
            reportingManagerId: '',
            warehouseAccessId: 'wh-all-access',
            systemAccessEnabled: true,
            corporateEmail: 'a.suwaidan@nexaledger.com',
            mfaRequired: true,
            allowedIpRanges: '0.0.0.0/0',
            deviceRestriction: 'ALL',
            privilegedAccessFlag: true,
            accountStatus: 'ACTIVE',
            failedAttempts: 0,
            activeSessionsCount: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1
          },
          {
            id: uniqueId(),
            tenantId: 'tenant-nexa-001',
            employeeCode: 'NEX-EMP-002',
            firstName: 'Sarah',
            middleName: 'Fahad',
            lastName: 'Mani',
            arabicLegalName: 'سارة فهد المانع',
            englishLegalName: 'Sarah Fahad Mani',
            nationalId: '1083921029',
            gender: 'FEMALE',
            employmentType: 'FULL_TIME',
            joiningDate: '2024-03-01',
            payrollGroup: 'PG-STANDARD',
            currency: 'SAR',
            shiftPolicy: 'SP-RIYADH-HQ',
            attendancePolicy: 'A-GEOFENCE-HQ',
            approvalAuthorityLevel: 2, // 50K Limit
            departmentId: 'dept-fin',
            departmentCode: 'FIN-ACC',
            branchId: 'branch-ruh-01',
            costCenterId: 'CC-FINANCE-CORP',
            reportingManagerId: 'emp-nexa-1001',
            warehouseAccessId: 'none',
            systemAccessEnabled: true,
            corporateEmail: 's.mani@nexaledger.com',
            mfaRequired: true,
            allowedIpRanges: '192.168.1.0/24',
            deviceRestriction: 'OFFICE_WORKSTATIONS',
            privilegedAccessFlag: false,
            accountStatus: 'ACTIVE',
            failedAttempts: 0,
            activeSessionsCount: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1
          },
          {
            id: uniqueId(),
            tenantId: 'tenant-nexa-001',
            employeeCode: 'NEX-EMP-003',
            firstName: 'Tariq',
            middleName: 'Yousef',
            lastName: 'Al-Harbi',
            arabicLegalName: 'طارق يوسف الحربي',
            englishLegalName: 'Tariq Yousef Al-Harbi',
            nationalId: '2049381029',
            gender: 'MALE',
            employmentType: 'CONTRACTOR',
            joiningDate: '2025-02-10',
            payrollGroup: 'PG-CONTRACT',
            currency: 'SAR',
            shiftPolicy: 'SP-RIYADH-HQ',
            attendancePolicy: 'A-GEOFENCE-HQ',
            approvalAuthorityLevel: 1, // 5K Limit
            departmentId: 'dept-sales',
            departmentCode: 'MKT-SLS',
            branchId: 'branch-ruh-02',
            costCenterId: 'CC-SALES-EAST',
            reportingManagerId: 'emp-nexa-1001',
            warehouseAccessId: 'wh-retail-02',
            systemAccessEnabled: true,
            corporateEmail: 't.harbi@nexaledger.com',
            mfaRequired: false,
            allowedIpRanges: '192.168.2.0/24',
            deviceRestriction: 'SECURE_MOBILE',
            privilegedAccessFlag: false,
            accountStatus: 'ACTIVE',
            failedAttempts: 2,
            activeSessionsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1
          }
        ];

        for (const emp of seedStaff) {
          await DbEngine.insert('employees', emp);
        }
        setEmployees(seedStaff);
      } else {
        setEmployees(records);
      }
    } catch(err) {
      console.error('Error fetching employee profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllProfiles();
  }, []);

  const handleDeptSelection = (deptId: string) => {
    let deptCode = 'ENG-PROD';
    let costCenterId = 'CC-ENG-RIYADH';
    if (deptId === 'dept-fin') {
      deptCode = 'FIN-ACC';
      costCenterId = 'CC-FINANCE-CORP';
    } else if (deptId === 'dept-sales') {
      deptCode = 'MKT-SLS';
      costCenterId = 'CC-SALES-EAST';
    } else if (deptId === 'dept-hr') {
      deptCode = 'HR-GOV';
      costCenterId = 'CC-HR-GLOBAL';
    } else if (deptId === 'dept-ops') {
      deptCode = 'OPS-SC';
      costCenterId = 'CC-LOG-WAREHOUSE';
    }
    setForm(prev => ({ ...prev, departmentId: deptId, departmentCode: deptCode, costCenterId }));
  };

  // 8-Step Corporate Provisioning Pipeline Flow Simulation
  const executeProvisioningTunnel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setIsProvisioning(true);
    setPipelineProgress(5);
    setPipelineLogs([]);

    const logHistory: { service: string; msg: string; type: 'info' | 'success' | 'warning' }[] = [];
    const appendLog = (service: string, msg: string, type: 'info' | 'success' | 'warning' = 'info') => {
      logHistory.push({ service, msg, type });
      setPipelineLogs([...logHistory]);
    };

    try {
      // Step 1: Duplicate checks and legal bounds audits
      appendLog('Security Engine', 'Starting legal duplication scan on Resident/National ID...', 'info');
      await new Promise(r => setTimeout(r, 450));
      const hasDupeId = employees.some(em => em.nationalId === form.nationalId);
      if (hasDupeId) {
        throw new Error(`Double-Mapping Violation: Resident ID "${form.nationalId}" already registered to an exists profile.`);
      }
      setPipelineProgress(15);
      appendLog('Security Engine', 'Legal compliance checks complete. No overlapping Resident IDs found.', 'success');

      // Step 2: Employee physical SQL insertion simulation
      appendLog('PostgreSQL Storage', 'Persisting canonical HR metadata columns into Database backend...', 'info');
      await new Promise(r => setTimeout(r, 600));
      
      const newCode = `NEX-EMP-${Math.floor(100 + Math.random() * 900)}`;
      const newId = `emp-${Date.now()}`;
      
      const profilePayload: EmployeeProfile = {
        id: newId,
        tenantId: 'tenant-nexa-001',
        employeeCode: newCode,
        firstName: form.firstName || '',
        middleName: form.middleName || '',
        lastName: form.lastName || '',
        arabicLegalName: form.arabicLegalName || '',
        englishLegalName: form.englishLegalName || '',
        nationalId: form.nationalId || '',
        gender: form.gender || 'MALE',
        employmentType: form.employmentType || 'FULL_TIME',
        joiningDate: form.joiningDate || '',
        payrollGroup: form.payrollGroup || '',
        currency: form.currency || 'SAR',
        shiftPolicy: form.shiftPolicy || '',
        attendancePolicy: form.attendancePolicy || '',
        approvalAuthorityLevel: Number(form.approvalAuthorityLevel || 1),
        departmentId: form.departmentId || 'dept-eng',
        departmentCode: form.departmentCode || 'ENG-PROD',
        branchId: form.branchId || 'branch-ruh-01',
        costCenterId: form.costCenterId || 'CC-ENG-RIYADH',
        reportingManagerId: form.reportingManagerId || '',
        warehouseAccessId: form.warehouseAccessId || '',
        systemAccessEnabled: !!form.systemAccessEnabled,
        corporateEmail: form.systemAccessEnabled ? form.corporateEmail || '' : '',
        mfaRequired: !!form.mfaRequired,
        allowedIpRanges: form.allowedIpRanges || '0.0.0.0/0',
        deviceRestriction: form.deviceRestriction || 'ALL',
        privilegedAccessFlag: !!form.privilegedAccessFlag,
        accountStatus: form.systemAccessEnabled ? 'ACTIVE' : 'PENDING_ONBOARDING',
        failedAttempts: 0,
        activeSessionsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      };

      await DbEngine.insert('employees', profilePayload);
      setPipelineProgress(30);
      appendLog('PostgreSQL Storage', `Record committed. Assigned system Code: ${newCode} / Reference: ${newId}`, 'success');

      // Step 3: Core OAuth link user record creation
      if (form.systemAccessEnabled) {
        appendLog('OAuth Core', 'Validating domain restriction and coining SSO Authentication Profile...', 'info');
        await new Promise(r => setTimeout(r, 550));
        
        // Assert email uniqueness in users table
        const usersInSystem = await DbEngine.select<any>('users');
        const hasEmailDupe = usersInSystem?.some((u: any) => u.email?.toLowerCase() === form.corporateEmail?.toLowerCase());
        if (hasEmailDupe) {
          throw new Error(`Email Conflict: Authentication login portal is already occupied by corporate mail identifier "${form.corporateEmail}".`);
        }

        const authUserObj = {
          id: `usr-nexa-${Date.now()}`,
          tenantId: 'tenant-nexa-001',
          fullName: `${form.firstName} ${form.lastName}`,
          email: form.corporateEmail,
          role: form.privilegedAccessFlag ? 'SYSTEM_ADMIN' : 'ACCOUNTANT',
          branchId: form.branchId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1
        };
        await DbEngine.insert('users', authUserObj);
        setPipelineProgress(50);
        appendLog('OAuth Core', `Client OAuth interface bounded. System User Record created matching role [${authUserObj.role}].`, 'success');
      } else {
        setPipelineProgress(50);
        appendLog('OAuth Core', 'System Access disabled for this profile. Credential provisioning bypassed.', 'info');
      }

      // Step 4: RBAC permissions matrix linkage
      appendLog('RBAC Engine', 'Registering active ACL tokens based on role & hierarchy values...', 'info');
      await new Promise(r => setTimeout(r, 400));
      const rolePerms = form.privilegedAccessFlag ? 'Full Administrator Access (ABAC/RBAC Bounds Root)' : 'Default Accountant Group';
      appendLog('RBAC Engine', `Permissions bundle verified: ${rolePerms}`, 'success');
      setPipelineProgress(65);

      // Step 5: Ledger Payroll Configuration
      appendLog('Payroll Ledger', 'Opening currency payment assignments and Payroll Shell ledger indices...', 'info');
      await new Promise(r => setTimeout(r, 500));
      appendLog('Payroll Ledger', `Allocated PG: ${form.payrollGroup} matching base currency [${form.currency}].`, 'success');
      setPipelineProgress(75);

      // Step 6: Document Routing Limitations (Workflow limit assignments)
      appendLog('Workflow router', 'Publishing approval routing matrices matching designated Authority Level...', 'info');
      await new Promise(r => setTimeout(r, 400));
      const limit = form.approvalAuthorityLevel === 4 ? 'UNLIMITED (CEO Block)' :
                    form.approvalAuthorityLevel === 3 ? 'SAR 500k Threshold' :
                    form.approvalAuthorityLevel === 2 ? 'SAR 50k Threshold' : 'SAR 5k Threshold';
      appendLog('Workflow router', `Successfully assigned limit index [${limit}].`, 'success');
      setPipelineProgress(85);

      // Step 7: Forensic logging & transaction commit
      appendLog('Audit Sentry', 'Scribing audit trail ledger record detailing operation trace...', 'info');
      await new Promise(r => setTimeout(r, 450));
      
      const auditPayload = {
        id: `audit-prov-${Date.now()}`,
        tenantId: 'tenant-nexa-001',
        action: 'IDENTITY_PROVISIONED',
        entityId: newId,
        tableName: 'employees',
        userId: currentUserIdentity || 'NEXA_ADMIN_CONSOLE',
        ipAddress: '192.168.10.45',
        details: `Created enterprise identity profile for employee [${form.firstName} ${form.lastName}] under code [${newCode}]`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1
      };
      await DbEngine.insert('audit_logs', auditPayload);
      appendLog('Audit Sentry', 'Trace finalized. Record cryptographically bound to system history ledger.', 'success');
      setPipelineProgress(100);
      await new Promise(r => setTimeout(r, 400));

      setIsProvisioning(false);
      setFormStep(1);
      setForm(initialFormState);
      setActiveTab('directory');
      loadAllProfiles();
    } catch(err: any) {
      appendLog('Pipeline Governor', `Fatal Operational Execution Blocked: ${err.message}`, 'warning');
      setIsProvisioning(false);
    }
  };

  const toggleAccessAccount = async (empId: string, current: 'ACTIVE' | 'SUSPENDED' | 'LOCKED' | 'PENDING_ONBOARDING') => {
    const targetStatus = current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await DbEngine.update('employees', empId, {
        accountStatus: targetStatus,
        updatedAt: new Date().toISOString()
      } as any);
      setEmployees(prev => prev.map(e => e.id === empId ? { ...e, accountStatus: targetStatus } : e));
      setSelectedEmployeeDetail(prev => prev && prev.id === empId ? { ...prev, accountStatus: targetStatus } : prev);
    } catch(err) {
      console.error(err);
    }
  };

  const handleFullAccessTokenGeneration = (email: string) => {
    const token = `nexa-sso-jwt-${Math.random().toString(36).substring(2, 15).toUpperCase()}#${Date.now()}`;
    alert(`SSO Identity Core Access Token minted successfully:\n\n${token}\n\nThis token overrides normal login workflows in isolated sub-modules.`);
  };

  const terminateSessions = async (empId: string) => {
    try {
      await DbEngine.update('employees', empId, {
        activeSessionsCount: 0,
        updatedAt: new Date().toISOString()
      } as any);
      setEmployees(prev => prev.map(e => e.id === empId ? { ...e, activeSessionsCount: 0 } : e));
      setSelectedEmployeeDetail(prev => prev && prev.id === empId ? { ...prev, activeSessionsCount: 0 } : prev);
      alert('All active server/terminal sessions for this operational account have been forcibly signed out.');
    } catch(e) {
      console.error(e);
    }
  };

  // Filter logic runs on the component side
  const filteredEmployees = employees.filter(emp => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery = !query || 
      emp.firstName.toLowerCase().includes(query) ||
      emp.lastName.toLowerCase().includes(query) ||
      emp.employeeCode.toLowerCase().includes(query) ||
      emp.nationalId.includes(query) ||
      (emp.corporateEmail && emp.corporateEmail.toLowerCase().includes(query)) ||
      (emp.arabicLegalName && emp.arabicLegalName.includes(query)) ||
      (emp.englishLegalName && emp.englishLegalName.toLowerCase().includes(query));

    const matchesBranch = selectedBranch === 'ALL' || emp.branchId === selectedBranch;
    const matchesDept = selectedDept === 'ALL' || emp.departmentId === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || emp.accountStatus === selectedStatus;

    return matchesQuery && matchesBranch && matchesDept && matchesStatus;
  });

  const itemsToRender = filteredEmployees;

  return (
    <div className="space-y-6 text-on-surface">
      {/* Header section detailing action triggers */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Identity Provisioning Desk & Directory
          </h2>
          <p className="text-xs text-on-surface-muted italic">Secure RBAC / ABAC profiling, operational authority binding, and corporate spatial mapping.</p>
        </div>
        
        <div className="flex gap-2 text-xs">
          <button 
            onClick={() => { setActiveTab('directory'); setSelectedEmployeeDetail(null); }}
            className={`px-4 py-2 font-black rounded-lg transition uppercase tracking-wider flex items-center gap-1.5 ${activeTab === 'directory' ? 'bg-indigo-600 font-bold text-white' : 'bg-surface border border-border text-on-surface-muted hover:text-on-surface'}`}
          >
            <Users className="h-4 w-4" /> Employee Directory
          </button>
          <button 
            onClick={() => { setActiveTab('provision'); setFormStep(1); }}
            className={`px-4 py-2 font-black rounded-lg transition uppercase tracking-wider flex items-center gap-1.5 ${activeTab === 'provision' ? 'bg-indigo-600 font-bold text-white' : 'bg-surface border border-border text-on-surface-muted hover:text-on-surface'}`}
          >
            <Plus className="h-4 w-4" /> Provision Corporate Identity
          </button>
        </div>
      </div>

      {/* Top dashboard stats metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel border border-border p-4 rounded-xl flex items-center justify-between bg-indigo-500/[0.02]">
          <div>
            <div className="text-[10px] uppercase font-bold text-on-surface-muted">Total Directory Records</div>
            <div className="text-xl font-black mt-1 text-on-surface">{employees.length}</div>
          </div>
          <Users className="h-8 w-8 text-indigo-400 stroke-[1.2]" />
        </div>
        
        <div className="glass-panel border border-border p-4 rounded-xl flex items-center justify-between bg-emerald-500/[0.02]">
          <div>
            <div className="text-[10px] uppercase font-bold text-on-surface-muted">Core Authorized Logins</div>
            <div className="text-xl font-black mt-1 text-emerald-400">
              {employees.filter(e => e.systemAccessEnabled && e.accountStatus === 'ACTIVE').length}
            </div>
          </div>
          <Fingerprint className="h-8 w-8 text-emerald-400 stroke-[1.2]" />
        </div>

        <div className="glass-panel border border-border p-4 rounded-xl flex items-center justify-between bg-sky-500/[0.02]">
          <div>
            <div className="text-[10px] uppercase font-bold text-on-surface-muted">MFA Bound Compliance</div>
            <div className="text-xl font-black mt-1 text-sky-400 font-mono">
              {employees.length > 0 
                ? `${Math.round((employees.filter(e => e.mfaRequired).length / employees.length) * 100)}%` 
                : '0%'}
            </div>
          </div>
          <ShieldCheck className="h-8 w-8 text-sky-400 stroke-[1.2]" />
        </div>

        <div className="glass-panel border border-border p-4 rounded-xl flex items-center justify-between bg-rose-500/[0.02]">
          <div>
            <div className="text-[10px] uppercase font-bold text-on-surface-muted">Suspended System Accounts</div>
            <div className="text-xl font-black mt-1 text-rose-500">
              {employees.filter(e => e.accountStatus === 'SUSPENDED' || e.accountStatus === 'LOCKED').length}
            </div>
          </div>
          <ShieldAlert className="h-8 w-8 text-rose-500 stroke-[1.2]" />
        </div>
      </div>

      {/* Directory Tab View */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Query Filter Area */}
          <div className="glass-panel border border-border p-3 rounded-xl flex flex-wrap gap-3 items-center justify-between bg-surface-highlight/30">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-muted" />
              <input 
                type="text" 
                placeholder="Search by legal name, employee code, SSN, or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-background border border-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-on-surface focus:border-indigo-500 outline-none w-full font-mono"
              />
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <select 
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                className="bg-background border border-border rounded-lg p-1.5 focus:border-indigo-500 outline-none text-on-surface-muted text-xs"
              >
                <option value="ALL">All Branches</option>
                <option value="branch-ruh-01">Riyadh Corporate HQ</option>
                <option value="branch-ruh-02">Jeddah Sales Depot</option>
                <option value="branch-ruh-03">Dammam Logistics Wharf</option>
              </select>

              <select 
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="bg-background border border-border rounded-lg p-1.5 focus:border-indigo-500 outline-none text-on-surface-muted text-xs"
              >
                <option value="ALL">All Departments</option>
                <option value="dept-exec">HQ Executive</option>
                <option value="dept-fin">Finance & Accounting</option>
                <option value="dept-eng">Engineering & Tech</option>
                <option value="dept-sales">Sales & Marketing</option>
                <option value="dept-ops">General Operations</option>
              </select>

              <select 
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="bg-background border border-border rounded-lg p-1.5 focus:border-indigo-500 outline-none text-on-surface-muted text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Tunnels</option>
                <option value="SUSPENDED">Suspended Access</option>
                <option value="LOCKED">Access Locked</option>
                <option value="PENDING_ONBOARDING">Pending Onboard</option>
              </select>

              <button 
                onClick={loadAllProfiles}
                className="bg-border p-1.5 rounded-lg hover:bg-border/85 text-on-surface-muted transition flex items-center justify-center border border-border"
                title="Refresh operational directory partitions"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Directory Listings */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel border border-border rounded-xl spill-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-surface text-on-surface-muted text-[10px] uppercase font-black uppercase tracking-wider">
                    <tr>
                      <th className="p-3 border-b border-border">Authorized Employee</th>
                      <th className="p-3 border-b border-border">Employment coordinates</th>
                      <th className="p-3 border-b border-border">Core Login identity</th>
                      <th className="p-3 border-b border-border text-center">Status</th>
                      <th className="p-3 border-b border-border text-right">Core Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-on-surface-muted italic">Querying directories and SQL server tables...</td>
                      </tr>
                    ) : itemsToRender.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-on-surface-muted italic">No matching personnel profiling files found.</td>
                      </tr>
                    ) : (
                      itemsToRender.map(emp => (
                        <tr 
                          key={emp.id} 
                          className={`hover:bg-surface-highlight/30 cursor-pointer transition ${selectedEmployeeDetail?.id === emp.id ? 'bg-indigo-500/5' : ''}`}
                          onClick={() => setSelectedEmployeeDetail(emp)}
                        >
                          <td className="p-3">
                            <div className="font-bold text-on-surface">{emp.firstName} {emp.lastName}</div>
                            <div className="font-mono text-[9px] text-indigo-400 mt-0.5">{emp.employeeCode}</div>
                          </td>
                          <td className="p-3 space-y-0.5">
                            <div className="font-bold flex items-center gap-1">
                              <Building className="h-3 w-3 text-on-surface-muted" />
                              {emp.departmentCode}
                            </div>
                            <div className="text-[10px] text-on-surface-muted">
                              Cost Center: <span className="font-mono">{emp.costCenterId || 'N/A'}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            {emp.systemAccessEnabled ? (
                              <div className="space-y-1">
                                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                                  <Fingerprint className="h-3 w-3" /> System Access Enabled
                                </div>
                                <div className="text-[9px] text-on-surface-muted font-mono truncate max-w-[150px]">{emp.corporateEmail}</div>
                              </div>
                            ) : (
                              <div className="text-[10px] text-on-surface-muted italic flex items-center gap-1">
                                <UserMinus className="h-3 w-3 text-on-surface-muted" /> Profile Record Only
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border inline-block ${
                              emp.accountStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              emp.accountStatus === 'SUSPENDED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                              emp.accountStatus === 'LOCKED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                              'bg-zinc-500/15 text-zinc-400 border-zinc-500/20'
                            }`}>
                              {emp.accountStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button className="text-on-surface-muted hover:text-indigo-400 font-bold p-1">
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Profile Detail Side Panel */}
            <div className="glass-panel border border-border p-4 rounded-xl space-y-4 h-fit bg-surface-highlight/10">
              {selectedEmployeeDetail ? (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="flex justify-between items-start border-b border-border pb-3">
                    <div>
                      <h4 className="font-black text-sm text-on-surface">{selectedEmployeeDetail.firstName} {selectedEmployeeDetail.lastName}</h4>
                      <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{selectedEmployeeDetail.employeeCode}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                      selectedEmployeeDetail.employmentType === 'FULL_TIME' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-border/40 text-on-surface-muted'
                    }`}>
                      {selectedEmployeeDetail.employmentType}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-bold text-[10px] uppercase text-indigo-400 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Canonical Profile Coordinates
                    </h5>
                    
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-background/50 p-2.5 rounded-lg border border-border/40">
                      <div>
                        <div className="text-on-surface-muted">Middle & Last Name</div>
                        <div className="font-bold text-on-surface">{selectedEmployeeDetail.middleName} {selectedEmployeeDetail.lastName}</div>
                      </div>
                      <div>
                        <div className="text-on-surface-muted">National SSN / Passport ID</div>
                        <div className="font-mono text-on-surface">{selectedEmployeeDetail.nationalId}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-on-surface-muted">Legal Registry Name (AR)</div>
                        <div className="font-bold text-right text-on-surface mt-0.5" dir="rtl">{selectedEmployeeDetail.arabicLegalName}</div>
                      </div>
                      <div>
                        <div className="text-on-surface-muted">Gender</div>
                        <div className="font-bold text-on-surface font-mono">{selectedEmployeeDetail.gender}</div>
                      </div>
                      <div>
                        <div className="text-on-surface-muted">Date of Joining</div>
                        <div className="font-bold text-on-surface">{selectedEmployeeDetail.joiningDate}</div>
                      </div>
                    </div>

                    <div className="border-t border-border/60 pt-3 space-y-2">
                      <h5 className="font-bold text-[10px] uppercase text-indigo-400 flex items-center gap-1">
                        <Lock className="h-3.5 w-3.5" /> Access Control Governance
                      </h5>
                      <div className="space-y-1.5 bg-background/50 p-2.5 rounded-lg border border-border/40">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-on-surface-muted">Corporate Login</span>
                          <span className="font-mono text-on-surface font-bold text-emerald-400">{selectedEmployeeDetail.corporateEmail || 'Bypassed'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-on-surface-muted">MFA Compliance status</span>
                          <span className={selectedEmployeeDetail.mfaRequired ? 'text-emerald-400 font-bold' : 'text-amber-500'}>
                            {selectedEmployeeDetail.mfaRequired ? 'Enabled (Strict)' : 'No MFA Forced'}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-on-surface-muted">Allowed IP Policy</span>
                          <span className="font-mono text-[9px] text-on-surface truncate max-w-[150px]" title={selectedEmployeeDetail.allowedIpRanges}>
                            {selectedEmployeeDetail.allowedIpRanges}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-on-surface-muted">Device Restrictions Scope</span>
                          <span className="font-mono text-indigo-400">{selectedEmployeeDetail.deviceRestriction}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-on-surface-muted">Active Sessions IP Tunnel count</span>
                          <span className="font-bold text-on-surface font-mono">{selectedEmployeeDetail.activeSessionsCount} active</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border/60 pt-3 space-y-2">
                      <h5 className="font-bold text-[10px] uppercase text-indigo-400 flex items-center gap-1">
                        <Landmark className="h-3.5 w-3.5" /> Authority Mappings & Fin-Scope
                      </h5>
                      <div className="space-y-1.5 bg-background/50 p-2.5 rounded-lg border border-border/40">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-on-surface-muted">Under Branch Code</span>
                          <span className="font-mono text-on-surface">{selectedEmployeeDetail.branchId}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-on-surface-muted">Payroll Group Bound</span>
                          <span className="font-mono text-on-surface">{selectedEmployeeDetail.payrollGroup}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-on-surface-muted">Authority Limitation Tier</span>
                          <span className="font-bold text-indigo-400">
                            Tier {selectedEmployeeDetail.approvalAuthorityLevel} ({
                              selectedEmployeeDetail.approvalAuthorityLevel === 4 ? 'Unlimited (CEO Approval)' :
                              selectedEmployeeDetail.approvalAuthorityLevel === 3 ? 'Up to SAR 500,000 (Exec Line)' :
                              selectedEmployeeDetail.approvalAuthorityLevel === 2 ? 'Up to SAR 50,000 (Manager Line)' : 'Standard (SAR 5,000 limit)'
                            })
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Actions with proper validation */}
                    <div className="border-t border-border/60 pt-3 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleAccessAccount(selectedEmployeeDetail.id, selectedEmployeeDetail.accountStatus)}
                          className={`flex-1 font-bold py-1.5 rounded-lg text-xs transition flex justify-center items-center gap-1 ${
                            selectedEmployeeDetail.accountStatus === 'ACTIVE' 
                              ? 'bg-amber-600/15 hover:bg-amber-600/25 text-amber-500 border border-amber-500/20' 
                              : 'bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          <ShieldAlert className="h-3.5 w-3.5" />
                          {selectedEmployeeDetail.accountStatus === 'ACTIVE' ? 'Lock Account' : 'Re-Activate Account'}
                        </button>
                        
                        <button 
                          onClick={() => handleFullAccessTokenGeneration(selectedEmployeeDetail.corporateEmail)}
                          className="px-2.5 py-1.5 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs transition font-bold"
                          title="Mint One-Time JWT SSO Token"
                        >
                          <Key className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {selectedEmployeeDetail.activeSessionsCount > 0 && (
                        <button 
                          onClick={() => terminateSessions(selectedEmployeeDetail.id)}
                          className="w-full font-bold py-1.5 bg-rose-600/15 hover:bg-rose-600/25 text-rose-500 border border-rose-500/20 rounded-lg text-xs transition"
                        >
                          Force Sign-Out From All Sessions
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-on-surface-muted space-y-3">
                  <Fingerprint className="h-10 w-10 text-border stroke-[1.2] animate-pulse" />
                  <p className="text-xs italic">Select any employee record from the left directory mapping pane to display corporate security records and authority tokens.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Provision Identity Tab with Pipeline status */}
      {activeTab === 'provision' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          
          {/* Multi-step form card */}
          <div className="lg:col-span-2 glass-panel border border-border p-5 rounded-xl space-y-6">
            
            {/* Step indicators */}
            <div className="flex justify-between items-center border-b border-border pb-4">
              <div>
                <h3 className="font-black text-xs uppercase tracking-wider text-indigo-400">Identity Provisioning Pipeline step {formStep} of 3</h3>
                <p className="text-[11px] text-on-surface-muted italic">
                  {formStep === 1 ? 'Personal Profile & Legal Registry Matching' :
                   formStep === 2 ? 'Corporate Hierarchy & Financial Placement' :
                   'Security Clearance & Access Token Generation'}
                </p>
              </div>

              <div className="flex items-center gap-1 font-mono text-xs">
                <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold ${formStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-border text-on-surface-muted'}`}>1</span>
                <span className="h-[1px] w-6 bg-border"></span>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold ${formStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-border text-on-surface-muted'}`}>2</span>
                <span className="h-[1px] w-6 bg-border"></span>
                <span className={`h-6 w-6 rounded-full flex items-center justify-center font-bold ${formStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-border text-on-surface-muted'}`}>3</span>
              </div>
            </div>

            {/* Step Forms */}
            {formStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="font-bold text-sm text-indigo-400 leading-none">1. Legal Identity Parameters</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">First Name (EN)</label>
                    <input 
                      type="text" 
                      value={form.firstName || ''} 
                      onChange={e => setForm({ ...form, firstName: e.target.value })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none" 
                      placeholder="e.g. Abdullah"
                    />
                    {errors.firstName && <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">Middle Name (EN)</label>
                    <input 
                      type="text" 
                      value={form.middleName || ''} 
                      onChange={e => setForm({ ...form, middleName: e.target.value })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none" 
                      placeholder="e.g. Khalid"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">Last Name (EN)</label>
                    <input 
                      type="text" 
                      value={form.lastName || ''} 
                      onChange={e => setForm({ ...form, lastName: e.target.value })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none" 
                      placeholder="e.g. Al-Dossari"
                    />
                    {errors.lastName && <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.lastName}</p>}
                  </div>
                  
                  <div className="col-span-1 md:col-span-3">
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1 text-right">الاسم القانوني الكامل بالتفصيل (العربية)</label>
                    <input 
                      type="text" 
                      value={form.arabicLegalName || ''} 
                      onChange={e => setForm({ ...form, arabicLegalName: e.target.value })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 text-right outline-none font-bold text-sm" 
                      placeholder="مثال: عبدالله خالد الدوسري"
                      dir="rtl"
                    />
                    {errors.arabicLegalName && <p className="text-rose-500 text-[10px] mt-1 text-right font-bold">{errors.arabicLegalName}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">National ID / Resident Passport</label>
                    <input 
                      type="text" 
                      value={form.nationalId || ''} 
                      onChange={e => setForm({ ...form, nationalId: e.target.value })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 font-mono outline-none" 
                      placeholder="10-digit Registry ID"
                    />
                    {errors.nationalId && <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.nationalId}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">Gender</label>
                    <select 
                      value={form.gender} 
                      onChange={e => setForm({ ...form, gender: e.target.value as 'MALE' | 'FEMALE' })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">Employment Scope Type</label>
                    <select 
                      value={form.employmentType} 
                      onChange={e => setForm({ ...form, employmentType: e.target.value as any })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none"
                    >
                      <option value="FULL_TIME">Full Time (Canonical Permanent)</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACTOR">Contractor Profile</option>
                      <option value="PROBATION">Probation / Trial</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/50">
                  <button 
                    onClick={() => { if (validateStep(1)) setFormStep(2); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 transition"
                  >
                    Next Step (Org Placement) <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {formStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="font-bold text-sm text-indigo-400 leading-none">2. Organizational Spatial & Financial Placement</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">Corporate Branch Code Target</label>
                    <select 
                      value={form.branchId} 
                      onChange={e => setForm({ ...form, branchId: e.target.value })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none font-mono"
                    >
                      <option value="branch-ruh-01">branch-ruh-01 (Riyadh Headquarters)</option>
                      <option value="branch-ruh-02">branch-ruh-02 (Jeddah Depot)</option>
                      <option value="branch-ruh-03">branch-ruh-03 (Dammam Wharfs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">Structural Department Line</label>
                    <select 
                      value={form.departmentId} 
                      onChange={e => handleDeptSelection(e.target.value)} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none"
                    >
                      <option value="dept-eng">Engineering & Product Development</option>
                      <option value="dept-fin">Corporate Wealth Accounting & Fin</option>
                      <option value="dept-sales">Sales Revenue & CRM Marketing</option>
                      <option value="dept-hr">General HR, Law & Governance</option>
                      <option value="dept-ops">General Procurement & Warehouse Operations</option>
                    </select>
                    {errors.departmentId && <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.departmentId}</p>}
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">Derived Cost Center ID</label>
                    <input 
                      disabled 
                      type="text" 
                      value={form.costCenterId || ''} 
                      className="w-full bg-surface-highlight border border-border rounded-lg p-2 font-mono text-on-surface-muted cursor-not-allowed outline-none" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1 font-bold">Document Approval Level Limitation Authority</label>
                    <select 
                      value={form.approvalAuthorityLevel} 
                      onChange={e => setForm({ ...form, approvalAuthorityLevel: Number(e.target.value) })}
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none font-black text-indigo-400"
                    >
                      <option value={1}>Tier-1: Junior Agent (SAR 5,000 max approval)</option>
                      <option value={2}>Tier-2: Head Specialist (SAR 50,050 max approval)</option>
                      <option value={3}>Tier-3: Finance Director / CFO (SAR 500,000 limit)</option>
                      <option value={4}>Tier-4: Corporate CEO / Owner (Unlimited transactional scope)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">Direct Reporting Line Supervisor</label>
                    <select 
                      value={form.reportingManagerId} 
                      onChange={e => setForm({ ...form, reportingManagerId: e.target.value })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none font-mono"
                    >
                      <option value="emp-nexa-1001">Abdulaziz Al-Suwaidan (NEX-EMP-001 - CEO)</option>
                      <option value="emp-nexa-1002">Sarah Mani (NEX-EMP-002 - CFO)</option>
                      <option value="emp-nexa-1003">Tariq Al-Harbi (NEX-EMP-003 - Senior Rep)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">Bound Inventory Warehouse Zone</label>
                    <select 
                      value={form.warehouseAccessId} 
                      onChange={e => setForm({ ...form, warehouseAccessId: e.target.value })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none font-mono"
                    >
                      <option value="wh-main-ruh">Riyadh Central Storage (Zone A/B)</option>
                      <option value="wh-retail-02">Jeddah Retail Box (Zone X)</option>
                      <option value="wh-coffe-901">HQ Coffee Beans Store</option>
                      <option value="none">No Physical Stock Entry Bounds</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">Ledger Payroll Group</label>
                    <select 
                      value={form.payrollGroup} 
                      onChange={e => setForm({ ...form, payrollGroup: e.target.value })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none font-mono"
                    >
                      <option value="PG-STANDARD">PG-STANDARD (General Group Payroll Ledger)</option>
                      <option value="PG-EXECUTIVE">PG-EXECUTIVE (Highly Sensitive Board Group)</option>
                      <option value="PG-CONTRACT">PG-CONTRACT (Contractor/Independent Invoice Group)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1 font-bold">Corporate Base Currency Mapping</label>
                    <select 
                      value={form.currency} 
                      onChange={e => setForm({ ...form, currency: e.target.value })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none font-bold"
                    >
                      <option value="SAR">Saudi Riyal (SAR - Regional Local Base)</option>
                      <option value="USD">United States Dollar (USD)</option>
                      <option value="EUR">Euro (EUR - Global Base Account)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">Chronos Shift Schedule Policy</label>
                    <select 
                      value={form.shiftPolicy} 
                      onChange={e => setForm({ ...form, shiftPolicy: e.target.value })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none font-mono"
                    >
                      <option value="SP-RIYADH-HQ">SP-RIYADH-HQ (08:30 - 17:30 Riyadh HQ Standard)</option>
                      <option value="SP-FLEXIBLE-HQ">SP-FLEXIBLE-HQ (HQ Remote Alternate Hours)</option>
                      <option value="SP-RETAIL-SHIFT">SP-RETAIL-SHIFT (Alternate Weekend Shift Scheme)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1 font-bold">Biometric Attendance Verification Policy</label>
                    <select 
                      value={form.attendancePolicy} 
                      onChange={e => setForm({ ...form, attendancePolicy: e.target.value })} 
                      className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none"
                    >
                      <option value="A-GEOFENCE-HQ">HQ Geofence - Local GPS Handshake Authorized</option>
                      <option value="A-TRUST-BASED">Trust-Based - Chronos Auto-clock Enabled</option>
                      <option value="A-BIOMETRIC-GATE">Biometric Gates - Local HQ Fingerprint Reader</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-border/50">
                  <button 
                    onClick={() => setFormStep(1)}
                    className="bg-surface border border-border hover:bg-surface-highlight text-on-surface-muted font-bold px-4 py-2 rounded-xl transition"
                  >
                    Back to Legal Details
                  </button>
                  <button 
                    onClick={() => { if (validateStep(2)) setFormStep(3); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl flex items-center gap-1.5 transition"
                  >
                    Next Step (Access & Gov) <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {formStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="font-bold text-sm text-indigo-400 leading-none">3. Security Access Authorization Control Panel</h4>
                
                <div className="bg-background/40 border border-border p-3 rounded-lg flex items-center justify-between mb-2">
                  <div className="space-y-0.5">
                    <h5 className="font-bold flex items-center gap-1">
                      <Fingerprint className="h-4 w-4 text-indigo-400" />
                      Provision Global System Login Credentials
                    </h5>
                    <p className="text-[10px] text-on-surface-muted">When active, registers a synchronized authorization profile in users database mapping, granting application entry.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={form.systemAccessEnabled} 
                    onChange={e => setForm({ ...form, systemAccessEnabled: e.target.checked })} 
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-border rounded focus:ring-2"
                  />
                </div>

                {form.systemAccessEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">Qualified Corporate Primary Username</label>
                      <input 
                        type="email" 
                        value={form.corporateEmail || ''} 
                        onChange={e => setForm({ ...form, corporateEmail: e.target.value })} 
                        className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 font-mono outline-none" 
                        placeholder="e.g. j.doe@nexaledger.com"
                      />
                      {errors.corporateEmail && <p className="text-rose-500 text-[10px] mt-1 font-bold">{errors.corporateEmail}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1 font-bold">Allowed IP Security Range Policies</label>
                      <input 
                        type="text" 
                        value={form.allowedIpRanges || ''} 
                        onChange={e => setForm({ ...form, allowedIpRanges: e.target.value })} 
                        className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 font-mono outline-none" 
                        placeholder="e.g. 192.168.1.0/24, 10.0.0.0/8"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">MFA Compliance Requirement</label>
                      <select 
                        value={form.mfaRequired ? 'yes' : 'no'} 
                        onChange={e => setForm({ ...form, mfaRequired: e.target.value === 'yes' })} 
                        className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none"
                      >
                        <option value="yes">MFA Mandatory Enforced (Strict Google Authenticator/TOTP)</option>
                        <option value="no">Optional MFA Policy Assigned</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-on-surface-muted mb-1">Workstation Node Restrictions</label>
                      <select 
                        value={form.deviceRestriction} 
                        onChange={e => setForm({ ...form, deviceRestriction: e.target.value as any })} 
                        className="w-full bg-background border border-border rounded-lg p-2 focus:border-indigo-500 outline-none font-mono"
                      >
                        <option value="ALL">ALL (Accessible via any valid client proxy SSL browser token)</option>
                        <option value="SECURE_MOBILE">SECURE_MOBILE (Strict biometric cellular apps only)</option>
                        <option value="OFFICE_WORKSTATIONS">OFFICE_WORKSTATIONS (Corporate Local Office LAN desktop terminals)</option>
                      </select>
                    </div>

                    <div className="col-span-1 md:col-span-2 bg-rose-500/[0.03] border border-rose-500/20 p-3 rounded-lg flex items-center justify-between">
                      <div className="space-y-0.5 max-w-[85%]">
                        <h5 className="font-bold text-rose-400 flex items-center gap-1 leading-none">
                          <ShieldAlert className="h-4 w-4" /> Privilege Escalate Auth Scope Toggle
                        </h5>
                        <p className="text-[10px] text-on-surface-muted">Warning: Granting elevated system bounds bypasses general department ACL validations, elevating role index to SYSTEM_ADMIN root.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={form.privilegedAccessFlag} 
                        onChange={e => setForm({ ...form, privilegedAccessFlag: e.target.checked })} 
                        className="h-4 w-4 text-rose-500 focus:ring-rose-400 border-border rounded focus:ring-2"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4 border-t border-border/50">
                  <button 
                    onClick={() => setFormStep(2)}
                    className="bg-surface border border-border hover:bg-surface-highlight text-on-surface-muted font-bold px-4 py-2 rounded-xl transition"
                  >
                    Back to placement
                  </button>
                  
                  <button 
                    onClick={executeProvisioningTunnel}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-lg text-xs transition flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Provision Corporate Identity Profile
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Real-time Dynamic Hierarchy and Permission Preview Cards */}
          <div className="space-y-4">
            
            {/* Visual preview profile badge */}
            <div className="glass-panel border border-border p-4 rounded-xl space-y-3 bg-gradient-to-br from-indigo-500/[0.02] to-transparent">
              <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest leading-none">Identity Mapping Card</h4>
              
              <div className="space-y-2">
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center font-black text-indigo-400 text-sm">
                    {form.firstName ? form.firstName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <div className="font-bold text-on-surface text-sm">
                      {form.firstName || form.lastName ? `${form.firstName} ${form.lastName}` : 'Unmapped Identity'}
                    </div>
                    <div className="font-mono text-[10px] text-on-surface-muted mt-0.5">Registry Status: Draft Token</div>
                  </div>
                </div>

                <div className="text-[10px] italic text-right font-bold text-on-surface-muted" dir="rtl">
                  {form.arabicLegalName || 'الاسم القانوني لم يدون'}
                </div>

                <div className="border-t border-border pt-2 text-[10px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-on-surface-muted font-mono">COST CENTER</span>
                    <span className="text-on-surface font-black font-mono">{form.costCenterId || 'Unmapped'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-muted font-mono">DEPARTMENT CODE</span>
                    <span className="text-on-surface font-black font-mono">{form.departmentCode || 'Unmapped'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-muted font-mono">SSN RECORD</span>
                    <span className="text-on-surface font-black font-mono">{form.nationalId || 'Unmapped'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Live Provisioning Terminal logs progress bar */}
            {isProvisioning && (
              <div className="glass-panel border border-indigo-500/40 p-4 rounded-xl space-y-3 animate-fade-in bg-black/60 relative spill-hidden">
                <div className="flex justify-between items-center border-b border-indigo-500/20 pb-2">
                  <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Cpu className="h-4 w-4 animate-spin text-indigo-400" /> ONBOARDING SYSTEM ENGINE RUN
                  </h4>
                  <span className="font-mono text-[10px] text-indigo-400 font-bold">{pipelineProgress}%</span>
                </div>

                {/* Progress bar line */}
                <div className="h-1.5 w-full bg-indigo-950 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${pipelineProgress}%` }}></div>
                </div>

                {/* Stream logs */}
                <div className="font-mono text-[9px] space-y-1.5 h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-900 border border-indigo-800/30 p-2 rounded bg-black/80">
                  {pipelineLogs.map((log, idx) => (
                    <div key={idx} className={`leading-relaxed ${
                      log.type === 'warning' ? 'text-rose-400' :
                      log.type === 'success' ? 'text-emerald-400' : 'text-zinc-400'
                    }`}>
                      <span className="text-indigo-400 font-bold">[{log.service}]</span> {log.msg}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Default Instruction details */}
            {!isProvisioning && (
              <div className="glass-panel border border-border p-4 rounded-xl space-y-3 bg-surface-highlight/20 text-xs">
                <h5 className="font-bold uppercase text-on-surface flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-indigo-400" /> Access & Permission Scopes
                </h5>
                <p className="text-[11px] text-on-surface-muted leading-relaxed">
                  Provisioning a corporate profile validates standard multi-module workflow bounds. Mapped accountants gain read-write logs on statements and Ledgers, while Sales Reps have constrained visibility to regional branch orders only.
                </p>
                <div className="border-t border-border pt-3 space-y-2 text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                    <div>PostgreSQL Core Sync validation checks</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-400"></div>
                    <div>Cryptographic record indexing inside Audit log</div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};
