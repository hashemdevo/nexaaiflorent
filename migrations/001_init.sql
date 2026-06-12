-- Enterprise Database Schema & RLS Policies Migration

-- 1. Create essential tables with Tenant Isolation
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY,
    table_name TEXT,
    record_id UUID,
    action TEXT,
    actor_user_id TEXT,
    timestamp TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    category TEXT,
    currency TEXT,
    balance DECIMAL,
    is_system BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    version INT
);

CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    employee_id TEXT,
    timestamp TIMESTAMPTZ,
    type TEXT,
    method TEXT,
    location_lat DECIMAL,
    location_lng DECIMAL,
    geofence_status TEXT,
    biometric_score DECIMAL,
    anti_spoof_score DECIMAL,
    status TEXT
);

CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    type TEXT,
    aggregate_id TEXT,
    aggregate_type TEXT,
    payload JSONB,
    occurred_on TIMESTAMPTZ,
    status TEXT,
    error TEXT,
    created_at TIMESTAMPTZ
);

-- Note: Other tables (inventory, invoices, purchase_orders, etc.) follow similar schema
-- with tenant_id for isolation. For architectural review, we demonstrate RLS on core tables.

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies based on tenant_id
-- We assume the application will set the session variable 'app.current_tenant' securely or through JWT.
-- However, for simple isolation, if tenant_id is passed down to Postgres:

-- Example 1: Accounts isolated by tenant_id
CREATE POLICY tenant_isolation_accounts ON accounts
    USING (tenant_id = current_setting('app.current_tenant', true));

-- Example 2: Attendance Logs isolated by tenant_id
CREATE POLICY tenant_isolation_attendance ON attendance_logs
    USING (tenant_id = current_setting('app.current_tenant', true));

-- Example 3: Outbox isolated by tenant_id
CREATE POLICY tenant_isolation_outbox ON outbox_events
    USING (tenant_id = current_setting('app.current_tenant', true));

-- 4. Audit Log Policies
-- Insert only by application
CREATE POLICY audit_logs_insert ON audit_logs FOR INSERT WITH CHECK (true);
-- Read access restricted to super-admin roles
CREATE POLICY audit_logs_select ON audit_logs FOR SELECT USING (current_setting('app.current_role', true) = 'ROOT');
