# Automation Architecture — AI-Driven Operations Engine

## 1. Overview

Automation is the **supreme command layer** of the Nexa platform. The AI does not merely assist — it **drives** the entire operational pipeline: from transaction capture and classification, through journal entry creation and posting, to financial analysis, compliance auditing, and strategic decision support. Every business process is either fully automated or automation-assisted, with human involvement required only for approval gates and exception handling.

The core philosophy: **The AI is the accountant, the analyst, the auditor, and the advisor.** The human operator supervises, approves, and directs — the AI executes.

---

## 2. Automation Hierarchy

```
┌──────────────────────────────────────────────────────────────┐
│              LEVEL 5: AUTONOMOUS DECISIONS                    │
│     AI makes and executes decisions within guardrails         │
│     Examples: Auto-post balanced entries, auto-reconcile      │
│               matches, auto-categorize transactions           │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────┴───────────────────────────────────┐
│              LEVEL 4: AI-PROPOSED, HUMAN-APPROVED             │
│     AI proposes actions, human approves before execution      │
│     Examples: Journal entries, invoice approvals, payroll     │
│               runs, compliance recommendations                │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────┴───────────────────────────────────┐
│              LEVEL 3: AI-AUGMENTED WORKFLOWS                  │
│     AI enhances human-driven processes with suggestions       │
│     Examples: Smart categorization, anomaly flags,            │
│               document OCR + field extraction                  │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────┴───────────────────────────────────┐
│              LEVEL 2: SCHEDULED AUTOMATION                    │
│     Time-based or event-triggered automated processes         │
│     Examples: Bank feed sync, reconciliation, period close    │
│               checks, subscription billing, cache warmup      │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────┴───────────────────────────────────┐
│              LEVEL 1: EVENT-DRIVEN REACTIONS                  │
│     System reacts to data changes automatically               │
│     Examples: Balance updates on entry post, inventory        │
│               adjustment on sale, notification on overdue      │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Automation Engine Architecture

### 3.1 Core Automation Components

```
┌────────────────────────────────────────────────────────────┐
│                  AUTOMATION ENGINE CORE                     │
│                                                            │
│  ┌─────────────────┐  ┌─────────────────┐                 │
│  │  Transaction     │  │  Workflow        │                 │
│  │  Director        │  │  Engine          │                 │
│  │  (director.ts)   │  │  (workflow/)     │                 │
│  └────────┬────────┘  └────────┬────────┘                 │
│           │                    │                           │
│  ┌────────┴────────┐  ┌───────┴──────────┐                │
│  │  AI Accountant   │  │  Procedure       │                │
│  │  (Gemini-driven) │  │  Runner          │                │
│  │                  │  │  (procedure.ts)   │                │
│  └────────┬────────┘  └───────┬──────────┘                │
│           │                    │                           │
│  ┌────────┴────────┐  ┌───────┴──────────┐                │
│  │  Event Bus       │  │  Scheduler       │                │
│  │  (events.ts)     │  │  (scheduler.ts)  │                │
│  └────────┬────────┘  └───────┬──────────┘                │
│           │                    │                           │
│  ┌────────┴────────────────────┴──────────┐                │
│  │         Firestore Change Listeners     │                │
│  │         (listeners/)                   │                │
│  └────────────────────────────────────────┘                │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Transaction Director (`services/transactions/director.ts`)

The Transaction Director is the central orchestrator that routes all financial transactions through the automation pipeline:

```typescript
// Transaction routing based on input method
enum TransactionInputMethod {
  MANUAL = 'manual',           // Manual entry via ManualEntryForm
  AI_VOICE = 'ai_voice',       // Voice command via AI
  AI_TEXT = 'ai_text',         // AI Accountant text input
  DOCUMENT_UPLOAD = 'upload',  // Uploaded document (OCR + AI extraction)
  BANK_FEED = 'bank_feed',     // Auto-imported from bank
  IMPORT = 'import',           // Bulk import from CSV/Excel
  RECURRING = 'recurring',     // Auto-generated recurring entry
}

class TransactionDirector {
  // Routes transaction to appropriate processing pipeline
  async route(input: TransactionInput): Promise<JournalEntry> {
    // 1. AI classifies the transaction
    const classification = await this.aiClassifier.classify(input);

    // 2. AI suggests account mapping (debit/credit)
    const suggestedEntry = await this.aiAccountant.createEntry(classification);

    // 3. Validation engine checks business rules
    const validated = this.validator.validate(suggestedEntry);

    // 4. Route through approval workflow
    if (validated.autoPostEligible) {
      return this.autoPost(validated);  // Level 5: Autonomous
    }
    return this.proposeForApproval(validated);  // Level 4: AI-proposed
  }
}
```

### 3.3 AI Accountant Pipeline

The AI Accountant is the automated accounting engine that replaces manual bookkeeping:

```
Raw Input (voice, text, document, bank feed)
    │
    ├── 1. INPUT PROCESSING
    │   ├── Voice: ASR → text → AI parsing
    │   ├── Text: Direct AI parsing
    │   ├── Document: OCR → AI field extraction
    │   ├── Bank Feed: Auto-categorization via AI
    │   └── Import: Column mapping + AI validation
    │
    ├── 2. AI CLASSIFICATION
    │   ├── Transaction type identification
    │   ├── Account code suggestion (chart of accounts mapping)
    │   ├── Cost center assignment
    │   ├── Tax code determination
    │   └── Counterparty identification
    │
    ├── 3. JOURNAL ENTRY GENERATION
    │   ├── Double-entry balancing
    │   ├── Multi-line entry construction
    │   ├── Currency conversion (if multi-currency)
    │   ├── Tax calculation
    │   └── Source document linking
    │
    ├── 4. AI REVIEW & VALIDATION
    │   ├── Balance verification (debits = credits)
    │   ├── Business rule compliance check
    │   ├── Anomaly detection (Benford's Law analysis)
    │   ├── Duplicate detection
    │   └── Confidence scoring
    │
    ├── 5. VOICE NARRATION (optional)
    │   ├── AI generates natural language explanation
    │   └── TTS speaks the entry explanation aloud
    │
    └── 6. ROUTING
        ├── High confidence + low amount → Auto-post (Level 5)
        ├── High confidence + high amount → Propose for approval (Level 4)
        ├── Medium confidence → Flag for human review (Level 3)
        └── Low confidence → Return to manual entry (Level 1)
```

---

## 4. Automated Business Processes

### 4.1 Financial Automation

| Process | Automation Level | AI Role | Human Role |
|---------|-----------------|---------|------------|
| **Transaction Capture** | Level 5 | Voice/text/document/bank → structured data | None (supervisory) |
| **Account Classification** | Level 5 | AI maps to chart of accounts | Override if needed |
| **Journal Entry Creation** | Level 4 | AI creates balanced entries | Approve/reject |
| **Bank Reconciliation** | Level 4 | AI matches transactions, resolves discrepancies | Review unmatched |
| **Invoice Processing** | Level 4 | AI extracts data, creates invoice, links to journal | Approve for sending |
| **Expense Categorization** | Level 5 | AI auto-categorizes expenses | Override if needed |
| **Tax Calculation** | Level 4 | AI determines tax codes and amounts | Review before filing |
| **Financial Reporting** | Level 3 | AI generates narratives and insights | Review and distribute |
| **Anomaly Detection** | Level 3 | AI flags suspicious patterns (Benford's Law) | Investigate flagged items |
| **Period Close** | Level 2 | Automated checks and validations | Confirm close |

### 4.2 Operational Automation

| Process | Automation Level | AI Role | Human Role |
|---------|-----------------|---------|------------|
| **Inventory Reorder** | Level 5 | AI triggers purchase orders at reorder points | Approve large orders |
| **POS Sale → Journal** | Level 5 | Auto-creates journal entry for each POS transaction | None |
| **Manufacturing BOM** | Level 3 | AI suggests BOM optimization | Approve changes |
| **Payroll Processing** | Level 4 | AI calculates deductions, generates payslips | Approve before submission |
| **Customer Segmentation** | Level 5 | AI segments customers automatically | Use segments for campaigns |
| **Demand Forecasting** | Level 3 | AI predicts demand based on historical data | Review and adjust |
| **Dynamic Pricing** | Level 5 | AI adjusts pricing in real-time (hospitality/retail) | Set guardrails |

### 4.3 Industry-Specific Automation

| Industry | Automated Process | AI Service | Output |
|----------|------------------|-----------|--------|
| **Construction** | Daily report analysis | `Gemini.Construction.analyzeDailyReport` | Risk alerts, safety incidents, resource delays, executive summary |
| **Retail** | Market basket analysis | `Gemini.Retail.analyzeMarketBasket` | Purchase patterns, shelf placement suggestions, confidence ratios |
| **Medical/Hospital** | Wellness data audit | `Gemini.Health.analyzeWellnessData` | Staff audit, operational initiatives, department health metrics |
| **Legal** | Contract analysis | `Gemini.Legal.analyzeContract` | Contract parties, amounts, dates, penalty schedules, risk classification |
| **Education** | Lesson plan generation | `Gemini.Education.createLessonPlan` | Developmental plans, minute-level scheduling, assessment seasons |
| **Logistics** | HS Code classification | `Gemini.Logistics.getHarmonizedCode` | Predicted HS code, customs description for international trade |
| **Restaurant/Hospitality** | Dynamic pricing | `Gemini.Hospitality.suggestDynamicPricing` | Seat revenue model, occupancy-based pricing, event adjustments |
| **Generic/Accounting** | Compliance risk audit | `Gemini.Finance.analyzeComplianceRisk` | Forensic accounting audit, tax/operational/regulatory risk detection |

---

## 5. Nexa Smart Industry Copilot

### 5.1 Architecture

The Nexa Smart Industry Copilot (`SectorAiAnalyst`) is the unified interface that connects every industry vertical to its specialized AI automation:

```
┌──────────────────────────────────────────────────────────────┐
│              SectorAiAnalyst Component                        │
│  (components/dashboard/SectorAiAnalyst.tsx)                   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐      │
│  │  Industry Selector (dropdown)                       │      │
│  │  └── Dynamically populated from currentUserIndustry │      │
│  │      + option to explore other industries           │      │
│  └────────────────────┬───────────────────────────────┘      │
│                       │                                      │
│  ┌────────────────────┴───────────────────────────────┐      │
│  │  Industry-Specific Input Form                       │      │
│  │  └── Auto-generated fields based on selected sector │      │
│  │      with pre-filled demo data for testing          │      │
│  └────────────────────┬───────────────────────────────┘      │
│                       │                                      │
│  ┌────────────────────┴───────────────────────────────┐      │
│  │  AI Analysis Results Panel                          │      │
│  │  ├── Structured output (tables, metrics)            │      │
│  │  ├── Natural language summary                       │      │
│  │  ├── Risk assessment visualization                  │      │
│  │  └── Voice playback button (TTS)                    │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Copilot-to-Service Integration

| Sector | Gemini Service Method | Input Data | AI Output |
|--------|----------------------|-----------|-----------|
| CONSTRUCTION | `Gemini.Construction.analyzeDailyReport` | Daily site report text | Risk events, safety incidents, concrete/structural summary, financial executive brief |
| RETAIL | `Gemini.Retail.analyzeMarketBasket` | Transaction history | Market basket associations, customer patterns, shelf placement plan, confidence scores |
| MEDICAL/HOSPITAL | `Gemini.Health.analyzeWellnessData` | Staff & operations data | Crew audit, operational metrics, department health, precision wellness initiatives |
| LEGAL | `Gemini.Legal.analyzeContract` | Contract document text | Parties, legal amounts, effective dates, penalty schedule, risk classification |
| EDUCATION | `Gemini.Education.createLessonPlan` | Curriculum requirements | Developmental plan, minute-scheduled timeline, assessment seasons |
| LOGISTICS | `Gemini.Logistics.getHarmonizedCode` | Product description | Predicted HS code, customs description, trade classification |
| RESTAURANT/HOSPITALITY | `Gemini.Hospitality.suggestDynamicPricing` | Occupancy & event data | Dynamic pricing model, seat revenue calculation, event-based adjustments |
| GENERIC | `Gemini.Finance.analyzeComplianceRisk` | Financial records | Forensic accounting audit, tax risk, operational risk, regulatory compliance |

---

## 6. Anomaly Forensic Audit (Benford's Law Engine)

### 6.1 Overview

The Anomaly Forensic Audit engine applies **Benford's Law** (First-Digit Law) statistical analysis to detect financial irregularities, fraud patterns, and data manipulation. Integrated with Gemini AI for deep investigation, it provides instant tax audit reports.

### 6.2 Benford's Law Analysis

```typescript
// Benford's Law expected distribution for first digits
const benfordExpected: Record<string, number> = {
  '1': 0.301, '2': 0.176, '3': 0.125, '4': 0.097,
  '5': 0.079, '6': 0.067, '7': 0.058, '8': 0.051, '9': 0.046,
};

// Analysis pipeline
class BenfordAnalyzer {
  // 1. Extract first digits from transaction amounts
  extractFirstDigits(transactions: Transaction[]): Map<string, number>;

  // 2. Calculate observed distribution
  calculateDistribution(digits: Map<string, number>): Record<string, number>;

  // 3. Compare with Benford's expected using chi-square test
  chiSquareTest(observed: Record<string, number>, expected: Record<string, number>): {
    statistic: number;
    pValue: number;
    isAnomalous: boolean;
  };

  // 4. Identify specific digits that deviate significantly
  identifyDeviations(observed: Record<string, number>): DeviationReport[];

  // 5. AI deep investigation of anomalies
  async investigateWithAI(deviations: DeviationReport[]): Promise<ForensicReport>;
}
```

### 6.3 Forensic Audit Pipeline

```
Transaction Ledger
    │
    ├── 1. Data Extraction
    │   └── Pull all transaction amounts for selected period
    │
    ├── 2. Statistical Analysis
    │   ├── First-digit distribution calculation
    │   ├── Second-digit distribution (optional)
    │   ├── Chi-square goodness-of-fit test
    │   └── Z-score per digit for pinpoint deviations
    │
    ├── 3. Anomaly Detection
    │   ├── Flag digits deviating > 2 standard deviations
    │   ├── Identify transaction clusters in anomalous ranges
    │   └── Time-based anomaly trends (monthly drift)
    │
    ├── 4. AI Forensic Investigation
    │   ├── Gemini analyzes flagged transactions
    │   ├── Pattern recognition in anomalous clusters
    │   ├── Cross-reference with audit trail
    │   └── Generate forensic narrative
    │
    └── 5. Tax Audit Report
        ├── Statistical evidence summary
        ├── Flagged transactions detail
        ├── AI forensic analysis
        ├── Risk classification (High/Medium/Low)
        └── Recommended actions
```

### 6.4 Integration Points

| Component | Integration | Purpose |
|-----------|------------|---------|
| `AnomalyDetection` | UI dashboard | Visual Benford distribution chart + deviation highlights |
| `services/gemini/compliance.ts` | AI analysis | Deep investigation of statistical anomalies |
| `services/admin/audit.ts` | Audit trail | Cross-reference anomalies with audit logs |
| `services/ledger/journal.ts` | Data source | Transaction amounts for analysis |
| `services/reports/financials.ts` | Report generation | Forensic audit report as PDF |

---

## 7. Document Upload & OCR Automation

### 7.1 Multi-Method Transaction Input

The `TransactionModal` / `TransactionDirectorModal` supports three input methods:

```
┌──────────────────────────────────────────────────────────┐
│              Add Transaction Modal                        │
│                                                          │
│  [Manual Entry]  [Upload Document]  [AI Accountant]     │
│       Tab 1           Tab 2              Tab 3           │
│                                                          │
│  Tab 2: Upload Document                                  │
│  ├── File selector (images, PDFs, spreadsheets)          │
│  ├── Cost Center dropdown (optional)                     │
│  └── Submit → AI processes document                      │
│                                                          │
│  Tab 3: AI Accountant                                    │
│  ├── Voice input (microphone button)                     │
│  ├── Text input (type naturally)                     │
│  ├── AI interprets and creates entry                     │
│  └── AI Review with voice playback                       │
└──────────────────────────────────────────────────────────┘
```

### 7.2 Document Processing Pipeline

```
Uploaded File (image/PDF/spreadsheet)
    │
    ├── 1. File Validation
    │   ├── Format check (JPEG, PNG, PDF, XLSX, CSV)
    │   ├── Size check (max 10MB)
    │   └── Malware scan
    │
    ├── 2. AI Vision Processing (Gemini Vision)
    │   ├── OCR: Extract all text from document
    │   ├── Field Identification: Locate amounts, dates, vendor names
    │   ├── Document Classification: Invoice, receipt, bill, contract, bank statement
    │   └── Data Extraction: Structured output with confidence scores
    │
    ├── 3. Data Enrichment
    │   ├── Vendor matching against existing records
    │   ├── Account code suggestion
    │   ├── Tax code determination
    │   └── Cost center assignment
    │
    ├── 4. Transaction Creation
    │   ├── Auto-populate transaction form
    │   ├── AI review and confidence scoring
    │   └── Route through approval workflow
    │
    └── 5. File Storage
        ├── Upload to Cloud Storage (tenants/{id}/documents/)
        ├── Link to journal entry
        └── Make available for future reference
```

---

## 8. Automation Guardrails

### 8.1 Safety Constraints

| Guardrail | Implementation | Purpose |
|-----------|---------------|---------|
| **Amount Threshold** | Auto-post only below configurable threshold | Prevent large unreviewed transactions |
| **Confidence Gate** | Auto-post only above 90% AI confidence | Ensure accuracy of autonomous decisions |
| **Balance Verification** | Debits must equal credits before any posting | Maintain double-entry integrity |
| **Duplicate Detection** | AI checks for similar existing entries | Prevent double-counting |
| **Period Lock** | No automated posts to closed periods | Maintain period integrity |
| **Approval Authority** | High-value items require human approval | Financial control |
| **Audit Trail** | All automated actions logged | Accountability and traceability |
| **Rollback Capability** | Automated entries can be reversed | Error recovery |

### 8.2 Automation Confidence Scoring

```typescript
interface AutomationConfidence {
  overall: number;              // 0-100 composite score
  classification: number;      // Account mapping confidence
  extraction: number;          // Data extraction confidence (OCR)
  balance: number;             // Entry balance confidence
  duplicate: number;           // Non-duplicate confidence
  businessRules: number;       // Rule compliance confidence
  recommendation: 'auto_post' | 'propose' | 'flag' | 'manual';
}
```

| Score Range | Action | Human Involvement |
|-------------|--------|-------------------|
| 90-100 | Auto-post | None (supervisory) |
| 75-89 | Propose for approval | Quick approve/reject |
| 50-74 | Flag for review | Detailed review required |
| 0-49 | Return to manual | Full manual entry |

---

## 9. Automation Metrics & Monitoring

### 9.1 Key Automation Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Auto-post rate | > 70% of transactions | Transactions auto-posted / total transactions |
| AI accuracy | > 98% | Correct classifications / total classifications |
| Processing time | < 3 seconds | End-to-end transaction capture to journal entry |
| False positive rate (anomaly) | < 5% | Flagged but normal / total flagged |
| Human override rate | < 10% | Overrides / AI proposals |
| Voice recognition accuracy | > 95% | Correct interpretations / voice inputs |
| Document extraction accuracy | > 90% | Correct fields / total extracted fields |

### 9.2 Automation Health Dashboard

The `SystemDiagnostics` component includes automation health monitoring:

- **Real-time processing volume** (transactions/hour)
- **AI confidence distribution** (histogram across all transactions)
- **Automation pipeline latency** (capture → post timing)
- **Exception queue depth** (items awaiting human review)
- **Benford's Law compliance trend** (monthly chart)
- **Voice processing success rate** (ASR accuracy over time)
