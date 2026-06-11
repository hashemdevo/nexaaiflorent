
import { 
    LayoutDashboard, FileSpreadsheet, Scale, Landmark, Sparkles, AlertOctagon, 
    TrendingUp, PieChart, Bot, ShieldCheck, Package, FileText, CreditCard, 
    Shield, History, Store, Settings, Database, Users, Briefcase, Cpu, 
    ShoppingBag, Utensils, Bell, HardHat, Stethoscope, Activity, LayoutGrid, 
    Truck, Pill, ClipboardList, Plane, Wrench, Factory, Target, Building, 
    BookOpen, Gavel, Calendar, DollarSign, Star, ShoppingCart, Mail, MapPin, ClipboardCheck
} from 'lucide-react';
import { ViewState, UniversalRole, IndustryType } from '../types';

export interface NavItemConfig {
    id: string;
    type: 'item' | 'group';
    label?: string;
    view?: ViewState;
    icon?: any;
    allowedRoles?: UniversalRole[];
    forbiddenRoles?: UniversalRole[];
    allowedIndustries?: (IndustryType | 'GENERIC')[];
}

export const MAIN_NAVIGATION: NavItemConfig[] = [
    { id: 'dash', type: 'item', label: 'Dashboard', view: ViewState.DASHBOARD, icon: LayoutDashboard },
    
    // --- INDUSTRY SPECIFIC GROUPS ---
    { id: 'ind_const_grp', type: 'group', label: 'Site Management', allowedIndustries: ['CONSTRUCTION'] },
    { id: 'ind_const_sites', type: 'item', label: 'Active Sites', view: ViewState.INDUSTRY_CONSTRUCTION_SITES, icon: HardHat, allowedIndustries: ['CONSTRUCTION'] },

    { id: 'ind_med_grp', type: 'group', label: 'Clinical Ops', allowedIndustries: ['MEDICAL', 'HOSPITAL'] },
    { id: 'ind_med_patients', type: 'item', label: 'Patient Records', view: ViewState.INDUSTRY_MEDICAL_PATIENTS, icon: Stethoscope, allowedIndustries: ['MEDICAL', 'HOSPITAL'] },
    { id: 'ind_hosp_ops', type: 'item', label: 'Hospital Ops', view: ViewState.INDUSTRY_HOSPITAL_OPERATIONS, icon: Activity, allowedIndustries: ['HOSPITAL'] },
    { id: 'ind_clinic_sched', type: 'item', label: 'Scheduler', view: ViewState.INDUSTRY_CLINIC_SCHEDULER, icon: Calendar, allowedIndustries: ['MEDICAL'] },

    { id: 'ind_rest_grp', type: 'group', label: 'Front of House', allowedIndustries: ['RESTAURANT'] },
    { id: 'ind_rest_tables', type: 'item', label: 'Table Management', view: ViewState.INDUSTRY_RESTAURANT_TABLES, icon: LayoutGrid, allowedIndustries: ['RESTAURANT'] },

    { id: 'ind_log_grp', type: 'group', label: 'Fleet & Dispatch', allowedIndustries: ['LOGISTICS'] },
    { id: 'ind_log_fleet', type: 'item', label: 'Active Fleet', view: ViewState.INDUSTRY_LOGISTICS_FLEET, icon: Truck, allowedIndustries: ['LOGISTICS'] },

    { id: 'ind_pharm_grp', type: 'group', label: 'Dispensary', allowedIndustries: ['PHARMACY'] },
    { id: 'ind_pharm_disp', type: 'item', label: 'Prescriptions', view: ViewState.INDUSTRY_PHARMACY_DISPENSARY, icon: Pill, allowedIndustries: ['PHARMACY'] },

    { id: 'ind_ret_grp', type: 'group', label: 'Retail Ops', allowedIndustries: ['RETAIL'] },
    { id: 'ind_ret_shifts', type: 'item', label: 'Shift Manager', view: ViewState.INDUSTRY_RETAIL_SHIFTS, icon: ClipboardList, allowedIndustries: ['RETAIL'] },

    { id: 'ind_trav_grp', type: 'group', label: 'Travel Desk', allowedIndustries: ['TRAVEL'] },
    { id: 'ind_trav_book', type: 'item', label: 'Bookings', view: ViewState.INDUSTRY_TRAVEL_BOOKINGS, icon: Plane, allowedIndustries: ['TRAVEL'] },

    { id: 'ind_maint_grp', type: 'group', label: 'Service Desk', allowedIndustries: ['MAINTENANCE'] },
    { id: 'ind_maint_req', type: 'item', label: 'Requests', view: ViewState.INDUSTRY_MAINTENANCE_REQUESTS, icon: Wrench, allowedIndustries: ['MAINTENANCE'] },

    { id: 'ind_mfg_grp', type: 'group', label: 'Production', allowedIndustries: ['MANUFACTURING'] },
    { id: 'ind_mfg_prod', type: 'item', label: 'Production Floor', view: ViewState.INDUSTRY_MANUFACTURING_PRODUCTION, icon: Factory, allowedIndustries: ['MANUFACTURING'] },

    { id: 'ind_real_grp', type: 'group', label: 'Properties', allowedIndustries: ['REAL_ESTATE'] },
    { id: 'ind_real_prop', type: 'item', label: 'Property Portfolio', view: ViewState.INDUSTRY_REAL_ESTATE_PROPERTIES, icon: Building, allowedIndustries: ['REAL_ESTATE'] },

    { id: 'ind_edu_grp', type: 'group', label: 'Academics', allowedIndustries: ['EDUCATION'] },
    { id: 'ind_edu_class', type: 'item', label: 'Classes', view: ViewState.INDUSTRY_EDUCATION_CLASSES, icon: BookOpen, allowedIndustries: ['EDUCATION'] },

    { id: 'ind_legal_grp', type: 'group', label: 'Legal Practice', allowedIndustries: ['LEGAL'] },
    { id: 'ind_legal_cases', type: 'item', label: 'Case Files', view: ViewState.INDUSTRY_LEGAL_CASES, icon: Gavel, allowedIndustries: ['LEGAL'] },

    // --- CORE MODULES ---
    { id: 'rep_grp', type: 'group', label: 'Financial Reports', allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'SYSTEM_ADMIN', 'ADMIN'] },
    { id: 'stmts', type: 'item', label: 'Financial Statements', view: ViewState.REPORTS_FINANCIAL, icon: FileSpreadsheet, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'SYSTEM_ADMIN', 'ADMIN'] },
    { id: 'trial', type: 'item', label: 'Trial Balance', view: ViewState.REPORTS_TRIAL_BALANCE, icon: Scale, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'SYSTEM_ADMIN', 'ADMIN'] },
    { id: 'reconcile', type: 'item', label: '3-Way Reconciliation', view: ViewState.REPORTS_RECONCILIATION, icon: ClipboardCheck, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'SYSTEM_ADMIN', 'ADMIN'] },
    { id: 'assets', type: 'item', label: 'Fixed Assets', view: ViewState.REPORTS_FIXED_ASSETS, icon: Landmark, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'SYSTEM_ADMIN', 'ADMIN'] },
    { id: 'insights', type: 'item', label: 'Bank Insights', view: ViewState.REPORTS_BANK_INSIGHTS, icon: Sparkles, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'SYSTEM_ADMIN', 'ADMIN'] },

    { id: 'anl_grp', type: 'group', label: 'Analytics & Forensic', allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'SYSTEM_ADMIN', 'ADMIN'] },
    { id: 'anom', type: 'item', label: 'Anomaly Detection', view: ViewState.ANALYTICS_ANOMALY, icon: AlertOctagon, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'SYSTEM_ADMIN', 'ADMIN'] },
    { id: 'adv', type: 'item', label: 'Advanced Analytics', view: ViewState.ANALYTICS_ADVANCED, icon: TrendingUp, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'SYSTEM_ADMIN', 'ADMIN'] },
    
    { id: 'sim_grp', type: 'group', label: 'Forecasting', allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'sim', type: 'item', label: 'Simulation Lab', view: ViewState.SIMULATION_DASHBOARD, icon: Cpu, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ADMIN', 'SYSTEM_ADMIN'] },

    { id: 'mgmt_grp', type: 'group', label: 'Management', allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'ADMIN', 'SYSTEM_ADMIN', 'WAREHOUSE_MANAGER', 'STOREKEEPER', 'INVENTORY_CONTROLLER', 'BRANCH_MANAGER', 'RESTAURANT_MANAGER', 'GENERAL_MANAGER', 'PURCHASING_SPECIALIST', 'SALES_REP'] },
    { id: 'cost', type: 'item', label: 'Cost Control', view: ViewState.MANAGEMENT_COST_CONTROL, icon: PieChart, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'prov', type: 'item', label: 'Provisions', view: ViewState.MANAGEMENT_PROVISIONS, icon: ShieldCheck, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'auto', type: 'item', label: 'Automation Rules', view: ViewState.MANAGEMENT_AUTOMATION, icon: Bot, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'inv', type: 'item', label: 'Inventory', view: ViewState.MANAGEMENT_INVENTORY, icon: Package, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'WAREHOUSE_MANAGER', 'STOREKEEPER', 'INVENTORY_CONTROLLER', 'RESTAURANT_MANAGER', 'BRANCH_MANAGER', 'PLANT_MANAGER', 'PROPERTY_MANAGER', 'PHARMACY_MANAGER', 'GENERAL_MANAGER', 'ADMIN', 'SYSTEM_ADMIN', 'PURCHASING_SPECIALIST', 'SALES_REP'] },

    { id: 'ops_grp', type: 'group', label: 'Operations', allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'BRANCH_MANAGER', 'RESTAURANT_MANAGER', 'GENERAL_MANAGER', 'ADMIN', 'SYSTEM_ADMIN', 'SALES_MANAGER', 'SALES_REP'] },
    { id: 'docs', type: 'item', label: 'Documents', view: ViewState.TOOLS_DOCUMENTS, icon: FileText, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'BRANCH_MANAGER', 'RESTAURANT_MANAGER', 'GENERAL_MANAGER', 'ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'sales', type: 'item', label: 'Sales Invoice', view: ViewState.TOOLS_SALES_INVOICE, icon: CreditCard, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'SALES_MANAGER', 'SALES_REP', 'ADMIN', 'SYSTEM_ADMIN', 'BRANCH_MANAGER', 'RESTAURANT_MANAGER', 'GENERAL_MANAGER'] },
    { id: 'zatca', type: 'item', label: 'ZATCA e-Invoicing', view: ViewState.TOOLS_ZATCA, icon: ShieldCheck, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'ADMIN', 'SYSTEM_ADMIN'] },
    
    // CRM
    { id: 'crm_grp', type: 'group', label: 'Sales & CRM', allowedIndustries: ['GENERIC', 'RETAIL', 'TRAVEL', 'LOGISTICS', 'MANUFACTURING', 'CONSTRUCTION', 'REAL_ESTATE', 'LEGAL'], allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'SALES_MANAGER', 'SALES_REP', 'GENERAL_MANAGER', 'RESTAURANT_MANAGER', 'BRANCH_MANAGER', 'SYSTEM_ADMIN', 'ADMIN', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT'] },
    { id: 'crm_pipe', type: 'item', label: 'Sales Pipeline', view: ViewState.INDUSTRY_CRM_PIPELINE, icon: Target, allowedIndustries: ['GENERIC', 'RETAIL', 'TRAVEL', 'LOGISTICS', 'MANUFACTURING', 'CONSTRUCTION', 'REAL_ESTATE', 'LEGAL'], allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'SALES_MANAGER', 'SALES_REP', 'GENERAL_MANAGER', 'RESTAURANT_MANAGER', 'BRANCH_MANAGER', 'SYSTEM_ADMIN', 'ADMIN', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT'], forbiddenRoles: ['KITCHEN_STAFF', 'DELIVERY', 'NURSE', 'TEACHER'] },
    
    { id: 'comm_hub', type: 'item', label: 'Communication', view: ViewState.TOOLS_COMMUNICATION, icon: Mail, allowedIndustries: ['GENERIC', 'RETAIL', 'TRAVEL', 'REAL_ESTATE', 'EDUCATION', 'LEGAL'], allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'SALES_MANAGER', 'SALES_REP', 'GENERAL_MANAGER', 'RESTAURANT_MANAGER', 'BRANCH_MANAGER', 'SYSTEM_ADMIN', 'ADMIN', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'HR_MANAGER', 'HR_SPECIALIST', 'PURCHASING_MANAGER', 'PURCHASING_SPECIALIST', 'WAREHOUSE_MANAGER', 'STOREKEEPER'] },

    { id: 'proc_grp', type: 'group', label: 'Procurement', allowedIndustries: ['GENERIC', 'RESTAURANT', 'CONSTRUCTION', 'RETAIL', 'MANUFACTURING', 'HOSPITAL', 'PHARMACY'], allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'PURCHASING_MANAGER', 'PURCHASING_SPECIALIST', 'WAREHOUSE_MANAGER', 'STOREKEEPER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'RESTAURANT_MANAGER', 'BRANCH_MANAGER', 'GENERAL_MANAGER', 'ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'purchasing', type: 'item', label: 'Purchasing', view: ViewState.TOOLS_PURCHASING, icon: ShoppingCart, allowedIndustries: ['GENERIC', 'RETAIL', 'TRAVEL', 'RESTAURANT', 'CONSTRUCTION', 'MANUFACTURING', 'HOSPITAL', 'PHARMACY'], allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'PURCHASING_MANAGER', 'PURCHASING_SPECIALIST', 'WAREHOUSE_MANAGER', 'STOREKEEPER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'RESTAURANT_MANAGER', 'BRANCH_MANAGER', 'GENERAL_MANAGER', 'ADMIN', 'SYSTEM_ADMIN'], forbiddenRoles: ['SALES_REP', 'CASHIER', 'TEACHER', 'DELIVERY'] },

    { id: 'tool_grp', type: 'group', label: 'Tools', allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'import', type: 'item', label: 'Universal Import', view: ViewState.TOOLS_IMPORT, icon: Database, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'ADMIN', 'SYSTEM_ADMIN'] },
    { id: 'comp', type: 'item', label: 'Compliance Audit', view: ViewState.COMPLIANCE_INTEGRITY, icon: Shield, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'ADMIN', 'SYSTEM_ADMIN'] },
    
    // HR
    { id: 'hr_grp', type: 'group', label: 'HR & Team', allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'HR_MANAGER', 'HR_SPECIALIST', 'RECRUITER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'SYSTEM_ADMIN', 'ADMIN'] },
    { id: 'hr_dir', type: 'item', label: 'Employee Directory', view: ViewState.HRM_DIRECTORY, icon: Users, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'HR_MANAGER', 'HR_SPECIALIST', 'RECRUITER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'SYSTEM_ADMIN', 'ADMIN'] },
    { id: 'hr_attendance', type: 'item', label: 'Attendance & Geofencing', view: ViewState.HRM_ATTENDANCE, icon: MapPin, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'HR_MANAGER', 'HR_SPECIALIST', 'RECRUITER', 'SYSTEM_ADMIN', 'ADMIN'] },
    { id: 'hr_leave', type: 'item', label: 'Leave Management', view: ViewState.HRM_LEAVE, icon: Calendar, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'HR_MANAGER', 'HR_SPECIALIST', 'RECRUITER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'SYSTEM_ADMIN', 'ADMIN'], forbiddenRoles: ['CASHIER', 'KITCHEN_STAFF', 'DELIVERY', 'RECEPTION', 'SALES_REP', 'SITE_ENGINEER', 'FOREMAN', 'TEACHER'] },
    { id: 'hr_pay', type: 'item', label: 'Payroll', view: ViewState.HRM_PAYROLL, icon: DollarSign, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'HR_MANAGER', 'HR_SPECIALIST', 'RECRUITER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'SYSTEM_ADMIN', 'ADMIN'], forbiddenRoles: ['CASHIER', 'KITCHEN_STAFF', 'DELIVERY', 'RECEPTION', 'SALES_REP', 'SITE_ENGINEER', 'FOREMAN', 'TEACHER'] },
    { id: 'hr_perf', type: 'item', label: 'Performance', view: ViewState.HRM_PERFORMANCE, icon: Star, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'HR_MANAGER', 'HR_SPECIALIST', 'RECRUITER', 'SYSTEM_ADMIN', 'ADMIN'], forbiddenRoles: ['CASHIER', 'KITCHEN_STAFF', 'DELIVERY', 'RECEPTION', 'SALES_REP', 'SITE_ENGINEER', 'FOREMAN', 'TEACHER'] },

    { id: 'sys_grp', type: 'group', label: 'System', allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'SYSTEM_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'RESTAURANT_MANAGER', 'GENERAL_MANAGER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'HR_MANAGER', 'HR_SPECIALIST', 'PURCHASING_MANAGER', 'PURCHASING_SPECIALIST', 'SALES_MANAGER', 'SALES_REP'] },
    { id: 'access_control', type: 'item', label: 'Access Control & Org', view: ViewState.ADMIN_ACCESS_CONTROL, icon: Shield, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'SYSTEM_ADMIN', 'ADMIN', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT'] },
    { id: 'settings', type: 'item', label: 'Settings', view: ViewState.SETTINGS, icon: Settings, allowedRoles: ['OWNER', 'PARTNER', 'CEO', 'SYSTEM_ADMIN', 'ADMIN', 'BRANCH_MANAGER', 'RESTAURANT_MANAGER', 'GENERAL_MANAGER', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'HR_MANAGER', 'HR_SPECIALIST', 'PURCHASING_MANAGER', 'PURCHASING_SPECIALIST', 'SALES_MANAGER', 'SALES_REP'] },
];
