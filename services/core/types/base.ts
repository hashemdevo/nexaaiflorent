
export interface BaseEntity {
    id?: string;
    tenantId: string;
    companyId?: string;
    createdAt: string;
    updatedAt: string;
    version: number;
    isDeleted?: boolean;
}

export interface DbTransaction {
    id: string;
    queries: { sql: string, values: any[] }[];
    status: 'PENDING' | 'COMMITTED' | 'ROLLED_BACK';
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
}

export type TableName = 
    | 'journal_entries' | 'accounts' | 'audit_logs' | 'clients' | 'users' | 'employees'
    | 'inventory' | 'warehouses' | 'stock_movements'
    | 'customers' | 'sales_orders' | 'invoices' | 'payments'
    | 'vendors' | 'purchase_orders' | 'bills' | 'bill_payments' | 'goods_receipts'
    | 'tax_rates' | 'bank_accounts' | 'bank_transactions'
    | 'fixed_assets' | 'depreciation_logs'
    | 'pay_runs' | 'payslips' | 'expense_claims'
    | 'budgets' | 'projects' | 'project_tasks' | 'timesheets'
    | 'boms' | 'production_orders' | 'leads' | 'opportunities' | 'interactions'
    | 'departments' | 'leave_requests' | 'performance_reviews'
    | 'system_settings' | 'notifications' | 'exchange_rates'
    | 'recurring_invoices' | 'job_logs' | 'approval_requests' | 'approval_policies'
    | 'qc_inspections' | 'support_tickets' | 'simulation_runs' | 'partner_ledger'
    | 'branches' | 'geofences' | 'attendance' | 'anti_spoof_logs' | 'attendance_logs'
    | 'cost_centers' | 'landed_costs' | 'production_runs' | 'stock_transfers'
    | 'saas_revenues' | 'saas_expenses' | 'kpi_objectives' | 'outbox_events' | 'profit_centers' | 'financial_projects';

export interface QueryOptions {
    where?: Record<string, any>;
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
}
