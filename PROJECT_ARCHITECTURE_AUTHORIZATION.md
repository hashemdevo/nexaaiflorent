# Nexa Ledger: Master Role Permission Matrix & Authorization Engine (مصفوفة الصلاحيات الكبرى ونظام الحوكمة)

## 1. Overview & Architectural Policy (نظرة عامة والسياسة الأمنية)

In accordance with strict corporate governance (e.g., SOX compliance, IFRS audits, SOC2), Nexa Ledger implements a **Zero-Trust Hybrid Access Model** combining Role-Based Access Control (RBAC), Attribute-Based Access Control (ABAC), and Relation-Based Access Control (PBAC).
* **Multi-Tenant Enclave**: Every data query must append a verified `tenantId: UUID` and `companyId: UUID`. Any query attempting to bypass this constraint triggers an immediate system abort.
* **Separation of Duties (SoD)**: Key business conflicts (e.g., cashier balancing, requisitioner approving, voucher poster creator wall) are physically isolated in code to prevent internal collusion and fraud.
* **Deny Precedence**: If any explicit context block evaluates to `DENY`, access is immediately rejected regardless of nested role inheritances.

---

## 2. Master Permission Matrix & CRUD Boundaries (مصفوفة مستويات الصلاحيات والعمليات)

The following matrix outlines exact entity access controls. Standard employee roles are dynamically constrained by their assigned department and organizational branch scope.

| System Domain | Action / Resource | Chief Accountant (المحاسب) | HR Specialist (الموارد البشرية) | Procurement Rep (المشتريات) | Sales Rep (المبيعات) | Warehouse Keeper (أمين المستودع) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Financial Ledger** | Journal Entries (`journal_entries`) | **CRU (No Delete)** | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Financial Ledger** | Trial Balance / Balance Sheet | **R Only** | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Financial Ledger** | Cost Centers / Assets | **RU (No Create)** | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Security & Audits**| Audit & Forensic Logs | **R Only** | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **POS Checkout** | Sales Draft (`pos_sales`) | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | **CRUD (Local)** | ❌ Forbidden |
| **POS Checkout** | Shift Closing / Blind Drop | **R Only (Audit)** | ❌ Forbidden | ❌ Forbidden | **CU (Self Only)** | ❌ Forbidden |
| **Supply Chain** | Raw Materials Warehouse | ❌ Forbidden | ❌ Forbidden | **RU (Own Only)** | ❌ Forbidden | **CRU (Local)** |
| **Supply Chain** | Purchase Orders (POs) | **R Only** | ❌ Forbidden | **CRU (Own Only)** | ❌ Forbidden | ❌ Forbidden |
| **Supply Chain** | Goods Receipt (GRN) / Adjustments| **R Only** | ❌ Forbidden | **RU (Own Only)** | ❌ Forbidden | **CRU (Local)** |
| **Sales & CRM** | Customer Accounts / Contracts | **R Only** | ❌ Forbidden | ❌ Forbidden | **CRU (Own Only)** | ❌ Forbidden |
| **Sales & CRM** | Finished Goods Inventory | **R Only** | ❌ Forbidden | ❌ Forbidden | **R Only** | **CRU (Local)** |
| **Human Resources** | Employee Profiles / Biometrics | ❌ Forbidden | **CRU (No Delete)** | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Human Resources** | Attendance Logs (`attendance_logs`)| ❌ Forbidden | **RU (No Create)** | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Human Resources** | Payroll Calculation / Leaves | **R Only (Process)**| **CRU (No Delete)** | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |
| **Communications**| Team Communication Channels | **CRU (Own Channels)**| **CRU (Own Channels)**| **CRU (Own Channels)**| **CRU (Own Channels)**| **CRU (Own Channels)**|

*Key: **C** = Create, **R** = Read, **U** = Update, **D** = Delete (Usually soft-delete or reverse posting block), **Own Only** = Attributes constraint restricts records to matching actor’s `createdBy` or `userId` UUID.*

---

## 3. Dynamic Sidebar & System Visibility Mapping (خريطة الموديولات والواجهات)

When an enterprise actor signs-in, the UI environment computes their role profile. Safe, semantic modular routing dynamically hides and restricts unauthorized sidebar components to prevent API traversal:

### 3.1 Chief Accountant Interface (واجهة رئيس الحسابات)
* **Access Allowed**:
  - `Dashboard`: Financial KPIs, Cash position totals, Reconciliation status, Fraud Anomaly alerts.
  - `Reports`: General Ledger, Trial Balance, Income Statement, Balance Sheet, ZATCA e-Invoicing control status.
  - `Operations`: Bank accounts Insights, Reconciliation wizard, Asset depreciation schedules, Cost allocations.
  - `Systems`: Enterprise compliance scanner, Documents, Audits trail portal.
* **Explicitly Hidden**:
  - Direct POS checkout launcher.
  - HR payroll setup forms, Employee appraisal logs, Attendance biometric coordinate configurations.
  - Procurement purchase order creation wizards, Warehouse delivery gate logs.

### 3.2 HR Specialist Interface (واجهة أخصائي الموارد البشرية)
* **Access Allowed**:
  - `HR Team`: Employee directory, Biometric credential bindings.
  - `Attendance`: GPS Geofencing radii adjustments, Attendance log entries.
  - `Management`: Leave authorization workflow, Payroll pay-run engine.
  - `Systems`: Settings (HR context), Communication hub.
* **Explicitly Hidden**:
  - Cost Centers, Journal entries list, Trial balance ledger view.
  - Real-time Bank statements, Assets valuation, ZATCA Phase 2 dashboard.
  - Warehouse SKU counts, Supplier master catalog.

### 3.3 Procurement Representative (واجهة المشتريات)
* **Access Allowed**:
  - `Procurement`: Requisitions entry form, Supplier management directories.
  - `Inventory`: Raw materials catalog (Read-only), Inventory intake checklist (Goods Receipt slips).
  - `Systems`: Communication workspace.
* **Explicitly Hidden**:
  - Cash position charts, Trial Balance, Payroll logs.
  - Sales Pipeline, Customer quotation layouts.

### 3.4 Sales & CRM Representative (واجهة المبيعات وخدمة العملاء)
* **Access Allowed**:
  - `CRM`: Sales pipelines, Customer records, Proposals/Quotations generator.
  - `Finished Goods Stock`: Available-for-Sale inventory quantities (R-Only).
  - `POS`: Direct Retail POS launch pad.
  - `Systems`: Communication workspace.
* **Explicitly Hidden**:
  - RAW Materials inventory list, Manufacturing BOM recipes.
  - Company bank reconciliations, Trial Balance, HR Attendance registers.

---

## 4. Verification & Testing Policies (طرق التحقق والاختبار الفعلي)

1. **Role Bypass Blockers**: Any direct frontend attempts to toggle `activeTab` or query Firestore projections with an invalid role token will yield empty screens and trigger immediate background `security_violation_alert` entries in Firestore security collections.
2. **Double-Entry Constraint Checks**: Attempting to post any invoice or payment voucher that is unbalanced (Debits !== Credits) will be blocked at the PostgreSQL Accounting Engine API layer with error code `ERR_UNBALANCED_LEDGER`.
3. **Traceability Logging**: Every action evaluates dynamic audit differentials, writing precise state deltas (`beforeState` and `afterState`) with a cryptographic fingerprint traceable to the actor's session payload.
