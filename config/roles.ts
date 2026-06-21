
import { IndustryType, UniversalRole } from '../types';

export const GLOBAL_ROLES: { id: UniversalRole; label: string }[] = [
    { id: 'OWNER', label: 'Owner' },
    { id: 'CEO', label: 'CEO' },
    { id: 'GENERAL_MANAGER', label: 'General Manager' },
    { id: 'BRANCH_MANAGER', label: 'Branch Manager' },
    { id: 'CHIEF_ACCOUNTANT', label: 'Chief Accountant' },
    { id: 'ACCOUNTANT', label: 'Accountant' },
    { id: 'HR_MANAGER', label: 'HR Manager' },
    { id: 'SYSTEM_ADMIN', label: 'System Admin' }
];

export const INDUSTRY_MODULES: Record<IndustryType, { id: UniversalRole; label: string }[]> = {
    'GENERIC': [],
    'RESTAURANT': [
        { id: 'RESTAURANT_MANAGER', label: 'Restaurant Manager' },
        { id: 'CASHIER', label: 'Cashier' },
        { id: 'KITCHEN_STAFF', label: 'Kitchen Staff' },
        { id: 'DELIVERY', label: 'Delivery Driver' },
        { id: 'RECEPTION', label: 'Reception/Host' },
    ],
    'CONSTRUCTION': [
        { id: 'PROJECT_MANAGER', label: 'Project Manager' },
        { id: 'SITE_ENGINEER', label: 'Site Engineer' },
        { id: 'FOREMAN', label: 'Foreman' },
        { id: 'QUANTITY_SURVEYOR', label: 'Quantity Surveyor' },
    ],
    'MEDICAL': [
        { id: 'DOCTOR', label: 'Doctor' },
        { id: 'NURSE', label: 'Nurse' },
        { id: 'LAB_TECHNICIAN', label: 'Lab Technician' },
    ],
    'PHARMACY': [
        { id: 'PHARMACY_MANAGER', label: 'Pharmacy Manager' },
        { id: 'PHARMACIST', label: 'Pharmacist' },
    ],
    'RETAIL': [
        { id: 'SALES_MANAGER', label: 'Floor Manager' },
        { id: 'CASHIER', label: 'Cashier' },
        { id: 'STOREKEEPER', label: 'Stock Clerk' }
    ],
    'MANUFACTURING': [
        { id: 'PLANT_MANAGER', label: 'Plant Manager' },
        { id: 'PRODUCTION_LEAD', label: 'Production Lead' }
    ],
    'REAL_ESTATE': [
        { id: 'PROPERTY_MANAGER', label: 'Property Manager' },
        { id: 'LEASING_AGENT', label: 'Leasing Agent' }
    ],
    'EDUCATION': [
        { id: 'PRINCIPAL', label: 'Principal' },
        { id: 'TEACHER', label: 'Teacher' },
        { id: 'REGISTRAR', label: 'Registrar' }
    ],
    'LEGAL': [
        { id: 'PARTNER', label: 'Managing Partner' },
        { id: 'LAWYER', label: 'Lawyer' },
        { id: 'PARALEGAL', label: 'Paralegal' }
    ],
    'LOGISTICS': [],
    'TRAVEL': [],
    'MAINTENANCE': [],
    'HOSPITAL': []
};

// Helper to get friendly name
export const getRoleLabel = (role: UniversalRole): string => {
    // Check Global
    const globalMatch = GLOBAL_ROLES.find(r => r.id === role);
    if (globalMatch) return globalMatch.label;

    // Check Modules
    for (const industry in INDUSTRY_MODULES) {
        const moduleMatch = INDUSTRY_MODULES[industry as IndustryType].find(r => r.id === role);
        if (moduleMatch) return moduleMatch.label;
    }

    // Fallback formatting
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};
