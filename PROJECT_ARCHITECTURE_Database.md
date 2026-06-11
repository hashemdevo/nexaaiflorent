# Database Architecture & Dual-Engine Ledger (تصميم قواعد البيانات والمحرك المحاسبي المزدوج)

## 1. Overview & Dual-Engine Separation (فصل محرك المعاملات المحاسبية عن واجهة البيانات الفورية)

To meet the absolute safety and compliance demands of a production-grade enterprise ERP system (analogous to SAP and Odoo), Nexa Ledger implements a **Dual-Engine Ledger Architecture**. We strictly isolate our **Transactional Accounting Core** (the transactional source-of-truth) from our **Real-time Read & Presentation Layer**:

```
React UI (Viewer & Dashboard Controls)
   ↑ (Realtime Listeners & Collection Queries with Security Rules)
Firestore Projections (Realtime Read-Model & Presentational Projections Cache)
   ↑ (Streaming Updates via Consumers)
Kafka Events Broker (Append-Only Chronological Log Streams)
   ↑ (Publish Transaction Complete Events)
Accounting Engine & PostgreSQL (Double-Entry Source of Truth - ACID, Isolation, Key Constraints)
```

### The Transactional Core (PostgreSQL)
All monetary actions, balance sheets, chart of accounts nodes, pay runs, and stock valuations are strictly executed in an ACID-compliant **Postgres Accounting Core**.
- **Append-Only Double-Entry**: Financial records inside `journal_entries`, `journal_lines`, and `ledger_entries` are strictly append-only. Edits and deletion mutations are blocked via trigger constraints; corrections must be posted as offset reversing journal entries.
- **Strong Concurrency & Relational Integrity**: Prevents trace balance corruption or race conditions (e.g., A and B posting entries simultaneously changing cash balances) through pessimistic locks (`SELECT ... FOR UPDATE`) and relational foreign key constraints.

### The Projection & Security Layer (Google Cloud Firestore)
Google Cloud Firestore functions as our **Realtime Projection and View-Cached Performance Layer**.
- **No Direct Financial Writing**: The UI reads from Firestore collections to render bento cards, notifications, and analytics with immediate sub-second loads.
- **Event-Driven Projection Sync**: When PostgreSQL commits a financial block, a **Kafka Event Consumer** captures the event and writes the corresponding document mapping directly to Firestore, and the UI reacts immediately.
- **Tenant Isolation Security (RLS)**: Firestore Rules (`firestore.rules`) act as an operational security backup, matching incoming reads strictly with authorized `request.auth.uid` and `.role`, while the client `db.ts` isolates indices by injecting `tenantId`.

### The 7 Core Projections (Domains) stored in Firestore:
1. **Core / Identity (`core.users`)**: Users, org_units, user_roles, RLS policies.
2. **Human Resources (`hr`)**: Employees, attendance, payroll, leave requests.
3. **Sales & Orders (`sales`)**: Customers, clients, invoices, payments, crm_deals.
4. **Procurement & Supply Chain (`procurement`)**: Suppliers, vendors, purchase_orders, bill_payments, inventory.
5. **Related Parties (`related_parties`)**: Investors, partner_ledger, director_loans.
6. **Finance & Ledger (`ledger`)**: chart_of_accounts, journal_entries projections, account_balances caches.
7. **Banking & Operational (`banking_ops`)**: bank_accounts, bank_transactions, fixed_assets.

---

## 2. Global Entity Standards (المعايير الموحدة للبيانات والمسؤوليات)

Each schema table/collection enforces these standard fields to maintain strict relational continuity:
- `id`: **`UUID v7`** (Sortable, timestamp-indexed, strictly enforced upon insertion via `generateUUIDv7`)
- `tenantId`: `UUID` (string)
- `createdAt` / `updatedAt`: `TIMESTAMPTZ` (ISO String)
- `amount` / `balance`: `NUMERIC(18,2)` (Double precision via Firestore number)
- `created_by` / `updated_by`: relational links to `core.users`.

### UUID v7 Primary Key Standard
Every single table uses UUID v7 as its primary key. This guarantees trace sortability, highly efficient distributed indexing, and strict relational consistency across multi-tenant enterprise shards.

### Interactive PostgreSQL Engine & Console
For forensic investigation and developer accessibility, the system records all read/write/delete query steps as compliant PostgreSQL syntax statement traces in an on-screen log stream. Additionally, developers can input and execute interactive, standard SQL statements against our localized states directly in the developer board:
- `SELECT * FROM <relation> WHERE <condition>;`
- `INSERT INTO <relation> (<columns>) VALUES (<values>);`
- `UPDATE <relation> SET <assignments> WHERE id = <uuid_v7>;`

> **Note on Employee Database & Identity Provisioning:** 
> The Employee Directory is logically part of the **`HR Schema`** and stored physically inside the **`employees`** database table. When a corporate identity is provisioned, the system validates legal parameters, registers the employee record in the `employees` table, and automatically synchronizes the login credential link with the **`users`** table if system access is enabled. This architecture ensures complete segregation between HR operational details and Auth credentials.

---

## 3. Schema Breakdown

### 3.1 Schema: Core / Identity (`core`)
Handles Organization Units, RLS (Row Level Security via Rules), and User Roles.

```typescript
// Collection: users (The Employee Database)
interface UserEmployee {
  id: string; // UUID
  tenantId: string;
  name: string;
  email: string;
  role: UniversalRole; // System role (Owner, Accountant, Cashier)
  industry: IndustryType;
  status: 'ACTIVE' | 'SUSPENDED';
  isSetupComplete: boolean;
  createdAt: string; // TIMESTAMPTZ
  updatedAt: string; // TIMESTAMPTZ
}

// Collection: org_units
interface OrgUnit {
  id: string;
  name: string;
  parentUnitId?: string; // Hierarchical linking
}
```

### 3.2 Schema: Human Resources (`hr`)
```typescript
// Collection: pay_runs, attendance, retail_shifts
interface RetailShift {
  id: string;
  employeeId: string; // F.K. -> users.id
  date: string;
  startTime: string;
  endTime: string;
  baseHours: number; // NUMERIC(18,2)
  overtimeHours: number; // NUMERIC(18,2)
}
```

### 3.3 Schema: Procurement & Inventory (`procurement`)
```typescript
// Collection: suppliers
interface Supplier {
  id: string;
  name: string;
  contactEmail: string;
  taxId: string;
  outstandingBalance: number; // NUMERIC(18,2)
}
```

### 3.4 Schema: Sales & Customers (`sales`)
```typescript
// Collection: clients, customers
interface Customer {
  id: string;
  name: string;
  totalInvoiced: number; // NUMERIC(18,2) - Trigger generated / aggregated
}
```

### 3.5 Schema: Related Parties (`related_parties`)
```typescript
// Collection: related_parties, partner_ledger
interface RelatedParty {
  id: string;
  partyName: string;
  relationType: 'INVESTOR' | 'DIRECTOR' | 'SUBSIDIARY';
  currentExosure: number; // NUMERIC(18,2)
}
```

### 3.6 Schema: Ledger & Financials (`ledger`)
The Chart of Accounts acts as an `ltree` structure, establishing parent-child hierarchy for accounting nodes.

```typescript
// Collection: accounts
interface Account {
  id: string;
  code: string; // e.g., "1000.10.1"
  name: string;
  type: AccountType;
  parentAccountId?: string; // Generates ltree path
  balance: number; // NUMERIC(18,2) - Maintained via Transactions (View Equivalent)
}

// Collection: journal_entries
interface JournalEntry {
  id: string;
  totalAmount: number; // NUMERIC(18,2)
  // CHECK CONSTRAINT: totalDebits == totalCredits
}
```

### 3.7 Schema: Banking (`banking_ops`)
```typescript
// Collection: bank_accounts, bank_transactions
```

---

## 4. Separation of Powers & Relationship Equations

To emulate SQL constraints (`GENERATED`, `TRIGGER`, `VIEW`, `CHECK CONSTRAINTS`) inside our NoSQL/Firestore ecosystem, we employ **Service-Layer Engines**:

1. **TRIGGER / GENERATED**: The `JournalService.postEntry` acts as a transaction boundary. Whenever an invoice is posted, it instantly spans sub-updates to `accounts` (balances) and `customers` (outstanding metrics).
2. **VIEW**: Components like `Trial Balance` and `BankInsights` operate as SQL-like VIEWs by querying raw ledgers in real-time.
3. **CHECK CONSTRAINTS**: Validated statically in TypeScript classes (e.g., ensuring Debits = Credits before writing to Firestore).
4. **PolicyEngine (RLS)**: Firestore Rules (`firestore.rules`) provide genuine Row-Level Security, matching `request.auth.uid` and `.role` to document criteria before read/write operations.

---

## 5. Enterprise ERP Entity ID Map (خارطة وتتبع المعرفات الموحدة في المنظومة كاملة)

In order to guarantee absolute traceability, relational integrity, and auditability across modules (resembling SAP/Oracle patterns), every object/transaction is bound by a `UUID` instead of raw strings or codes. 

### 🏛️ 5.1 Organization Layer IDs
- `tenantId`: Identifies the system tenant (SaaS Isolation).
- `organizationId`: Identifies the parent organization.
- `companyId`: Identifies the operating legal entity.
- `branchId`: Identifies physical branches (e.g. branch-level geofence alignment).
- `departmentId`: Relational link for personnel structures.

### 👤 5.2 Human Resources & People IDs
- `employeeId` / `userId`: F.K. linking personnel back to auth pools.
- `managerId` / `supervisorId`: Generates organizational approval trees.
- `hrEmployeeId`: Relational link inside leave or salary reviews.
- `warehouseKeeperId`: Binds actions to Stockroom Custodians (e.g., هاني الشمري).
- `purchaseRepresentativeId`: Binds PO creations to Procurement Agents (e.g., أحمد محمود).
- `sellerId` / `salesRepresentativeId`: Matches orders/leads directly to sales staff (e.g., صالح العتيبي, سارة الشمري).

### 👥 5.3 CRM & Vendor Registry IDs
- `clientId` / `customerId`: Traceable customer identifier.
- `vendorId` / `supplierId`: Vendor identity mapping.
- `leadId` / `prospectId`: Sales lead identifier inside the CRM Pipeline.

### 🏦 5.4 Accounting & General Ledger Core IDs
- `accountId`: Unique Ledger Account Node.
- `journalEntryId` / `journalLineId`: General Double-Entry ledger markers.
- `trialBalanceId` / `financialStatementId`: Historical snapshot markers.
- `costCenterId` / `profitCenterId`: Allocation axes for analytical forensics.
- `bankAccountId` / `bankTransactionId`: Identifiers matching bank integrations.

### 📦 5.5 Supply Chain & Stock IDs
- `warehouseId` / `warehouseZoneId`: Stockroom coordinates.
- `inventoryItemId`: F.K. mapping item records.
- `stockMovementId`: Sequential serial track of item adjustments.
- `purchaseOrderId` / `purchaseOrderLineId` / `goodsReceiptId`: PO cycle traceability.

### 🔐 5.6 Infrastructure & System IDs
- `roleId` / `permissionId`: RBAC nodes.
- `auditLogId` / `securityEventId`: Write, threat, and access trackers.
- `anomalyDetectionId`: Analytical flags indicating discrepancies or audit alerts.

---

## 7. POS Transaction Lifecycle & Dual-Engine Reconciliation (دورة حياة معاملات نقطة البيع ومطابقة النظام المحاسبي المزدوج)

When designing a world-class enterprise ERP (such as SAP, NetSuite, and Odoo), point-of-sale (POS) systems represent a classic high-throughput architectural bottleneck. Directly posting every retail sale (e.g., selling a single cup of coffee or bottle of water) as an immediate, real-time double-entry general ledger entry in PostgreSQL is a dangerous, fragile design pattern.

Instead, Nexa Ledger implements the **Modern Sub-Ledger & Shift-End Aggregation Model (نموذج الأستاذ المساعد والمطابقة الدفعية عند إغلاق الوردية)**.

```
[ POS Checkout Cashier Terminal ]
               │
               ▼ (Instant Sub-second Write - High Speed & Offline Capable)
┌────────────────────────────────────────────────────────┐
│ Firestore `pos_sales` collection (Sub-Ledger / Draft)  │
└──────────────┬─────────────────────────────────────────┘
               │ (Triggers)
               ├─► Real-time Stock Deduction Projection (Immediate UI Display)
               └─► Real-time Cashier Current Session Balance Updated
               │
               ▼ (End-of-Shift / Cashier Blind-Drop Reconciliation)
┌────────────────────────────────────────────────────────┐
│ Shift Aggregator Module (Accountant Audit & Clearance) │
└──────────────┬─────────────────────────────────────────┘
               │ (One-Click Posting Approval / Scheduled Cron Run)
               ▼ (Consolidated Single Double-Entry Block JV Posting)
┌────────────────────────────────────────────────────────┐
│ PostgreSQL Transactional Core (Immutable general_ledger)│
│  - Debit Bank / Cash Current Account                   │
│  - Credit Sales Revenues                               │
│  - Credit VAT Output Liability Tax                     │
└────────────────────────────────────────────────────────┘
```

### Why we strictly avoid "Instant Core-Ledger Posting" (لماذا نتجنب ترحيل القيود لـ Postgres لحظة بلحظة؟):
1. **General Ledger Bloat (تضخيم دفتر الأستاذ العام)**: Running 10,000 journal entries a day for tiny retail transactions overwhelms the primary Chart of Accounts database, severely degrading analytical reports generation (e.g. Trial Balance, Balance Sheet) which must aggregate those inputs.
2. **Checkout Friction & Slower UX (بطء وتشويش نقاط البيع)**: If checkout lanes must block waiting for rigorous PostgreSQL multi-row transactions/isolation locking rules to commit, cashier checkout queues freeze during high-traffic hours.
3. **Double-Entry Pollution (تلوث القيود الدفترية)**: Cashier typos, voids, or customer returns would instantly pollute official tax and audit general ledger tables with micro-reversals, making financial audits highly complex and messy.

---

### The Nexa Hybrid Lifecycle Pattern (دورة حياة المعاملة المتكاملة):

We split the transaction lifecycle into four distinct stages:

#### Stage 1: The Transaction Event (الحدث الفوري بنقطة البيع)
- When a sale commits at the POS terminal, a high-frequency document is created in the **Firestore `pos_sales` folder** with status `COMPLETED`.
- Firestore security rules accept this write because it matches the authenticated cashier's branch scope.
- **Stock Decoupling (تفريغ المخزون اللحظي)**: The client-side service immediately updates the local and projected inventory quantities in Firestore so that the customer catalog never shows sold-out items.

#### Stage 2: The Sub-Ledger Buffer (مستودع الأستاذ المساعد المؤقت)
- The transaction exists purely inside Firestore's presentational projections.
- It is invisible to official fiscal financial calculations (like the official General Ledger or Trial Balance report).
- It resides in the **Cashier Sub-ledger** space, recording granular information: cashier ID, mada terminal transaction reference, specific sold product items, and tax percentages.

#### Stage 3: The Blind Drop & End of Shift (الإقفال ومطابقة عهدة الصندوق)
- When shutting down their shift, the Cashier performs a **"Blind Drop (مطابقة عمياء)"**: they declare the physical cash, network vouchers, and card terminal slips on hand *without* being shown the system expected totals.
- The system automatically compares physical declared cash vs. Firestore expected logs.
- Any discrepancy is flagged as a **`pos_reconciliation_anomaly`** for management reviews.

#### Stage 4: Accountant Consolidation & Postgres Commit (الترحيل والتسوية القيودية المجمعة)
- The Chief Accountant audits the shift summary.
- With **one-click (or an automated nightly batch daemon)**, the system bundles the thousands of sub-ledger sales into a single consolidated, gap-aware **Journal Entry (JV)**:
  - **Debit**: `MADA/VISA Card receivables (1020)`
  - **Debit**: `Cash on Hand Cashier (1010)`
  - **Credit**: `Point of Sale Service Revenue (4010)`
  - **Credit**: `VAT Output Tax Payable (2140)`
- This consolidated entry is written in a single ACID transaction to **PostgreSQL**.
- PostgreSQL locks the balances, registers sequential ledger markers, secures legal compliance (such as ZATCA block encryption), and emits of success back to Firestore which transitions the POS batch state to **`POSTED`**.

This elegant separation of powers gives Nexa ERP the speed and responsiveness of a local retail application combined with the audit-safe rigidity of a centralized Swiss bank.

