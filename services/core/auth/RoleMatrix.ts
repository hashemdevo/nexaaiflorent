export interface RolePermissionMatrix {
    roleId: string;
    permissions: string[];
}

export const SYS_ROLE_MATRIX: Record<string, string[]> = {
    "ACCOUNTANT": ["GL_POST", "JE_READ", "COA_READ", "REPORTS_VIEW"],
    "HR_MANAGER": ["EMP_READ", "EMP_WRITE", "PAYROLL_POST", "LEAVE_APPROVE"],
    "PURCHASES_MGR": ["PO_READ", "PO_WRITE", "PO_APPROVE", "GRN_READ"],
    "VP_FINANCE": ["*", "BUDGET_APPROVE"],
    "SYSTEM_ADMIN": ["*"]
};
