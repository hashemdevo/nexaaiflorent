
import { 
    LayoutDashboard, FileText, BarChart3, Package, CreditCard, 
    HardHat, Stethoscope, Activity, Calendar, LayoutGrid, Truck, Pill, 
    ClipboardList, Plane, Wrench, Factory, Target, Building, BookOpen, Gavel,
    DollarSign, Star, ShoppingCart, MessageCircle, Loader2, Settings,
    Sun, Moon, Monitor, LogOut, Calculator, Home, Terminal
} from 'lucide-react';
import { ViewState, IndustryType, UniversalRole } from '../types';

export type CommandCategory = 'NAVIGATION' | 'ACTION' | 'TOOL';

export type CommandItem = {
    id: string;
    label: string;
    icon: any;
    category: CommandCategory;
    view?: ViewState;
    action?: (context: any) => void;
    industry?: IndustryType | 'ALL';
    keywords?: string[];
    forbiddenRoles?: UniversalRole[];
};

export const COMMANDS: CommandItem[] = [
    // --- CORE NAVIGATION ---
    { id: 'nav-dash', label: 'Dashboard', icon: Home, category: 'NAVIGATION', view: ViewState.DASHBOARD, industry: 'ALL' },
    { id: 'nav-pos', label: 'POS Terminal', icon: Terminal, category: 'NAVIGATION', view: ViewState.TOOLS_POS, industry: 'ALL', keywords: ['point of sale', 'register', 'cashier'] },
    { id: 'nav-reports', label: 'Financial Reports', icon: FileText, category: 'NAVIGATION', view: ViewState.REPORTS_FINANCIAL, industry: 'ALL', keywords: ['p&l', 'balance sheet', 'income'] },
    { id: 'nav-analytics', label: 'Analytics & Insights', icon: BarChart3, category: 'NAVIGATION', view: ViewState.ANALYTICS_ADVANCED, industry: 'ALL' },
    { id: 'nav-inventory', label: 'Inventory Management', icon: Package, category: 'NAVIGATION', view: ViewState.MANAGEMENT_INVENTORY, industry: 'ALL', keywords: ['stock', 'items', 'products'] },
    { id: 'nav-invoices', label: 'Sales Invoices', icon: CreditCard, category: 'NAVIGATION', view: ViewState.TOOLS_SALES_INVOICE, industry: 'ALL', keywords: ['bill', 'charge'] },
    
    // --- INDUSTRY SPECIFIC ---
    { id: 'ind-const', label: 'Construction Sites', icon: HardHat, category: 'NAVIGATION', view: ViewState.INDUSTRY_CONSTRUCTION_SITES, industry: 'CONSTRUCTION', keywords: ['projects', 'sites'] },
    
    { id: 'ind-med', label: 'Patient Records', icon: Stethoscope, category: 'NAVIGATION', view: ViewState.INDUSTRY_MEDICAL_PATIENTS, industry: 'MEDICAL', keywords: ['emr', 'patients'] },
    { id: 'ind-hosp', label: 'Hospital Operations', icon: Activity, category: 'NAVIGATION', view: ViewState.INDUSTRY_HOSPITAL_OPERATIONS, industry: 'HOSPITAL', keywords: ['er', 'surgery', 'wards'] },
    { id: 'ind-clinic', label: 'Clinic Scheduler', icon: Calendar, category: 'NAVIGATION', view: ViewState.INDUSTRY_CLINIC_SCHEDULER, industry: 'MEDICAL', keywords: ['appointments', 'calendar'] },
    
    { id: 'ind-rest', label: 'Restaurant Tables', icon: LayoutGrid, category: 'NAVIGATION', view: ViewState.INDUSTRY_RESTAURANT_TABLES, industry: 'RESTAURANT', keywords: ['floor plan', 'seats'] },
    { id: 'ind-kds', label: 'Kitchen Display', icon: Monitor, category: 'NAVIGATION', view: ViewState.TOOLS_KITCHEN, industry: 'RESTAURANT', keywords: ['kds', 'cook'] },
    
    { id: 'ind-fleet', label: 'Fleet Management', icon: Truck, category: 'NAVIGATION', view: ViewState.INDUSTRY_LOGISTICS_FLEET, industry: 'LOGISTICS', keywords: ['vehicles', 'drivers', 'dispatch'] },
    
    { id: 'ind-pharm', label: 'Pharmacy Dispensary', icon: Pill, category: 'NAVIGATION', view: ViewState.INDUSTRY_PHARMACY_DISPENSARY, industry: 'PHARMACY', keywords: ['drugs', 'rx', 'prescription'] },
    
    { id: 'ind-ret', label: 'Shift Manager', icon: ClipboardList, category: 'NAVIGATION', view: ViewState.INDUSTRY_RETAIL_SHIFTS, industry: 'RETAIL', keywords: ['schedule', 'staff'] },
    
    { id: 'ind-trav', label: 'Travel Bookings', icon: Plane, category: 'NAVIGATION', view: ViewState.INDUSTRY_TRAVEL_BOOKINGS, industry: 'TRAVEL', keywords: ['flights', 'hotels', 'itinerary'] },
    
    { id: 'ind-maint', label: 'Maintenance Requests', icon: Wrench, category: 'NAVIGATION', view: ViewState.INDUSTRY_MAINTENANCE_REQUESTS, industry: 'MAINTENANCE', keywords: ['repairs', 'tickets', 'service'] },
    
    { id: 'ind-mfg', label: 'Production Floor', icon: Factory, category: 'NAVIGATION', view: ViewState.INDUSTRY_MANUFACTURING_PRODUCTION, industry: 'MANUFACTURING', keywords: ['work orders', 'bom', 'assembly'] },
    
    { id: 'ind-crm', label: 'Sales Pipeline', icon: Target, category: 'NAVIGATION', view: ViewState.INDUSTRY_CRM_PIPELINE, industry: 'ALL', keywords: ['leads', 'deals', 'opportunities'] },
    
    { id: 'ind-real', label: 'Property Portfolio', icon: Building, category: 'NAVIGATION', view: ViewState.INDUSTRY_REAL_ESTATE_PROPERTIES, industry: 'REAL_ESTATE', keywords: ['units', 'tenants', 'leases'] },
    
    { id: 'ind-edu', label: 'Class Management', icon: BookOpen, category: 'NAVIGATION', view: ViewState.INDUSTRY_EDUCATION_CLASSES, industry: 'EDUCATION', keywords: ['students', 'courses', 'attendance'] },
    
    { id: 'ind-law', label: 'Case Management', icon: Gavel, category: 'NAVIGATION', view: ViewState.INDUSTRY_LEGAL_CASES, industry: 'LEGAL', keywords: ['matters', 'clients', 'court'] },

    // --- HRM ---
    { id: 'hr-perf', label: 'Performance Reviews', icon: Star, category: 'NAVIGATION', view: ViewState.HRM_PERFORMANCE, industry: 'ALL', keywords: ['kpi', 'appraisals', 'evaluation'] },
    { id: 'hr-leave', label: 'Leave Requests', icon: Calendar, category: 'NAVIGATION', view: ViewState.HRM_LEAVE, industry: 'ALL', keywords: ['vacation', 'time off'] },
    { id: 'hr-pay', label: 'Payroll Processing', icon: DollarSign, category: 'NAVIGATION', view: ViewState.HRM_PAYROLL, industry: 'ALL', keywords: ['salaries', 'payslips'] },

    // --- TOOLS ---
    { id: 'tool-purchasing', label: 'Purchasing & POs', icon: ShoppingCart, category: 'NAVIGATION', view: ViewState.TOOLS_PURCHASING, industry: 'ALL', keywords: ['procurement', 'vendors'] },
    { id: 'tool-comm', label: 'Communication Hub', icon: MessageCircle, category: 'NAVIGATION', view: ViewState.TOOLS_COMMUNICATION, industry: 'ALL', keywords: ['email', 'sms', 'marketing'] },
    { id: 'tool-import', label: 'Universal Data Import', icon: Loader2, category: 'NAVIGATION', view: ViewState.TOOLS_IMPORT, industry: 'ALL', keywords: ['migration', 'upload', 'backup'] },
    { id: 'tool-settings', label: 'System Settings', icon: Settings, category: 'NAVIGATION', view: ViewState.SETTINGS, industry: 'ALL' },

    // --- ACTIONS (Handled via special IDs in component) ---
    { id: 'act-theme', label: 'Switch Theme Mode', icon: Sun, category: 'ACTION', industry: 'ALL' },
    { id: 'act-pos-toggle', label: 'Toggle POS Module', icon: Monitor, category: 'ACTION', industry: 'ALL' },
    { id: 'act-logout', label: 'Log Out', icon: LogOut, category: 'ACTION', industry: 'ALL' },
    
    // --- AI TOOLS ---
    { id: 'tool-calc', label: 'Ask AI: Financial Advice', icon: Calculator, category: 'TOOL', industry: 'ALL' },
];
