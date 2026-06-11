# Backend APIs Architecture & Dual-Engine Pipeline (بنية الـ APIs ومحرك التحويل المحاسبي المزدوج)

## 1. Overview & Separation of Concerns (الفصل بين العمليات المالية وقراءة البيانات الفورية)

To ensure enterprise class consistency, security, and performance, Nexa separates high-frequency **financial transaction commit routines** (PostgreSQL) from **real-time display cache projections** (Firestore via Kafka event emission loops):

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React UI View)                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼ (Reads Realtime Snapshots)
┌────────────────────────────────────────────────────────────────────────┐
│               FIRESTORE PRESENTATIONAL PROJECTIONS                     │
│               - Multi-Tenant RLS Security isolation boundary           │
│               - Sub-second UI state loads & collection observers       │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ (Continuous Sync)
                         ┌──────────┴──────────┐
                         │ Kafka Event Streams │
                         └──────────▲──────────┘
                                    │ (Event Broadcast)
┌───────────────────────────────────┴────────────────────────────────────┐
│                    HIGH-INTEGRITY DOMAIN SERVICES                      │
│ - Transactional Isolation Level / Mutex locking                        │
│ - Strict Double-Entry Check Constraint (Debit === Credit)              │
│ - Immutability of general ledger and journal streams                   │
│ - Primary database: PostgreSQL (ACID Source of Truth)                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Service Module API Reference

### 3.1 Core Services (`services/core/`)

| Service | File | API Methods | Purpose |
|---------|------|-------------|---------|
| **Database** | `db.ts` | `read()`, `write()`, `update()`, `delete()`, `query()`, `batchWrite()`, `transaction()` | Low-level Firestore operations with tenant isolation, offline support, and error handling |
| **Cache** | `cache.ts` | `get()`, `set()`, `invalidate()`, `clear()`, `getOrFetch()` | In-memory cache with TTL, LRU eviction, and tenant-aware namespacing |
| **Events** | `events.ts` | `emit()`, `on()`, `off()`, `once()` | Application-wide event bus for cross-module communication |
| **Migrations** | `migrations.ts` | `run()`, `rollback()`, `status()` | Firestore schema migration runner for version upgrades |
| **Procedure** | `procedure.ts` | `execute()`, `define()`, `validate()` | Reusable business procedure runner with validation and rollback |
| **Seeder** | `seeder.ts` | `seed()`, `reset()`, `demo()` | Database seeder for demo data and test fixtures |

#### Database Service Pattern

```typescript
// db.ts provides tenant-isolated data access
class DatabaseService {
  // All methods automatically inject clientId for tenant isolation
  async read(collection: string, docId: string): Promise<Document>
  async write(collection: string, data: Partial<Document>): Promise<string>
  async update(collection: string, docId: string, data: Partial<Document>): Promise<void>
  async delete(collection: string, docId: string): Promise<void>
  async query(collection: string, filters: QueryFilter[]): Promise<Document[]>
  async batchWrite(operations: BatchOperation[]): Promise<void>
  async transaction(operations: TransactionFn): Promise<void>
}
```

### 3.2 Auth Services (`services/auth/`)

| Service | File | API Methods | Purpose |
|---------|------|-------------|---------|
| **Auth Core** | `core.ts` | `login()`, `logout()`, `register()`, `refreshToken()`, `onAuthChange()` | Firebase Auth wrapper with session management |
| **Auth Service** | `authService.ts` | `signInWithEmail()`, `signInWith2FA()`, `verify2FA()`, `setup2FA()`, `recoveryFlow()` | High-level authentication orchestration |
| **Auth Admin** | `admin.ts` | `createUser()`, `suspendUser()`, `resetUserPassword()`, `assignRole()`, `auditAuthEvents()` | Admin-level user management |

### 3.3 Financial Services

#### Ledger Service (`services/ledger/`)

| File | API Methods | Purpose |
|------|-------------|---------|
| `accounts.ts` | `createAccount()`, `getChartOfAccounts()`, `updateAccount()`, `archiveAccount()`, `getAccountBalance()` | Chart of accounts management |
| `journal.ts` | `createEntry()`, `postEntry()`, `reverseEntry()`, `getEntries()`, `getEntryById()`, `approveEntry()` | Double-entry journal system |
| `reporting.ts` | `generateTrialBalance()`, `generateBalanceSheet()`, `generateIncomeStatement()`, `generateCashFlow()` | Financial report generation |
| `ledgerService.ts` | `initialize()`, `processTransaction()`, `reconcile()`, `closePeriod()` | Ledger orchestration and period management |

#### Banking Service (`services/banking/`)

| File | API Methods | Purpose |
|------|-------------|---------|
| `accounts.ts` | `linkAccount()`, `syncTransactions()`, `getBalance()`, `getAccounts()` | Bank account integration |
| `feed.ts` | `getFeed()`, `categorize()`, `markReviewed()`, `searchTransactions()` | Transaction feed management |
| `reconciliation.ts` | `match()`, `autoReconcile()`, `getUnmatched()`, `resolveDiscrepancy()` | Bank reconciliation engine |

#### Other Financial Services

| Service | Key Methods | Purpose |
|---------|-------------|---------|
| **Expenses** (`expenses/`) | `submitClaim()`, `approveClaim()`, `reimburse()`, `getClaims()` | Expense management and reimbursement |
| **Budgeting** (`budgeting/`) | `createBudget()`, `trackVariance()`, `getForecast()`, `allocateFunds()` | Budget management and tracking |
| **Tax** (`tax/`) | `calculateTax()`, `getRates()`, `fileReturn()`, `getObligations()` | Tax calculation and compliance |
| **Payroll** (`payroll/`) | `runPayroll()`, `calculateDeductions()`, `generatePayslips()`, `submitFilings()` | Payroll processing engine |
| **Forecasting** (`forecasting/`) | `forecastCashFlow()`, `forecastDemand()`, `runScenario()`, `getHistoricalAccuracy()` | AI-powered financial forecasting |

### 3.4 Operational Services

| Service | Directory | Key Methods | Purpose |
|---------|-----------|-------------|---------|
| **Inventory** | `inventory/` | `addItem()`, `adjustStock()`, `transferStock()`, `getValuation()`, `reorderCheck()`, `allocateLandedCost()`, `relocateStockCustody()`, `recordProductionWipRun()` | Inventory management with multi-warehouse support, landed cost capitalization, and outlet cost center allocations |
| **Manufacturing** | `manufacturing/` | `createBOM()`, `createWorkOrder()`, `trackProgress()`, `recordCompletion()` | Manufacturing execution with BOM and work orders |
| **Purchasing** | `purchasing/` | `createPO()`, `receiveGoods()`, `createBill()`, `payBill()`, `evaluateVendor()` | Procure-to-pay cycle |
| **Sales** | `sales/` | `createOrder()`, `generateInvoice()`, `recordPayment()`, `setupRecurring()`, `getCustomerHistory()` | Quote-to-cash cycle |
| **POS** | `pos/` | `startSession()`, `addCartItem()`, `processCheckout()`, `printReceipt()`, `closeSession()` | Point of sale terminal operations |
| **Partner Ledger** | `pos/` | `getEntries(email)`, `getBalance(email)`, `getAllEntries()`, `getPartnersBreakdown()`, `recordWithdrawal()`, `recordDeposit()` | Double-entry current account tracking for partners |
| **Projects** | `projects/` | `createProject()`, `logTime()`, `getProgress()`, `allocateResources()` | Project and time tracking |
| **Quality** | `quality/` | `scheduleInspection()`, `recordResult()`, `getDefectRate()`, `generateReport()` | Quality management |

### 3.5 People Services

| Service | Directory | Key Methods | Purpose |
|---------|-----------|-------------|---------|
| **CRM** | `crm/` | `addLead()`, `scoreLead()`, `createOpportunity()`, `movePipeline()`, `getForecast()` | Lead-to-opportunity pipeline |
| **HRM** | `hrm/` | `addEmployee()`, `manageDepartments()`, `processLeave()`, `conductReview()` | Human resource management |
| **Communication** | `communication/` | `send()`, `schedule()`, `useTemplate()`, `getCampaignHistory()` | Multi-channel communication |
| **Support** | `support/` | `createTicket()`, `assignTicket()`, `sendChatMessage()`, `resolveTicket()` | Customer support system |

### 3.6 Intelligence Services

| Service | Directory | Key Methods | Purpose |
|---------|-----------|-------------|---------|
| **Analytics** | `analytics/` | `getKPIs()`, `getTrends()`, `drillDown()`, `getAnomalies()`, `generateReport()` | Business analytics engine |
| **Search** | `search/` | `index()`, `query()`, `suggest()`, `reindex()` | Full-text search with auto-complete |
| **Simulation** | `simulation/` | `createScenario()`, `runMonteCarlo()`, `compareModels()`, `getResults()` | Business simulation and modeling |
| **Gemini** | `gemini/` | `ask()`, `analyze()`, `generate()`, `validate()` | AI integration across all domains |

---

## 4. Cloud Functions API

### 4.1 HTTP Triggered Functions

| Function | Method | Path | Purpose |
|----------|--------|------|---------|
| `processBankFeed` | POST | `/api/banking/sync` | Sync bank transaction feed |
| `generateFinancialReport` | POST | `/api/reports/generate` | Generate financial reports (async) |
| `runPayroll` | POST | `/api/payroll/run` | Execute payroll run |
| `sendCommunication` | POST | `/api/communication/send` | Dispatch communications |
| `geminiProxy` | POST | `/api/ai/query` | Proxy Gemini AI requests (with rate limiting) |
| `exportData` | POST | `/api/export` | Export business data in various formats |
| `importData` | POST | `/api/import` | Import data with validation and mapping |

### 4.2 Firestore Triggered Functions

| Trigger | Collection | Event | Purpose |
|---------|-----------|-------|---------|
| `onTransactionCreate` | `transactions` | onCreate | Auto-classify, update balances, emit events |
| `onInvoiceCreate` | `invoices` | onCreate | Update receivables, notify customer |
| `onWorkOrderUpdate` | `workOrders` | onUpdate | Check completion, update inventory |
| `onUserCreate` | `users` | onCreate | Initialize user workspace, assign default role |
| `onSupportTicketCreate` | `tickets` | onCreate | Auto-assign, notify support team |

### 4.3 Scheduled Functions

| Function | Schedule | Purpose |
|----------|----------|---------|
| `dailyReconciliation` | Every day at 02:00 UTC | Auto-reconcile bank transactions |
| `periodCloseCheck` | Last day of month | Check period close readiness |
| `cacheWarmup` | Every 6 hours | Pre-warm cache for active tenants |
| `subscriptionCheck` | Every day at 00:00 UTC | Check subscription expiry, send reminders |
| `backupTrigger` | Every day at 03:00 UTC | Trigger Firestore export for backup |

---

## 5. Data Contracts & Validation

### 5.1 Validation Architecture

All service methods use the validation framework in `services/core/types/validation.ts`:

```typescript
// Validation pattern used across all services
interface ValidationRule<T> {
  field: keyof T;
  rules: Array<{
    type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
    value?: any;
    message: string;
    validator?: (value: any) => boolean;
  }>;
}

// Every service method validates input before processing
async createInvoice(data: InvoiceInput): Promise<Invoice> {
  const validated = validate(invoiceSchema, data);  // Throws on invalid
  // ... proceed with validated data
}
```

### 5.2 Standard API Response Format

```typescript
// Standard response wrapper for all service methods
interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    requestId: string;
    timestamp: number;
    duration: number;
  };
}
```

### 5.3 Error Code System

| Code Range | Category | Examples |
|------------|----------|---------|
| `AUTH-001` to `AUTH-099` | Authentication | Invalid credentials, expired token, 2FA required |
| `VAL-001` to `VAL-099` | Validation | Missing fields, invalid format, out of range |
| `PERM-001` to `PERM-099` | Permissions | Insufficient role, feature restricted, tenant isolation |
| `DATA-001` to `DATA-099` | Data Operations | Document not found, write conflict, quota exceeded |
| `BIZ-001` to `BIZ-099` | Business Rules | Unbalanced journal, period closed, negative inventory |
| `EXT-001` to `EXT-099` | External Services | Gemini timeout, bank API error, email delivery failure |

---

## 6. Transaction Director Pattern

The `TransactionDirector` (`services/transactions/director.ts`) is the central orchestrator for all financial transactions, implementing the **Director Pattern** for complex multi-step transaction processing:

```
Transaction Input
    │
    ├── 1. Route to appropriate procedure
    │   └── ManualEntry, AIInput, Import, Recurring
    │
    ├── 2. Validate business rules
    │   └── Balance check, period check, permission check
    │
    ├── 3. Execute procedure
    │   └── Create journal entries, update accounts, generate documents
    │
    ├── 4. Post-processing
    │   └── Emit events, update cache, trigger listeners
    │
    └── 5. Return result
        └── Success with data, or error with details
```

### Workflow Engine (`services/transactions/workflow/`)

The workflow engine enables configurable multi-step approval and processing workflows:

- **State Machine:** Each transaction type has a defined state machine (Draft → Pending → Approved → Posted)
- **Approval Routing:** Rules-based routing to appropriate approvers based on amount, type, and department
- **Parallel Steps:** Independent steps can execute concurrently
- **Compensation:** Failed steps trigger compensating actions for rollback


## 7. Hierarchical HRM Leave Approvals & Payroll Integration

### 7.1 Hierarchical Endpoints Summary
The platform supports hierarchical request routing for leave requests (`leave_requests` collection in Firestore), utilizing structural roles to decide target approvers dynamically.

#### Next-Approver Chain Rules:
* Requester Role is general (`CASHIER`, `KITCHEN_STAFF`, etc.) → Route `targetApproverRole` strictly to `ACCOUNTANT`
* Requester Role is standard mid-level (`ACCOUNTANT`) → Route `targetApproverRole` strictly to `CHIEF_ACCOUNTANT`
* Requester Role is CFO / manager (`CHIEF_ACCOUNTANT`) → Route `targetApproverRole` strictly to `OWNER` / `CEO`

### 7.2 Service Layer Logic Integration (`services/hrm/leave.ts`)
* `Nexa.HRM.Leave.request(dto)`: Assigns a unique request id, checks the requester role, evaluates target approver role, persists JSON in Firestore with `status: "PENDING"`, and triggers the corporate notification bus.
* `Nexa.HRM.Leave.approve(id, managerId)`: Modifies request state to `APPROVED`, tags the validating manager name/email, and registers a post-event callback triggering payroll hooks.

### 7.3 Automatic Payroll Deduction Hooks (`services/payroll/run.ts`)
When a monthly draft payroll is generated via `PayRunService.createDraftRun(dto)`:
1. The engine iterates through the list of targeted `employeeIds`.
2. Queries the database to discover any `APPROVED` leave requests belonging to the candidate employee:
   `DbEngine.select('leave_requests', { where: { employeeId: empId, status: 'APPROVED' } })`
3. Filters requests by type: if there are ANY days marked as `UNPAID` (إجازة غير مدفوعة), the engine sums the total unpaid duration (`unpaidLeaveDays`).
4. Computes the specific daily salary rate: `baseSalary / 30`.
5. Calculates the final unpaid leave deduction:
   `unpaidDeductions = (baseSalary / 30) * unpaidLeaveDays`
6. Subtracts this from gross pay by feeding a `DEDUCTION` component into the final calculation block inside the `PayrollEngine`. This reduces both the net pay and updates the general ledger entries.

