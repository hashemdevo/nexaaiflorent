
export * from './types/enums';
export * from './types/financial';
export * from './types/operational';
export * from './types/admin';
export * from './types/ui';
export * from './types/enterprise';

// Add PortalAdmin to the main export barrel
export type { PortalAdmin } from './types/admin';

// Backward compatibility type alias if needed
export type EmployeeRole = 'ADMIN' | 'ACCOUNTANT' | 'SALES' | 'VIEWER';