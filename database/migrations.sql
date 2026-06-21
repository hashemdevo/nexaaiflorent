-- NEXA ERP Main Database Blueprint (PostgreSQL Truth)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- WAVE 1: FOUNDATION & IDENTITY
-- ==========================================

CREATE TABLE IF NOT EXISTS tenants (
    tenant_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(tenant_id),
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    password_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    role_id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(tenant_id),
    role_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS org_units (
    org_unit_id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(tenant_id),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- FINANCAL DIMENSIONS (P0)
-- ==========================================

CREATE TABLE IF NOT EXISTS financial_dimensions (
    dimension_id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(tenant_id),
    dimension_type TEXT NOT NULL,
    name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cost_centers (
    cost_center_id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(tenant_id),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    department_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profit_centers (
    profit_center_id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(tenant_id),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    project_id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(tenant_id),
    project_code TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ACCOUNTING CORE
-- ==========================================

CREATE TABLE IF NOT EXISTS chart_of_accounts (
    coa_id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(tenant_id),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
    account_id TEXT PRIMARY KEY,
    coa_id TEXT REFERENCES chart_of_accounts(coa_id),
    account_number TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fiscal_periods (
    period_id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(tenant_id),
    year INTEGER NOT NULL,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'OPEN',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
    journal_id TEXT PRIMARY KEY,
    period_id TEXT REFERENCES fiscal_periods(period_id),
    posting_date DATE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'DRAFT',
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_lines (
    line_id TEXT PRIMARY KEY,
    journal_id TEXT REFERENCES journal_entries(journal_id) ON DELETE CASCADE,
    account_id TEXT REFERENCES accounts(account_id),
    description TEXT,
    debit DECIMAL(18,2) DEFAULT 0,
    credit DECIMAL(18,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    ledger_id TEXT PRIMARY KEY,
    journal_line_id TEXT REFERENCES journal_lines(line_id) ON DELETE CASCADE,
    account_id TEXT REFERENCES accounts(account_id),
    amount DECIMAL(18,2) NOT NULL,
    type TEXT NOT NULL, -- DEBIT or CREDIT
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- EVENT-DRIVEN / OUTBOX (P0)
-- ==========================================

CREATE TABLE IF NOT EXISTS outbox_events (
    event_id TEXT PRIMARY KEY,
    tenant_id TEXT REFERENCES tenants(tenant_id),
    aggregate_type TEXT NOT NULL,
    aggregate_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS dead_letter_queue (
    dlq_id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES outbox_events(event_id),
    error_reason TEXT NOT NULL,
    failed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- AUDIT LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    table_name TEXT,
    record_id TEXT,
    action TEXT,
    actor_user_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
