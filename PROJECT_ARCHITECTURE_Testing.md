# Testing Architecture

## 1. Overview

The testing strategy follows a **testing pyramid** approach optimized for a Firebase + React application. Since significant business logic resides in the client-side service layer, the testing strategy emphasizes service-level unit tests, with integration tests covering Firestore interactions and E2E tests covering critical user workflows.

---

## 2. Testing Pyramid

```
                    ┌─────────┐
                    │   E2E   │   5%  — Critical user flows
                    │  Tests  │        (Playwright)
                   ─┴─────────┴─
                  ┌─────────────┐
                  │ Integration  │  20% — Service + Firestore
                  │    Tests     │       (Firebase Emulator)
                 ─┴─────────────┴─
                ┌─────────────────┐
                │   Unit Tests    │   75% — Services, utils,
                │                 │        validation, types
                └─────────────────┘
```

---

## 3. Test Types & Tools

### 3.1 Unit Tests

| Aspect | Details |
|--------|---------|
| **Runner** | Vitest |
| **Assertions** | Vitest built-in (expect) |
| **Mocking** | vi.mock() for service dependencies |
| **Coverage** | Target: 80% for service layer |
| **Location** | `__tests__/` alongside source files |

**Unit Test Scope:**
- Service module methods (all 25+ service modules)
- Validation logic (`services/core/types/validation.ts`)
- Data transformation functions
- Business rule calculations (depreciation, tax, payroll)
- AI response parsing and validation
- Search indexing and query logic
- Simulation models (Monte Carlo, deterministic, forecasting)

**Example Test Structure:**
```typescript
// services/ledger/__tests__/journal.test.ts
describe('Journal Service', () => {
  describe('createEntry', () => {
    it('should create a balanced journal entry', async () => {
      const entry = await journalService.createEntry({
        lines: [
          { accountId: 'cash', debit: 1000, credit: 0 },
          { accountId: 'revenue', debit: 0, credit: 1000 },
        ],
      });
      expect(entry.totalDebits).toBe(entry.totalCredits);
    });

    it('should reject unbalanced entries', async () => {
      await expect(
        journalService.createEntry({
          lines: [
            { accountId: 'cash', debit: 1000, credit: 0 },
            { accountId: 'revenue', debit: 0, credit: 500 },
          ],
        })
      ).rejects.toThrow('BIZ-001');
    });
  });
});
```

### 3.2 Integration Tests

| Aspect | Details |
|--------|---------|
| **Runner** | Vitest |
| **Database** | Firebase Emulator Suite (Firestore) |
| **Auth** | Firebase Emulator Suite (Auth) |
| **Setup** | Seed test data before each suite |
| **Teardown** | Clear emulator data between tests |

**Integration Test Scope:**
- Firestore CRUD operations via service layer
- Multi-document transactions (journal posting, inventory updates)
- Firestore security rules validation
- Cloud Function triggers and post-processing
- Real-time listener behavior
- Offline/sync behavior
- Cross-service workflows (invoice → ledger → tax)

**Emulator Configuration:**
```typescript
// Test setup with Firebase Emulators
beforeAll(async () => {
  // Connect to emulators
  firebase.initializeApp(firebaseAppConfig);
  firestore().useEmulator('localhost', 8080);
  auth().useEmulator('http://localhost:9099');

  // Seed test data
  await seeder.seed('test-tenant', 'crm');
});

afterAll(async () => {
  // Clean up emulator data
  await seeder.reset('test-tenant');
});
```

### 3.3 End-to-End (E2E) Tests

| Aspect | Details |
|--------|---------|
| **Runner** | Playwright |
| **Browsers** | Chromium, Firefox, WebKit |
| **Environment** | Staging (Firebase Emulator or staging project) |
| **Frequency** | Pre-release, nightly |
| **Scope** | Critical user flows only |

**Critical E2E Test Scenarios:**

| Flow | Test Steps |
|------|------------|
| **Login → Dashboard** | Login with email/password, verify dashboard loads, verify KPI widgets render |
| **Create Invoice** | Navigate to sales → invoices → create → fill form → save → verify in list |
| **Process POS Sale** | Open POS → add items to cart → checkout → print receipt → verify in transactions |
| **Journal Entry** | Create entry → add lines → submit → AI review → approve → verify posted |
| **Bank Reconciliation** | Import bank feed → auto-match → resolve discrepancies → complete reconciliation |
| **Payroll Run** | Navigate to payroll → run payroll → verify payslips → verify journal entries |
| **Admin: Client Management** | Login as admin → create client → verify in client grid → assign subscription |

---

## 4. Service-Level Testing Strategy

### 4.1 Service Test Matrix

| Service | Unit Test Priority | Integration Test Priority | Key Test Scenarios |
|---------|-------------------|--------------------------|-------------------|
| **Ledger** | Critical | Critical | Double-entry validation, period close, account balance calculations |
| **Banking** | High | Critical | Transaction sync, reconciliation matching, discrepancy resolution |
| **Sales/Invoices** | High | High | Invoice creation, payment recording, recurring generation |
| **Purchasing** | High | High | PO creation, goods receipt, bill matching, payment |
| **Inventory** | High | High | Stock movements, valuation, reorder triggers |
| **Payroll** | Critical | Critical | Deduction calculation, tax withholding, payslip generation |
| **Auth** | Critical | Critical | Login flow, 2FA setup/verification, session management |
| **Gemini** | Medium | Medium | Response parsing, error handling, rate limiting, fallback |
| **Simulation** | High | Medium | Monte Carlo execution, model comparison, result validation |
| **Search** | High | High | Indexing, query parsing, relevance ranking |

### 4.2 Financial Accuracy Testing

Financial calculations require **extra diligence** in testing:

```typescript
// Financial test patterns

// 1. Rounding precision tests
it('should handle currency rounding correctly', () => {
  const result = calculateTax(99.99, 0.0825);
  expect(result).toBeCloseTo(8.25, 2);  // Exact to 2 decimal places
});

// 2. Immutability tests
it('should not modify posted journal entries', async () => {
  const entry = await postEntry('je-001');
  await expect(updateEntry('je-001', { amount: 999 }))
    .rejects.toThrow('PERM-001');
});

// 3. Balance verification tests
it('should maintain trial balance after posting', async () => {
  await postMultipleEntries(entries);
  const trial = await generateTrialBalance();
  expect(trial.totalDebits).toBeCloseTo(trial.totalCredits, 2);
});

// 4. Edge case tests
it('should handle zero-amount transactions', () => { /* ... */ });
it('should handle negative amounts (credit notes)', () => { /* ... */ });
it('should handle multi-currency conversions', () => { /* ... */ });
```

---

## 5. Mocking Strategy

### 5.1 External Service Mocks

| Service | Mock Strategy | Implementation |
|---------|-------------|----------------|
| **Firebase Auth** | Mock SDK methods | `vi.mock('firebase/auth')` |
| **Firestore** | Use Emulator (integration) / Mock SDK (unit) | `vi.mock('firebase/firestore')` |
| **Gemini AI** | Mock API responses | `vi.mock('../gemini/geminiService')` |
| **Banking API** | Mock Plaid responses | `vi.mock('../banking/feed')` |
| **Communication** | Mock send functions | `vi.mock('../communication/dispatcher')` |

### 5.2 AI Response Mocks

```typescript
// Mock Gemini responses for consistent testing
const mockGeminiResponse = {
  analysis: 'Revenue trend is positive with 12% YoY growth',
  confidence: 0.87,
  suggestions: [
    { type: 'forecast', value: 'Projected Q4 revenue: $1.2M' }
  ]
};

vi.mock('../services/gemini/geminiService', () => ({
  ask: vi.fn().mockResolvedValue(mockGeminiResponse),
  analyze: vi.fn().mockResolvedValue(mockGeminiResponse),
}));
```

---

## 6. Test Data Management

### 6.1 Seed Data for Testing

| Data Set | Purpose | Source |
|----------|---------|--------|
| **CRM Demo** | CRM module testing | `services/core/seeds/crm.ts` |
| **HRM Demo** | HR module testing | `services/core/seeds/hrm.ts` |
| **Manufacturing Demo** | Manufacturing module testing | `services/core/seeds/manufacturing.ts` |
| **Projects Demo** | Project module testing | `services/core/seeds/projects.ts` |

### 6.2 Test Fixtures

```typescript
// Reusable test fixtures
const fixtures = {
  tenant: {
    id: 'test-tenant',
    name: 'Test Corporation',
    industry: 'retail',
    currency: 'USD',
  },
  user: {
    id: 'test-user',
    email: 'test@example.com',
    role: 'tenant_admin',
    tenantId: 'test-tenant',
  },
  account: {
    id: 'acc-cash',
    code: '1000',
    name: 'Cash',
    type: 'asset',
    balance: 10000,
  },
  invoice: {
    id: 'inv-001',
    totalAmount: 1500.00,
    status: 'draft',
  },
};
```

---

## 7. CI/CD Test Gates

### 7.1 Quality Gates

| Gate | Criteria | Action on Failure |
|------|----------|-------------------|
| **Lint** | Zero errors, zero warnings | Block merge |
| **Type Check** | Zero TypeScript errors | Block merge |
| **Unit Tests** | 100% pass, 80% coverage on service layer | Block merge |
| **Integration Tests** | 100% pass | Block merge |
| **E2E Tests** | 100% pass on critical flows | Block release |
| **Security Scan** | No critical/high vulnerabilities | Block release |

### 7.2 Test Execution in CI

```
Pull Request
    │
    ├── 1. Lint + Type Check (< 1 min)
    │
    ├── 2. Unit Tests (< 5 min)
    │   └── Vitest with coverage
    │
    ├── 3. Integration Tests (< 10 min)
    │   └── Firebase Emulator Suite
    │
    └── 4. Preview Deployment
        └── Auto-generated preview URL for manual testing

Release Tag
    │
    └── 5. E2E Tests (< 30 min)
        └── Playwright against staging environment
```

---

## 8. Performance Testing

### 8.1 Performance Benchmarks

| Operation | Target (p95) | Max Acceptable |
|-----------|-------------|----------------|
| Dashboard load | < 2s | < 5s |
| List view (50 items) | < 500ms | < 2s |
| Form save | < 1s | < 3s |
| AI suggestion | < 3s | < 10s |
| Report generation | < 5s | < 30s |
| Search results | < 300ms | < 1s |
| POS checkout | < 2s | < 5s |

### 8.2 Load Testing

- **Concurrent Users:** Test with 10, 50, 100, 500 simulated users
- **Data Volume:** Test with 1K, 10K, 100K documents per collection
- **Stress Scenarios:** Payroll run for 500 employees, import of 10K transactions

### 8.3 Sustained Remote Concurrency & Degradation Modeling (محاكاة الضغط المكثف)

To verify enterprise readiness under extreme spikes, Nexa integrates a **Sustained Remote Load-Testing Simulator** directly inside the `SystemDiagnostics` administrative tool. This module models persistent transactional throughput to test write-locking constraints, database index degradation, and AI response stability.

#### 1. Simulation Volumes & Speeds
- **Sustained Volumes:** Ranges from `10` to `50,000` sequential/parallel financial postings inside the ledger.
- **Accelerated Hybrid Engine:** For execution requests $> 100$ transactions, the simulator employs a programmatic statistical projection model that merges live physical random writes with scaled mock load variables to calculate the realistic physical degradation of Firestore and client UI memory without triggering actual client-side browser freezes.
- **Latency Monitoring:** Measures average transaction cycle speeds in milliseconds (`avgLatencyMs`) to map degradation curves across repeated runs.

#### 2. Gemini AI Latency Decay Tracking
- **The Probe:** Every stress test executes an automated background probe to the Gemini LLM endpoint with realistic transactional metadata.
- **Degradation Curvatures:** Under sustained load, the system tracks response time drift (`geminiResponseTimeMs`) to monitor network bottlenecks, cold starts, and token rate throttle thresholds.

#### 3. Historical Performance Benchmarks (تتبع تدهور الأداء)
- **State Data Persistence:** Latency results are logged chronologically and persisted inside the client's `localStorage` dictionary (`nexa_stress_historical_benchmarks`).
- **Degradation Graphs:** Integrated interactive Recharts `LineChart` visualizers plot Database Latency, Gemini AI Latency, and Write Throughput Density (writes/sec) side-by-side, giving developers immediate visual proof of connection decay, Firebase connection pooling stability, or indexing lag.

---

## 9. Google Cloud Platform (GCP) Quota & Resource Billing Projections

Every system check and stress test dynamically assesses host service consumption, projecting resource billing costs in USD to keep operations highly optimized.

### 9.1 Cost Modeling Formula

Projected costs are modeled in real-time based on the transaction volume ($V$), scenario complexity multiplier ($M_{scen}$), database write operations, and Gemini token length variables:

$$Projected\ GCP\ Cost\ (USD) = (V \times M_{scen} \times C_{firestore\_write}) + C_{gemini\_execution} + C_{egress}$$

Where:
- $C_{firestore\_write} = \$0.0000018$ (Standard Firestore write pricing per document)
- $C_{gemini\_execution} = \$0.015$ (Estimated token pricing per call using `gemini-2.5-flash`)
- $M_{scen}$ adjusts based on transaction scenario density:
  - **End-of-Month Consolidation (EOM):** $1.8 \times$ multiplier (heavy balance calculations)
  - **Retail POS Prime Spike (POS):** $1.2 \times$ multiplier (speed prioritized)
  - **Medical Formula Compounding (MFT):** $1.5 \times$ multiplier (validation audits)
  - **Construction BOQ Depletion (CON):** $1.6 \times$ multiplier (multi-level BOM dependencies)

### 9.2 Quota Bounds Warning Thresholds

The diagnostic panel flags projected monthly resource costs against predefined sandbox quota limits to prevent accidental hyper-scaling costs during load testing:

| Volume Selected | Estimated GCP Cost Baseline | Expected Firestore Actions | System Risk Flag |
|---|---|---|---|
| **10 Batches** | $0.01503 USD | ~18 physical writes | ✅ Normal Sandbox |
| **100 Batches** | $0.01532 USD | ~180 physical writes | ✅ Normal Sandbox |
| **1,000 Movements** | $0.01824 USD | ~1,800 physical writes | ⚠️ Low Quota Use |
| **10,000 Movements** | $0.04740 USD | ~18,000 physical writes | ⚠️ Medium Quota Use |
| **50,000 Movements** | $0.17700 USD | ~90,000 physical writes | 🚨 High Quota Use |

---
