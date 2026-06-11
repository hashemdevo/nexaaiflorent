# AI & Gemini Architecture

## 1. Overview

The Gemini AI integration is a **first-class architectural pillar** of the platform, not an afterthought. With **45+ domain-specific modules**, the Gemini service layer represents the largest single subsystem in the codebase. It provides AI capabilities across every business function — from accounting and compliance to construction site management and surgical scheduling.

---

## 2. Service Architecture

```
┌─────────────────────────────────────────────────────┐
│                  geminiService.ts                    │
│              (Central Orchestrator)                  │
│  ┌─────────────────────────────────────────────┐    │
│  │  - API Key Management                       │    │
│  │  - Request Queue & Rate Limiting            │    │
│  │  - Response Caching                         │    │
│  │  - Error Handling & Retry Logic             │    │
│  │  - Context Window Management                │    │
│  │  - Token Budget Allocation                  │    │
│  └─────────────────────────────────────────────┘    │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │   Domain Module Router│
        │   (Dynamic Loading)   │
        └───────────┬───────────┘
                    │
    ┌───────┬───────┼───────┬───────┬───────┐
    │       │       │       │       │       │
┌───┴──┐┌───┴──┐┌───┴──┐┌───┴──┐┌───┴──┐┌───┴──┐
│accou-││compl-││const-││crm   ││educa-││finan-│
│nting ││iance ││ruct- ││      ││tion  ││ce    │
│.ts   ││.ts   ││ion.ts││.ts   ││.ts   ││.ts   │
└──────┘└──────┘└──────┘└──────┘└──────┘└──────┘
    │       │       │       │       │       │
  ...45+ domain modules total...
```

### 2.1 Central Orchestrator (`geminiService.ts`)

The central orchestrator manages all Gemini API interactions and provides:

- **API Key Rotation:** Manages multiple API keys with automatic rotation on rate limit hits
- **Request Queue:** Queues concurrent requests to stay within Gemini rate limits
- **Response Caching:** Caches AI responses for identical prompts (with TTL-based invalidation)
- **Retry Logic:** Exponential backoff with jitter for transient failures
- **Token Budget:** Tracks and allocates token budgets per client/tenant
- **Context Assembly:** Builds rich context windows from business data before API calls
- **Safety Filtering:** Pre-processes outputs to remove hallucinated financial figures or unsafe content

### 2.2 Domain Module Pattern

Each domain module follows a standardized interface:

```typescript
// Conceptual interface for all 45+ domain modules
interface GeminiDomainModule {
  domain: string;                    // e.g., 'construction', 'health', 'finance'
  systemPrompt: string;              // Domain-specific system instruction
  contextBuilder: (data: any) => string;  // Assembles business context
  responseParser: (response: string) => any;  // Parses AI output into structured data
  validators: Array<(output: any) => boolean>;  // Output validation chain
  fallbackBehavior: () => any;       // Graceful degradation when AI unavailable
}
```

---

## 3. Complete Domain Module Inventory

### 3.1 Financial Domain Modules

| Module | File | Purpose | Key Capabilities |
|--------|------|---------|-----------------|
| **Accounting** | `accounting.ts` | General accounting AI | Journal entry suggestions, reconciliation assistance, chart of accounts optimization |
| **Finance** | `finance.ts` | Financial analysis | Cash flow analysis, ratio interpretation, financial health assessment |
| **Forecasting** | `forecasting.ts` | Predictive finance | Revenue forecasting, expense prediction, budget variance analysis |
| **Investment** | `investment.ts` | Investment advisory | Portfolio analysis, risk-return assessment, allocation suggestions |
| **Banking** | *(via core finance)* | Banking insights | Transaction categorization, fraud detection signals, reconciliation matching |
| **Insurance** | `insurance.ts` | Insurance analysis | Claims processing assistance, premium optimization, coverage gap analysis |
| **Tax** | *(via accounting)* | Tax intelligence | Tax deduction discovery, compliance checking, filing preparation |
| **Risk** | `risk.ts` | Risk management | Risk assessment, mitigation strategies, exposure analysis |

### 3.2 Operations Domain Modules

| Module | File | Purpose |
|--------|------|---------|
| **Construction** | `construction.ts` | Construction project management, site safety, scheduling optimization |
| **Logistics** | `logistics.ts` | Fleet management, route optimization, supply chain analysis |
| **Manufacturing** | `manufacturing.ts` | Production planning, BOM optimization, quality control |
| **Maintenance** | `maintenance.ts` | Preventive maintenance scheduling, asset lifecycle management |
| **Procurement** | `procurement.ts` | Vendor evaluation, purchase optimization, contract analysis |
| **Quality** | `quality.ts` | Quality inspection assistance, defect analysis, compliance checking |
| **Retail** | `retail.ts` | Merchandising optimization, inventory recommendations, pricing strategy |
| **Hospitality** | `hospitality.ts` | Guest experience optimization, revenue management, staff scheduling |
| **Energy** | `energy.ts` | Energy management, sustainability reporting, efficiency optimization |

### 3.3 People & Services Domain Modules

| Module | File | Purpose |
|--------|------|---------|
| **HRM** | `hrm.ts` | HR assistance, performance review insights, leave optimization |
| **CRM** | `crm.ts` | Lead scoring, opportunity analysis, customer segmentation |
| **Customer Success** | `customer_success.ts` | Churn prediction, satisfaction analysis, engagement optimization |
| **Marketing** | `marketing.ts` | Campaign optimization, audience targeting, ROI analysis |
| **PR** | `pr.ts` | PR strategy, sentiment analysis, crisis communication |
| **Training** | `training.ts` | Training program design, skill gap analysis, curriculum optimization |
| **Communication** | `communication.ts` | Message drafting, tone optimization, channel selection |

### 3.4 Industry-Specific Domain Modules

| Module | File | Industry |
|--------|------|----------|
| **Health** | `health.ts` | Healthcare/Medical |
| **Agriculture** | `agriculture.ts` | Agriculture/Farming |
| **Education** | `education.ts` | Education/Training |
| **Entertainment** | `entertainment.ts` | Media/Entertainment |
| **Government** | `government.ts` | Government/Public Sector |
| **Legal** | `legal.ts` | Legal Services |
| **Real Estate** | `realestate.ts` | Real Estate/Property |
| **Telecom** | `telecom.ts` | Telecommunications |
| **Travel** | `travel.ts` | Travel/Tourism |
| **Franchise** | `franchise.ts` | Franchise Management |
| **Grants** | `grants.ts` | Grant Management |

### 3.5 Cross-Cutting Domain Modules

| Module | File | Purpose |
|--------|------|---------|
| **Core** | `core.ts` | Shared AI utilities, common prompt templates, cross-domain reasoning |
| **Data** | `data.ts` | Data analysis, statistical interpretation, visualization recommendations |
| **Compliance** | `compliance.ts` | Regulatory compliance checking, audit preparation |
| **Ethics** | `ethics.ts` | Ethical AI guardrails, bias detection, fairness assessment |
| **Security** | `security.ts` | Security posture analysis, vulnerability assessment |
| **Strategy** | `strategy.ts` | Strategic planning, competitive analysis, market positioning |
| **Sustainability** | `sustainability.ts` | ESG reporting, carbon footprint analysis, sustainability goals |
| **Reporting** | `reporting.ts` | Report generation, narrative construction, data storytelling |
| **Vision** | `vision.ts` | Computer vision capabilities, document OCR, image analysis |
| **Audio** | `audio.ts` | Audio processing, transcription, voice command interpretation |
| **Translation** | `translation.ts` | Multi-language support, localization, cultural adaptation |
| **UX** | `ux.ts` | UX optimization, accessibility analysis, user behavior insights |
| **Workflow** | `workflow.ts` | Workflow automation, process optimization, bottleneck detection |
| **Event** | `event.ts` | Event planning, scheduling optimization, resource allocation |
| **R&D** | `r&d.ts` | Research assistance, innovation tracking, patent analysis |
| **IT** | `it.ts` | IT infrastructure analysis, system health, DevOps insights |
| **Market** | `market.ts` | Market analysis, trend identification, competitive intelligence |

---

## 4. AI Integration Points

### 4.1 Frontend AI Components

| Component | Location | AI Feature |
|-----------|----------|------------|
| `AIInputForm` | `components/tools/transactions/` | AI-assisted transaction data entry |
| `AIReviewForm` | `components/tools/transactions/` | AI-powered transaction review and validation |
| `AIAlerts` | `components/dashboard/` | AI-generated alerts and notifications |
| `AIInsights` | `components/analytics/` | AI-powered analytics insights panel |
| `AnomalyDetection` | `components/insights/` | AI anomaly detection dashboard |
| `BankInsights` | `components/insights/` | AI banking transaction insights |
| `DynamicTrendChart` | `components/analytics/charts/` | AI-enhanced trend visualization |
| `ComposeMessage` | `components/tools/communication/` | AI-assisted message composition |
| `MessageTemplates` | `components/tools/communication/` | AI-generated message templates |
| `CashFlowForecastWidget` | `components/dashboard/` | AI cash flow forecasting |
| `SimulationLab` | `components/simulation/dashboard/` | AI simulation environment |
| `StrategicSandbox` | `components/simulation/dashboard/` | AI strategic planning sandbox |
| `VariableExplainer` | `components/simulation/dashboard/` | AI variable impact explanation |
| `SupportChat` | `components/support/` | AI-powered support chat |

### 4.2 Service Layer AI Integration

| Service | AI Enhancement |
|---------|---------------|
| `TransactionDirector` | AI suggests transaction classification and account mapping |
| `SearchEngine` | AI-enhanced semantic search beyond keyword matching |
| `ReportingEngine` | AI-generated report narratives and insights |
| `SimulationEngine` | AI parameter tuning and scenario generation |
| `CommunicationDispatcher` | AI channel selection and timing optimization |
| `ForecastingEngine` | AI-driven forecasting models |
| `BudgetManager` | AI budget variance analysis and recommendations |
| `ReconciliationService` | AI transaction matching and discrepancy detection |

---

## 5. Prompt Engineering Architecture

### 5.1 Prompt Composition Pipeline

```
1. Domain Module Selection
   └── Based on user context, industry, and task type

2. System Prompt Assembly
   └── Domain-specific system instructions + safety guardrails

3. Context Enrichment
   └── Business data injection (financials, transactions, KPIs)
   └── Industry-specific context (regulations, standards)
   └── Historical patterns (previous AI interactions)

4. User Prompt Construction
   └── Task specification + constraints + output format

5. Safety & Compliance Layer
   └── Ethics module review (ethics.ts)
   └── PII scrubbing from context
   └── Financial figure validation hooks

6. API Call
   └── Rate-limited, queued, cached check

7. Response Processing
   └── Domain-specific parser
   └── Validation chain
   └── Confidence scoring
   └── Fallback if low confidence
```

### 5.2 Context Window Strategy

The platform uses a **tiered context window** approach:

| Tier | Token Allocation | Content |
|------|-----------------|---------|
| **System** | ~2,000 tokens | Domain instructions, safety rules, output format |
| **Business Context** | ~3,000 tokens | Company profile, industry, recent KPIs |
| **Task Context** | ~2,000 tokens | Specific data relevant to current task |
| **Conversation History** | ~2,000 tokens | Recent relevant AI interactions |
| **Output Space** | ~1,000 tokens | Reserved for AI response generation |

### 5.3 Safety & Guardrails

The AI layer implements multiple safety mechanisms:

- **Financial Accuracy Guard:** AI-generated financial figures are flagged and must be verified before recording
- **PII Protection:** Personal identifiable information is scrubbed from prompts before API calls
- **Compliance Filter:** Outputs are checked against regulatory requirements per industry
- **Hallucination Detection:** Confidence scoring with automatic fallback when scores are low
- **Audit Trail:** All AI interactions are logged for compliance and quality monitoring
- **Rate Limiting:** Per-tenant token budgets prevent abuse and cost overruns

---

## 6. Caching Strategy

```
┌──────────────────────────────────────────────────┐
│                  AI Response Cache                │
│                                                  │
│  Key: hash(systemPrompt + contextHash + prompt)  │
│  TTL: Domain-dependent                           │
│    - Financial analysis: 15 minutes              │
│    - Forecasting: 1 hour                         │
│    - Communication: No cache (always fresh)      │
│    - Compliance: 24 hours                        │
│    - Strategy: 4 hours                           │
│                                                  │
│  Invalidation Triggers:                          │
│    - New transaction recorded                    │
│    - Financial period closed                     │
│    - Manual refresh by user                      │
│    - AI confidence score change                  │
└──────────────────────────────────────────────────┘
```

---

## 7. Cost Management

### 7.1 Token Budget Allocation

| Tier | Monthly Token Budget | Target Users |
|------|---------------------|--------------|
| **Free** | 50,000 tokens/month | Trial users |
| **Starter** | 500,000 tokens/month | Small businesses |
| **Professional** | 2,000,000 tokens/month | Growing businesses |
| **Enterprise** | Custom | Large organizations |

### 7.2 Cost Optimization Strategies

- **Prompt Compression:** Domain modules use optimized, concise system prompts
- **Response Caching:** Identical queries return cached results
- **Batch Processing:** Multiple related queries are batched into single API calls
- **Lazy Loading:** AI modules are loaded on-demand, not at app initialization
- **Fallback Chain:** Simple queries use smaller/cheaper models before escalating to full Gemini

---

## 8. Error Handling & Resilience

```
AI Request
    │
    ├── Try: Gemini API (primary)
    │   ├── Success → Parse & Validate → Return
    │   ├── Rate Limited → Queue with backoff → Retry
    │   ├── Timeout → Try: Cached response (if available)
    │   └── Error → Try: Domain fallback behavior
    │
    └── All Failed → Graceful degradation
        ├── UI: "AI suggestions unavailable"
        ├── Feature: Manual mode (still functional)
        └── Log: Error for monitoring
```

Each domain module provides a `fallbackBehavior()` that returns sensible defaults when AI is unavailable, ensuring the platform remains fully functional without AI assistance.

---

## 9. Nexa Smart Industry Copilot (Sector AI Analyst)

### 9.1 Overview

The Nexa Smart Industry Copilot is a unified AI interface that dynamically connects each industry vertical to its specialized Gemini automation service. Exposed through the `SectorAiAnalyst` component embedded in the main dashboard, it provides instant, industry-specific analysis with pre-filled demo data and real-time AI processing.

**Status: [x] COMPLETED — Fully integrated with 40+ sector specializations**

### 9.2 Component Architecture

| Element | Implementation |
|---------|---------------|
| **UI Component** | `components/dashboard/SectorAiAnalyst.tsx` |
| **Integration Point** | Embedded in `components/Dashboard.tsx` under the title "Nexa Smart Industry Copilot for 40+ Sectors" |
| **Industry Context** | Dynamically reads `currentUserIndustry` from `AppContext` |
| **Industry Selector** | Dropdown populated from active user industry + all available industries |
| **Input Form** | Auto-generated fields based on selected sector with pre-filled demo data |
| **Results Panel** | Structured AI output with tables, metrics, risk assessment, and voice playback |

### 9.3 Sector-to-Service Mapping (Operational)

| Sector | Gemini Service Method | AI Function | Status |
|--------|----------------------|-------------|--------|
| **Construction** | `Gemini.Construction.analyzeDailyReport` | Analyze daily site reports, detect risks, safety incidents, resource delays, generate financial executive summary for concrete/structural work | [x] Live |
| **Retail** | `Gemini.Retail.analyzeMarketBasket` | Market basket analysis, purchase pattern prediction, shelf placement suggestions with confidence ratios | [x] Live |
| **Medical/Hospital** | `Gemini.Health.analyzeWellnessData` | Crew & operations audit, department health metrics, precision wellness initiative recommendations | [x] Live |
| **Legal** | `Gemini.Legal.analyzeContract` | Extract contract parties, legal amounts, effective dates, penalty schedule, risk classification | [x] Live |
| **Education** | `Gemini.Education.createLessonPlan` | Generate developmental plans with minute-level scheduling and assessment seasons | [x] Live |
| **Logistics** | `Gemini.Logistics.getHarmonizedCode` | Predict HS Code (Harmonized System), customs description for international trade | [x] Live |
| **Restaurant/Hospitality** | `Gemini.Hospitality.suggestDynamicPricing` | Dynamic pricing model, seat revenue calculation based on occupancy and events | [x] Live |
| **Generic/Accounting** | `Gemini.Finance.analyzeComplianceRisk` | Forensic accounting audit, detect tax/operational/regulatory risks in journal entries | [x] Live |

### 9.4 Data Flow

```
User selects sector in SectorAiAnalyst
    │
    ├── Load industry-specific input form (pre-filled demo data)
    │
    ├── User reviews/modifies input → Click "Analyze"
    │
    ├── SectorAiAnalyst calls Gemini domain service
    │   └── Method varies by sector (see mapping table above)
    │
    ├── Gemini processes with domain-specific prompt
    │
    ├── Response parsed into structured format
    │   ├── Risk assessment
    │   ├── Metrics & recommendations
    │   └── Natural language summary
    │
    └── Results displayed + TTS playback available
```

---

## 10. Voice AI & TTS (Text-to-Speech)

### 10.1 Gemini TTS Integration

**Status: [x] COMPLETED — Fully integrated with AIReviewForm voice playback**

The platform integrates Gemini's `gemini-3.1-flash-tts-preview` model for high-fidelity text-to-speech narration of financial analyses and journal entries.

| Component | File | Purpose |
|-----------|------|---------|
| **Audio Service** | `services/gemini/audio.ts` | Core TTS service with `speakText(text)` function |
| **Voice Playback Button** | Integrated in `AIReviewForm.tsx` | Volume icon button for reading AI analysis aloud |
| **Sector AI Playback** | Integrated in `SectorAiAnalyst.tsx` | Play button for industry analysis narration |

### 10.2 TTS Processing Pipeline

```
Text content (analysis / journal entry / report)
    │
    ├── speakText(text) called in audio.ts
    │
    ├── Gemini API call to gemini-3.1-flash-tts-preview
    │   └── System prompt: "Professional financial narrator"
    │
    ├── Response: Base64-encoded audio bytes (WAV format)
    │
    ├── Decode Base64 → ArrayBuffer
    │
    ├── Web Audio API: AudioContext.decodeAudioData()
    │
    └── Play through browser speakers
        └── Visual feedback: animate-pulse on volume icon
```

### 10.3 Voice Input (STT)

Voice input is available through the AI Accountant tab in the `TransactionDirectorModal`:

| Feature | Implementation |
|---------|---------------|
| **Audio Capture** | Browser MediaRecorder API → WebM/Opus stream |
| **Speech Recognition** | Web Speech API (browser-native) or Gemini Audio API |
| **Text Processing** | Number/currency/date normalization |
| **Intent Parsing** | Gemini NLP extracts structured transaction data |
| **Entry Creation** | Parsed data → AI Accountant → Journal Entry proposal |

See [Voice AI & TTS Architecture](./PROJECT_ARCHITECTURE_Voice_AI.md) for complete voice system design.

---

## 11. Anomaly Forensic Audit (Benford's Law)

### 11.1 Overview

**Status: [x] COMPLETED — Fully integrated in Forensic Lab**

The Anomaly Forensic Audit engine applies Benford's Law statistical analysis to detect financial irregularities, fraud patterns, and data manipulation. Combined with Gemini AI for deep investigation, it provides instant tax audit reports.

### 11.2 Benford's Law Implementation

```typescript
// Expected first-digit distribution per Benford's Law
const benfordExpected = {
  '1': 30.1%, '2': 17.6%, '3': 12.5%, '4': 9.7%,
  '5': 7.9%,  '6': 6.7%,  '7': 5.8%,  '8': 5.1%, '9': 4.6%
};

// Analysis: Compare transaction amounts against expected distribution
// → Chi-square goodness-of-fit test
// → Z-score per digit for pinpoint deviations
// → AI deep investigation of anomalous clusters
```

### 11.3 Integration Points

| Component | Role |
|-----------|------|
| `AnomalyDetection` | Visual Benford distribution chart + deviation highlights |
| `Gemini.Compliance.analyzeComplianceRisk` | AI forensic investigation of statistical anomalies |
| `services/admin/audit.ts` | Cross-reference anomalies with audit trail |
| `services/ledger/journal.ts` | Transaction amounts for statistical analysis |

See [Automation Architecture](./PROJECT_ARCHITECTURE_Automation.md) for the complete Benford's Law pipeline design.

---

## 12. AI Model Configuration

### 12.1 Active Gemini Models

| Model | Use Case | Status |
|-------|----------|--------|
| **gemini-2.5-flash** | Transaction analysis, risk calculation, penalty clauses | [x] Active |
| **gemini-3.1-flash-tts-preview** | Text-to-speech narration of analyses and entries | [x] Active |
| **Gemini Vision** | Document OCR, receipt/invoice extraction | [x] Active |
| **Gemini Pro** | Deep forensic analysis, complex compliance queries | Planned |

### 12.2 Model Selection Logic

```typescript
function selectModel(task: AITask): GeminiModel {
  switch (task.type) {
    case 'tts': return 'gemini-3.1-flash-tts-preview';
    case 'vision': return 'gemini-vision';
    case 'quick_analysis': return 'gemini-2.5-flash';
    case 'deep_investigation': return 'gemini-pro';
    default: return 'gemini-2.5-flash';
  }
}
```
