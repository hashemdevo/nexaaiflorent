# Integrations Architecture

## 1. Overview

The platform integrates with multiple external services and internal Firebase ecosystem components. Integrations are designed with an **adapter pattern** to abstract third-party APIs behind internal service interfaces, enabling easy swapping of providers and consistent error handling across all integrations.

---

## 2. Integration Landscape

```
┌────────────────────────────────────────────────────────────┐
│                    PLATFORM CORE                            │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Firebase    │  │  Gemini AI   │  │  Banking     │     │
│  │  Ecosystem   │  │  (45+ domains)│  │  APIs        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Email       │  │  Storage     │  │  Payment     │     │
│  │  Service     │  │  (Files)     │  │  Gateway     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  SMS/OTP     │  │  Accounting  │  │  Tax         │     │
│  │  Provider    │  │  Standards   │  │  Authority   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Firebase Ecosystem Integration

### 3.1 Firebase Authentication

| Feature | Usage | Configuration |
|---------|-------|---------------|
| **Email/Password** | Primary authentication method | Password policy: 8+ chars, mixed case, number |
| **Custom Claims** | Role and permission storage | Set via Cloud Functions on user creation |
| **ID Tokens** | API authentication | 1-hour expiry, auto-refresh |
| **Session Management** | Login state persistence | `browser` persistence (clears on close) |
| **App Check** | API abuse protection | reCAPTCHA v3 for web |

### 3.2 Cloud Firestore

| Feature | Usage | Pattern |
|---------|-------|---------|
| **Real-time Listeners** | Live data updates in UI | Component-level subscriptions |
| **Transactions** | Atomic multi-document writes | Journal entry posting, inventory updates |
| **Batch Writes** | Bulk operations | Migration execution, data import |
| **Composite Indexes** | Complex queries | Defined in `firebase-blueprint.json` |
| **TTL Policies** | Auto-expiration | Session data, cache entries |

### 3.3 Cloud Storage

| Purpose | Path Pattern | Access Control |
|---------|-------------|---------------|
| **Invoice PDFs** | `tenants/{id}/invoices/{invId}.pdf` | Tenant-scoped read/write |
| **Receipts** | `tenants/{id}/receipts/{recId}.jpg` | Tenant-scoped read/write |
| **Product Images** | `tenants/{id}/products/{itemId}.webp` | Public read (CDN), tenant write |
| **Asset Documents** | `tenants/{id}/assets/{assetId}/*` | Tenant-scoped read/write |
| **User Avatars** | `tenants/{id}/avatars/{userId}.jpg` | Public read, user write |
| **Imports** | `tenants/{id}/imports/{batchId}/*` | Temporary, auto-deleted after 24h |
| **Exports** | `tenants/{id}/exports/{exportId}/*` | Temporary, auto-deleted after 48h |

### 3.4 Firebase Cloud Messaging (FCM)

| Notification Type | Trigger | Recipient |
|-------------------|---------|-----------|
| Invoice overdue | Scheduled check | Tenant admin, assigned manager |
| Payment received | Bank feed sync | Account owner |
| Low stock alert | Inventory threshold | Warehouse manager |
| Approval required | Workflow step | Designated approver |
| AI insight available | Analysis complete | Relevant role holders |
| Support ticket update | Customer reply | Support agent |
| Payroll processed | Payroll run complete | All employees (payslip ready) |

### 3.5 Firebase Cloud Functions

Used as server-side processing endpoints:
- **HTTP Functions:** API endpoints for external integrations
- **Firestore Triggers:** Automated post-processing on data changes
- **Scheduled Functions:** Periodic tasks (reconciliation, cleanup, reporting)
- **Callable Functions:** Direct client-to-function calls with auth context

---

## 4. Gemini AI Integration

### 4.1 API Configuration

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Model** | Gemini 1.5 Pro / Flash | Pro for complex tasks, Flash for quick queries |
| **API Version** | v1beta | Latest features including multi-modal |
| **Rate Limiting** | Per-tenant quota | Based on subscription tier |
| **Timeout** | 30 seconds | Client-side timeout with retry |
| **Region** | Auto-select | Nearest Gemini endpoint |

### 4.2 Request Pipeline

```
Client Request
    │
    ├── 1. Token Budget Check (subscriptionService)
    │   └── Reject if over budget
    │
    ├── 2. Cache Lookup (geminiService)
    │   └── Return cached if hit + valid
    │
    ├── 3. Context Assembly (domain module)
    │   ├── System prompt (domain-specific)
    │   ├── Business context (company data)
    │   └── User query
    │
    ├── 4. PII Scrubbing (securityService)
    │   └── Remove sensitive data from prompt
    │
    ├── 5. API Call (geminiService)
    │   └── Rate-limited, queued
    │
    ├── 6. Response Processing
    │   ├── Parse structured output
    │   ├── Validate against schema
    │   ├── Confidence scoring
    │   └── Safety check
    │
    └── 7. Response Delivery
        ├── Cache result
        ├── Log interaction (audit)
        └── Return to caller
```

---

## 5. Banking Integration

### 5.1 Bank Feed Service (`services/banking/feed.ts`)

| Capability | Implementation | Frequency |
|------------|---------------|-----------|
| **Transaction Import** | Plaid API / Bank API aggregator | Real-time or daily |
| **Balance Sync** | Plaid / Direct API | Every 4 hours |
| **Statement Download** | PDF parsing | On-demand |
| **Account Linking** | OAuth flow via Plaid Link | One-time setup |

### 5.2 Reconciliation Engine (`services/banking/reconciliation.ts`)

The reconciliation engine matches bank transactions with internal records using a multi-strategy approach:

1. **Exact Match:** Same amount + date + reference
2. **Fuzzy Match:** Similar amount (within tolerance) + close date
3. **AI-Assisted Match:** Gemini analyzes unmatched transactions for probable matches
4. **Manual Match:** User manually links transactions

---

## 6. Communication Integration

### 6.1 Multi-Channel Communication (`services/communication/`)

| Channel | Provider | Use Cases |
|---------|----------|-----------|
| **Email** | SendGrid / AWS SES | Invoices, reports, notifications |
| **SMS** | Twilio | OTP, urgent alerts, appointment reminders |
| **In-App** | FCM + Firestore | Real-time notifications |
| **WhatsApp** | Twilio WhatsApp API | Customer communication (future) |

### 6.2 Template System (`services/communication/templates.ts`)

- **Template Engine:** Handlebars-based with dynamic variables
- **Template Types:** Invoice, receipt, welcome, reminder, report, custom
- **AI Generation:** Gemini generates custom templates based on context
- **Localization:** Templates support multi-language variants

### 6.3 Campaign Dispatcher (`services/communication/dispatcher.ts`)

```
Campaign Creation
    │
    ├── Audience Selection
    │   └── Filter by customer segment, industry, behavior
    │
    ├── Channel Selection
    │   └── Email, SMS, or multi-channel
    │
    ├── Template Selection / AI Generation
    │   └── Choose template or generate with Gemini
    │
    ├── Scheduling
    │   └── Immediate, scheduled, or drip campaign
    │
    ├── Dispatch
    │   └── Rate-limited sending with delivery tracking
    │
    └── Analytics
        └── Open rate, click rate, bounce rate, conversion
```

---

## 7. Import/Export Integration

### 7.1 Data Import Pipeline (`components/tools/import/`)

| Component | Purpose |
|-----------|---------|
| `ImportUploader` | File upload (CSV, XLSX, OFX, QBO) with drag-and-drop |
| `ImportMapper` | Map import columns to internal data fields |
| `ImportPreview` | Preview and validate data before import |
| `UniversalImport` | Unified import interface for all data types |

### 7.2 Supported Import Formats

| Format | Extension | Data Types | Parsing Method |
|--------|-----------|------------|---------------|
| CSV | `.csv` | All | PapaParse |
| Excel | `.xlsx`, `.xls` | All | SheetJS |
| OFX | `.ofx` | Banking transactions | Custom parser |
| QBO | `.qbo` | Banking transactions | Custom parser |
| QIF | `.qif` | Banking transactions | Custom parser |
| IIF | `.iif` | QuickBooks interchange | Custom parser |

### 7.3 Data Export

| Format | Use Cases |
|--------|-----------|
| PDF | Invoices, reports, financial statements |
| CSV | Data export for spreadsheet analysis |
| XLSX | Formatted reports with charts |
| JSON | API integration data exchange |

---

## 8. Accounting Standards Integration

### 8.1 Standards Service (`services/accounting/standards.ts`)

| Standard | Applicability | Implementation |
|----------|--------------|---------------|
| **GAAP** | US-based businesses | Chart of accounts templates, reporting rules |
| **IFRS** | International businesses | Chart of accounts templates, reporting rules |
| **Local Standards** | Country-specific | Configurable rules per jurisdiction |

### 8.2 Standards Application

- **Chart of Accounts:** Pre-built templates aligned with GAAP/IFRS
- **Journal Entries:** Automatic validation against double-entry rules
- **Financial Statements:** Report generation follows standard formats
- **Period Management:** Fiscal year, quarter, and period close procedures
- **Audit Trail:** Complete transaction history for compliance

---

## 9. Future Integrations (Planned)

| Integration | Purpose | Priority |
|-------------|---------|----------|
| **QuickBooks Online** | Data sync for businesses using QBO | High |
| **Stripe** | Online payment processing | High |
| **Slack** | Team notifications and alerts | Medium |
| **Zapier** | Workflow automation connector | Medium |
| **DocuSign** | Digital signature for contracts/invoices | Medium |
| **Google Workspace** | Calendar, Drive, Sheets integration | Low |
| **Microsoft 365** | Outlook, Teams, Excel integration | Low |
| **Shopify** | E-commerce inventory sync | Medium |
| **Uber/DoorDash** | Restaurant delivery integration | Low |
```

---

## 10. HS Customs Classification (Harmonized System Codes)

### 10.1 Overview

**Status: [x] COMPLETED — Integrated via Gemini Logistics module**

The HS Customs Classification service enables international trade compliance by predicting the correct Harmonized System (HS) code for products based on their description. This is critical for logistics and import/export operations.

### 10.2 Service Architecture

| Element | Implementation |
|---------|---------------|
| **Gemini Module** | `services/gemini/logistics.ts` → `getHarmonizedCode()` |
| **UI Component** | Integrated in `SectorAiAnalyst` (Logistics sector) |
| **Input** | Product name and description in natural language |
| **Output** | Predicted HS code, customs description, confidence score, trade restrictions |

### 10.3 HS Code Processing

```
Product Description (natural language)
    │
    ├── Gemini.Logistics.getHarmonizedCode(description)
    │   ├── Analyze product characteristics
    │   ├── Match against HS code hierarchy (97 chapters)
    │   └── Generate customs description
    │
    ├── Output
    │   ├── HS Code (e.g., "8471.30.01" for laptops)
    │   ├── Customs description (formal trade language)
    │   ├── Confidence score
    │   └── Applicable trade restrictions (if any)
    │
    └── Integration
        ├── Link to purchase order / bill of lading
        ├── Export to customs declaration forms
        └── Update inventory item with HS classification
```

---

## 11. Bank Account Mockup Proxy

### 11.1 Overview

**Status: [ ] PLANNED — For testing and development**

The Bank Account Mockup Proxy simulates banking API responses for development, testing, and demo purposes without requiring actual bank API connections.

### 11.2 Mockup Architecture

| Feature | Implementation |
|---------|---------------|
| **Transaction Generator** | Creates realistic bank transaction data (deposits, withdrawals, transfers) |
| **Balance Simulator** | Maintains running balance based on generated transactions |
| **API Compatible** | Mirrors Plaid API response format for seamless switching |
| **Scenario Builder** | Pre-built scenarios: normal operations, fraud patterns, reconciliation edge cases |
| **Rate Simulation** | Configurable delay to simulate real API latency |

### 11.3 Use Cases

| Use Case | Mockup Feature |
|----------|---------------|
| **Development** | Test bank feed sync without Plaid credentials |
| **Demo** | Show realistic bank reconciliation with pre-built scenarios |
| **Testing** | Verify reconciliation engine with known transaction patterns |
| **Training** | New user onboarding with guided bank reconciliation exercises |

---

## 12. Document Upload & Vision Integration

### 12.1 Overview

**Status: [x] COMPLETED — Integrated in TransactionDirectorModal**

The Document Upload integration uses Gemini Vision to process uploaded financial documents (receipts, invoices, bank statements) through OCR and AI field extraction, automatically populating transaction forms.

### 12.2 Supported Document Types

| Document Type | Extraction Capabilities | AI Processing |
|---------------|------------------------|---------------|
| **Receipts** | Vendor, amount, date, tax, items | Gemini Vision → field extraction |
| **Invoices** | Invoice number, vendor, line items, total, due date | Gemini Vision → field extraction |
| **Bank Statements** | Transactions, balances, dates | Gemini Vision → structured data |
| **Contracts** | Parties, amounts, dates, terms | Gemini.Legal.analyzeContract |
| **Delivery Notes** | Items, quantities, sender | Gemini Vision → inventory matching |

### 12.3 Upload Processing Pipeline

```
File Selected (JPEG, PNG, PDF, XLSX)
    │
    ├── Upload to Cloud Storage (tenants/{id}/documents/)
    │
    ├── Gemini Vision Processing
    │   ├── OCR: Extract all text
    │   ├── Document Classification: Identify document type
    │   ├── Field Extraction: Amounts, dates, vendors, items
    │   └── Confidence Scoring per field
    │
    ├── Auto-populate Transaction Form
    │   ├── Map extracted fields to transaction form
    │   ├── Suggest account codes
    │   ├── Determine tax codes
    │   └── Assign cost center (if identifiable)
    │
    └── User Review & Submit
        ├── Verify extracted data
        ├── Modify if needed
        └── Submit through automation pipeline
```
