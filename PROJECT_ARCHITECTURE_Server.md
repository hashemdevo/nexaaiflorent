# Server Architecture

## 1. Overview

The platform uses a **serverless architecture** with no traditional servers to manage. All server-side logic runs on **Firebase Cloud Functions**, which are event-driven, auto-scaling, and billed per execution. This architecture eliminates server maintenance overhead and scales automatically from zero to thousands of concurrent users.

---

## 2. Cloud Functions Architecture

### 2.1 Function Categories

```
┌─────────────────────────────────────────────────────────┐
│              CLOUD FUNCTIONS                            │
│                                                         │
│  ┌───────────────────┐  ┌──────────────────────────┐   │
│  │  HTTP Functions    │  │  Firestore Triggers      │   │
│  │  (API Endpoints)   │  │  (Event-Driven)          │   │
│  │                    │  │                          │   │
│  │  /api/banking/sync│  │  onTransactionCreate     │   │
│  │  /api/reports/gen │  │  onInvoiceCreate         │   │
│  │  /api/payroll/run │  │  onWorkOrderUpdate       │   │
│  │  /api/ai/query    │  │  onUserCreate            │   │
│  │  /api/export      │  │  onTicketCreate          │   │
│  │  /api/import      │  │                          │   │
│  │  /api/comm/send   │  │                          │   │
│  └───────────────────┘  └──────────────────────────┘   │
│                                                         │
│  ┌───────────────────┐  ┌──────────────────────────┐   │
│  │  Scheduled Funcs  │  │  Callable Functions      │   │
│  │  (Cron Jobs)      │  │  (Client-Direct)         │   │
│  │                    │  │                          │   │
│  │  dailyReconcile   │  │  processPayment          │   │
│  │  periodCloseCheck │  │  generateReport          │   │
│  │  cacheWarmup      │  │  exportData              │   │
│  │  subscriptionCheck│  │  importData              │   │
│  │  backupTrigger    │  │  manageSubscription      │   │
│  └───────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Function Specifications

#### HTTP Functions

| Function | Runtime | Memory | Timeout | Purpose |
|----------|---------|--------|---------|---------|
| `bankingSync` | Node.js 20 | 1GB | 120s | Sync bank feeds, process transactions |
| `reportGenerate` | Node.js 20 | 2GB | 300s | Generate complex financial reports |
| `payrollRun` | Node.js 20 | 2GB | 540s | Execute full payroll calculation |
| `aiProxy` | Node.js 20 | 512MB | 60s | Proxy Gemini AI with rate limiting |
| `dataExport` | Node.js 20 | 1GB | 120s | Export data to various formats |
| `dataImport` | Node.js 20 | 1GB | 300s | Import and validate bulk data |
| `communicationSend` | Node.js 20 | 512MB | 60s | Dispatch emails, SMS, notifications |

#### Firestore Trigger Functions

| Function | Trigger | Runtime | Memory | Purpose |
|----------|---------|---------|--------|---------|
| `onTransactionCreate` | `transactions` onCreate | Node.js 20 | 512MB | Auto-categorize, update balances |
| `onInvoiceCreate` | `invoices` onCreate | Node.js 20 | 256MB | Update receivables, send notification |
| `onWorkOrderUpdate` | `workOrders` onUpdate | Node.js 20 | 256MB | Check completion, update inventory |
| `onUserCreate` | `users` onCreate | Node.js 20 | 256MB | Initialize workspace, set default role |
| `onTicketCreate` | `tickets` onCreate | Node.js 20 | 256MB | Auto-assign, notify support team |

#### Scheduled Functions

| Function | Schedule | Runtime | Memory | Purpose |
|----------|----------|---------|--------|---------|
| `dailyReconciliation` | Every day 02:00 UTC | Node.js 20 | 1GB | Auto-reconcile bank transactions |
| `periodCloseCheck` | Last day of month | Node.js 20 | 256MB | Verify period close readiness |
| `cacheWarmup` | Every 6 hours | Node.js 20 | 512MB | Pre-warm cache for active tenants |
| `subscriptionCheck` | Every day 00:00 UTC | Node.js 20 | 256MB | Check subscription expiry |
| `backupTrigger` | Every day 03:00 UTC | Node.js 20 | 1GB | Trigger Firestore backup |

---

## 3. Server-Side Processing Patterns

### 3.1 Request Processing Pipeline

```
Cloud Function Invocation
    │
    ├── 1. Authentication Verification
    │   ├── Verify Firebase ID token
    │   ├── Extract tenant context from custom claims
    │   └── Validate user permissions
    │
    ├── 2. Input Validation
    │   ├── Schema validation (types/validation.ts)
    │   ├── Business rule checking
    │   └── Sanitization
    │
    ├── 3. Business Logic Execution
    │   ├── Service layer call
    │   ├── Database operations (transactional)
    │   └── External API calls (if needed)
    │
    ├── 4. Post-Processing
    │   ├── Audit logging
    │   ├── Event emission
    │   ├── Cache invalidation
    │   └── Notification dispatch
    │
    └── 5. Response
        ├── Success: Structured response
        └── Error: Standardized error format
```

### 3.2 Transaction Processing

For financial operations that require atomic multi-document updates:

```typescript
// Pattern for financial transactions
async function processFinancialTransaction(data: TransactionInput) {
  return firestore.runTransaction(async (transaction) => {
    // 1. Read current balances
    const accounts = await readAccounts(transaction, data.accountIds);

    // 2. Validate business rules
    validateBalances(accounts, data);

    // 3. Create journal entry
    const entryId = createJournalEntry(transaction, data);

    // 4. Update account balances
    updateBalances(transaction, accounts, data);

    // 5. Create source document (invoice, bill, etc.)
    if (data.sourceType) {
      createSourceDocument(transaction, data);
    }

    return { entryId, status: 'posted' };
  });
}
```

### 3.3 Background Job Processing

For long-running operations that exceed Cloud Function timeout limits:

```
Client Request
    │
    ├── Cloud Function: Initiates job
    │   ├── Create job record in Firestore
    │   ├── Queue job details in Cloud Tasks
    │   └── Return job ID to client
    │
    ├── Cloud Tasks: Executes job
    │   ├── Process in chunks
    │   ├── Update job progress in Firestore
    │   └── Handle partial failures
    │
    └── Client: Monitors progress
        ├── Subscribe to job document
        ├── Show progress bar
        └── Display results on completion
```

**Use cases for background jobs:**
- Full payroll processing (hundreds of employees)
- Large data imports (10,000+ rows)
- Complex report generation (annual financial statements)
- Bulk email campaigns
- Database migrations

---

## 4. Shared Server Utilities

### 4.1 Middleware Pattern

```typescript
// Reusable middleware for Cloud Functions
const withMiddleware = (handler: FunctionHandler) => {
  return async (req: Request, res: Response) => {
    try {
      // Auth middleware
      const user = await authenticate(req);
      // Tenant isolation middleware
      const tenant = await resolveTenant(user);
      // Rate limiting middleware
      await checkRateLimit(tenant.id);
      // Permission check middleware
      await checkPermission(user, req.path);

      // Execute handler with enriched context
      const result = await handler(req, { user, tenant });
      res.json({ success: true, data: result });
    } catch (error) {
      handleError(error, res);
    }
  };
};
```

### 4.2 Error Handling

```typescript
// Standardized server error handling
class ServerError extends Error {
  constructor(
    public code: string,      // e.g., 'BIZ-001'
    public statusCode: number, // HTTP status code
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

// Error response format
{
  success: false,
  error: {
    code: 'BIZ-001',
    message: 'Journal entry is unbalanced',
    details: {
      totalDebits: 1000,
      totalCredits: 900,
      difference: 100
    }
  }
}
```

---

## 5. Infrastructure Configuration

### 5.1 Cloud Function Configuration

```javascript
// Function deployment configuration
const functions = require('firebase-functions');

module.exports = {
  bankingSync: functions
    .runWith({
      timeoutSeconds: 120,
      memory: '1GB',
      minInstances: 0,       // Cold start acceptable
      maxInstances: 100,     // Concurrency limit
    })
    .https.onRequest(withMiddleware(bankingSyncHandler)),

  payrollRun: functions
    .runWith({
      timeoutSeconds: 540,
      memory: '2GB',
      minInstances: 0,
      maxInstances: 10,      // Limit concurrent payroll runs
    })
    .https.onRequest(withMiddleware(payrollRunHandler)),
};
```

### 5.2 Cost Optimization

| Strategy | Implementation | Estimated Savings |
|----------|---------------|-------------------|
| **Min Instances = 0** | Cold starts for infrequent functions | 60-80% vs always-warm |
| **Memory right-sizing** | Match memory to actual usage | 30-50% |
| **Function splitting** | Separate fast/slow paths | 20-40% |
| **Caching** | Cache results in Firestore | 40-60% on repeat calls |
| **Batching** | Process multiple items per invocation | 50-70% vs per-item |
| **Client-side processing** | Move logic to client where possible | 80-90% server cost reduction |

---

## 6. Scalability Considerations

### 6.1 Scaling Model

| Resource | Auto-scaling | Limits |
|----------|-------------|--------|
| **Cloud Functions** | Automatic (0 → 1000 instances) | Max instances configurable per function |
| **Firestore** | Automatic (unlimited) | Soft limit: 1M concurrent connections |
| **Cloud Storage** | Automatic (unlimited) | Per-object size: 5TB |
| **Firebase Auth** | Automatic | 100K auth events/second |

### 6.2 Tenant Scaling

| Tenant Size | Expected Load | Architecture Impact |
|-------------|--------------|-------------------|
| **Small** (< 10 users) | Minimal | Shared function instances sufficient |
| **Medium** (10-100 users) | Moderate | Dedicated cache warming, indexed queries |
| **Large** (100-1000 users) | High | Dedicated function instances, read replicas (future) |
| **Enterprise** (1000+ users) | Very High | Custom infrastructure, dedicated project (future) |

---

## 7. Logging & Monitoring

### 7.1 Structured Logging

```typescript
// Standard logging format for Cloud Functions
interface LogEntry {
  timestamp: string;
  severity: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  function: string;
  tenantId: string;
  userId: string;
  requestId: string;
  action: string;
  duration: number;
  metadata?: Record<string, any>;
}
```

### 7.2 Monitoring Dashboard

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Function execution time | < 2s (p50) | > 10s (p95) |
| Function error rate | < 0.1% | > 1% |
| Firestore read latency | < 100ms (p50) | > 500ms (p95) |
| Firestore write latency | < 200ms (p50) | > 1s (p95) |
| Cold start time | < 2s | > 5s |
| Concurrent connections | Within quota | > 80% quota |
