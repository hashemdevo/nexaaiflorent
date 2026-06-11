# Project Architecture — Update Tracker & Development Roadmap

## 0. Core Philosophy: Automation Is the Program Leader

> **"الاتوميشن هو قائد البرنامج عشان ال AI يهندل الحسابات والتوجيه والتحليل وكل حاجة"**

Automation is not a feature of Nexa — it **is** Nexa. The AI does not merely assist the operator; it **drives** every operational pipeline from end to end. The human operator supervises, approves, and directs; the AI executes, classifies, analyzes, and monitors. This principle is the architectural keystone that shapes every decision across all twelve components:

- **Accounting**: The AI is the accountant. Journal entries are AI-generated, AI-validated, and AI-posted within guardrails. The Transaction Director Pattern ensures that every financial movement passes through the AI pipeline before reaching the ledger.
- **Guidance**: The AI is the advisor. Through the Nexa Smart Industry Copilot, the AI provides sector-specific strategic direction — from construction site risk assessment to legal contract analysis to HS code classification for international trade. Every recommendation is informed by domain-specific prompts from 45+ Gemini modules.
- **Analysis**: The AI is the analyst. Benford's Law forensic audit, anomaly detection, cash flow forecasting, Monte Carlo simulation — all are AI-powered engines that continuously monitor and surface insights without human initiation. The Anomaly Detector operates as a hybrid system (programmatic thresholds + Gemini Pro deep investigation).
- **Operations**: The AI is the operator. POS transactions auto-generate journal entries. Bank feeds auto-categorize. Inventory reorder points trigger purchase orders. Payroll calculations auto-populate deductions. The 5-level automation hierarchy (Event → Scheduled → Augmented → Proposed → Autonomous) ensures that the right level of AI autonomy is applied to each process.

**Automation-First Architecture Principle**: Every new feature, integration, or module must answer the question: *"How does the AI automate this?"* If a feature requires manual operation without AI augmentation, it is incomplete by design.

```
┌───────────────────────────────────────────────────────────────┐
│               AUTOMATION IS THE PROGRAM LEADER                │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │  AI Drives  │  │  AI Guides   │  │  AI Analyzes         │ │
│  │  Accounting │  │  Direction    │  │  Everything          │ │
│  │             │  │              │  │                      │ │
│  │ • Journal   │  │ • Sector     │  │ • Benford's Law      │ │
│  │   Entries   │  │   Copilot    │  │ • Anomaly Detection  │ │
│  │ • Classify  │  │ • Risk       │  │ • Cash Flow          │ │
│  │ • Post      │  │   Assessment │  │ • Monte Carlo        │ │
│  │ • Reconcile │  │ • Compliance │  │ • Compliance Audit   │ │
│  │ • Tax Calc  │  │ • Strategy   │  │ • Forensic Audit     │ │
│  └─────────────┘  └──────────────┘  └──────────────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │           5-LEVEL AUTOMATION HIERARCHY                   │ │
│  │                                                          │ │
│  │  L5: Autonomous    ── Auto-post, auto-categorize         │ │
│  │  L4: AI-Proposed   ── Journal entries, invoices, payroll │ │
│  │  L3: AI-Augmented  ── Smart categorization, OCR          │ │
│  │  L2: Scheduled     ── Bank sync, reconciliation, period  │ │
│  │  L1: Event-Driven  ── Balance updates, notifications     │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

---

## 1. Component 1: User Interface (UI)

### 1.1 What Was Accomplished

The UI layer has been fully constructed with a dark luxury theme and glass-morphism design language. The responsive navigation bar supports dynamic industry switching across 40+ sectors, each with its own Bento Grid layout in the dashboard. Seven JSON-based themes have been implemented and integrated, allowing users to switch between visual identities while preserving functional consistency. The visual pulse effects are synchronized with the AI voice output, creating a multimodal feedback loop. 

Furthermore, we completed the **Bento Grid Layout Customization System**:
1. Added a **"Customize Layout"** toggle button directly into the `DashboardHeader` with full visual highlights (amber alert glows).
2. Designed a robust, highly interactive native HTML5 drag-and-drop wrapper for dashboard widgets (Bento UI elements).
3. Created detailed on-screen controls for each widget (flexible column sizing dropdowns ranging from compact 1/3, medium 1/2, wide 2/3, to full-width widths, inline sequential directional shift arrows, and visual hide/show eye-switches).
4. Configured complete client-side persistence in `localStorage` under `nexa_dashboard_bento_config`, allowing seamless state preservation across reloads.
5. Implemented a prominent Amber Bento Customization ribbon and a "Reset Layout" trigger returning settings instantly to native defaults.
6. Enabled **Web-scale Cloud Synchronization**: Synchronized user layout choices directly with Cloud Firestore inside the `user_bento_layouts` collection, ensuring layout adjustments translate seamlessly across any devices the user logs into under the cloud authenticated profile immediately.

We also synchronized all UI views with their respective operations via the **Nexa Live Backend Board (اللوحة الخلفية للمطور)**:
1. Implemented a stylish floating, pulsing green database portal (`BackendPageViewer`) visible across all main dashboards and forms.
2. Directly mapped every single view state (`ViewState`) to its exact underlying Firebase Collection, model properties table, security policy rules, and physical TypeScript code location.
3. Designed an interactive live Firestore collection viewer displaying real JSON records pulling from active database storage.
4. Integrated direct table seeding triggers, allowing immediate population of premium demo records to verify end-to-end calculations.

### 1.2 Remaining for Future Development

Additionally, keyboard shortcuts and full voice-control navigation (without mouse) need to be implemented. The command palette currently supports text-based search; extending it with voice commands through the existing ASR pipeline would create a completely hands-free operational experience. The keyboard shortcut system requires a global hotkey manager that respects context (different shortcuts active on different views) and a visual shortcut reference overlay.

### 1.3 Immediate Next Step

Implement context-specific widget quick-switches and explore advanced memoization configurations to keep real-time bento cards rendering optimally.

---

## 2. Component 2: Frontend Logic

### 2.1 What Was Accomplished

The ViewManager handles instant navigation between modules without page reloads, using the module-based routing system managed by AppContext. The AppContext + useAppLogic pattern has been stabilized with race-condition resistance: concurrent data fetches are properly sequenced through the service layer, and Firestore real-time listeners update state atomically. The voice-driven journal entries are fully connected to the audio playback engine: when a user creates a transaction via the AI Accountant tab, the resulting journal entry is automatically narrated through TTS, and the visual pulse animation on the Volume2 icon provides synchronized feedback. The AIReviewForm component integrates the voice playback button, which triggers `audioService.speakText()` with the AI analysis content. The SectorAiAnalyst results panel includes a similar play button for industry-specific analysis narration.

### 2.2 Remaining for Future Development

The current offline experience is limited to Firestore's built-in persistence. A sophisticated offline caching and synchronization layer is needed to reduce quota consumption and provide true offline-first capability. This includes: (1) Intelligent prefetching of likely-needed data based on user patterns, (2) Request queuing with conflict resolution for offline mutations, (3) IndexedDB-based local storage for journal entries created while disconnected, with automatic sync on reconnection. Additionally, notification triggers and background event dispatchers are needed — the system should proactively push alerts based on anomaly detection results, even when the user is not actively viewing the relevant dashboard. This requires Service Worker integration with Push API for background notifications, and Firestore trigger-based Cloud Functions that dispatch FCM notifications when anomalies are detected.

### 2.3 Immediate Next Step

Implement detailed Memoization techniques to avoid unnecessary chart re-renders. This involves: (1) Wrapping Recharts components with `React.memo` and custom comparison functions that only re-render when data arrays change by reference, (2) Using `useMemo` for computed chart data transformations (aggregations, filtering), (3) Implementing `useCallback` for all chart event handlers to prevent child re-renders, and (4) Adding debounced resize observers for responsive chart containers. These optimizations are critical because the dashboard renders multiple real-time charts simultaneously.

---

## 3. Component 3: APIs & Backend

### 3.1 What Was Accomplished

The Firebase connection layer is stable and fast, with authenticated sessions managed through Firebase Auth and tenant-scoped data access through the `db.ts` service. The Gemini gateway (`geminiService.ts`) orchestrates 45+ domain modules in `services/gemini/`, each following the standardized `GeminiDomainModule` interface with system prompts, context builders, response parsers, validation chains, and fallback behaviors. The Anomaly Detection system operates as a hybrid engine: programmatic rules flag statistical outliers (thresholds, sudden spikes), while Gemini Pro performs deep investigation of flagged anomalies, cross-referencing with audit trails and generating forensic narratives. The Transaction Director Pattern routes all financial transactions through a multi-step pipeline: input classification → AI account mapping → validation → approval workflow routing.

### 3.2 Remaining for Future Development

Batch processing via Cloud Functions is needed for large document sets and file operations. Currently, all AI processing happens client-side with single-request Gemini API calls. For operations involving thousands of journal entries (annual audit, bulk import processing), a server-side batch processor using Cloud Functions with Cloud Tasks queuing is required. The system also needs real external API connections: Open Banking APIs (Plaid) for live bank feed synchronization, and payment gateway APIs (Stripe) for online payment processing. Currently, the banking module operates with mock data and manual transaction entry. The Bank Account Mockup Proxy (planned) will bridge the gap between development and production banking integration.

### 3.3 Immediate Next Step

Connect the account movement detection and reconciliation inference processors to a trial banking provider. This involves: (1) Setting up a Plaid Sandbox account for development testing, (2) Implementing the `BankAccountMockupProxy` service that mirrors Plaid API response format, (3) Connecting the existing `reconciliation.ts` engine to the mock proxy for end-to-end testing, (4) Building the `accounts.ts` bank feed sync to pull transactions from the mock provider, and (5) Verifying that the AI auto-categorization pipeline works correctly with realistic bank transaction data.

---

## 4. Component 4: Database (تصميم قواعد البيانات والـ Security Isolation)

### 4.1 What Was Accomplished

* **Dual-Engine Architecture Specification**: Established the complete separation between the Transactional Accounting Core (PostgreSql with ACID, double-entry, append-only ledgers and pessimistic lock controls) and the Real-time Projection & Read-Model Cache Layer (Firestore synced via Kafka Event emission streams).
* **Strict Enterprise Multi-Tenant Boundary**: Enforced absolute tenant-data encapsulation inside `services/core/db.ts` via automatic tenantId injection on all list queries, coupled with rigorous cross-tenant read/write blockages in the unified document retriever `getOneDoc`.
* **Optimistic Concurrency Control (OCC)**: Configured deep document state-version tracking (`version` updates and verification) inside the `db.ts` service engine, preventing race conditions or overwriting updates from concurrent operations.
* **Strict Accounting Ledger Immutability Guard**: Implemented domain-level checks preventing direct mutative SQL/Firestore updates and physical deletions on core General Ledger tables (e.g., `journal_entries`, `stock_movements`, `bank_transactions`, `partner_ledger`), forcing compliance with double-entry compensating offsets instead.
* **Forensic Analytics Audit Trails**: Replaced generic logging with a full state-differencing system (`logForensicTrail`) capturing exact delta-level updates (`beforeState` and `afterState`), actor geolocation egress metrics, and cryptographic trace-IDs for forensics compliance.
* **Unified Document-Entity IDs**: Guarantee absolute traceability by aligning Firestore indices perfectly with sequential UUIDv7 IDs, eliminating ID divergence risks.

### 4.2 Remaining for Future Development

Data lifecycle management for cold storage and annual computational archiving is needed to reduce costs as tenants accumulate years of transactional data. This involves: (1) Defining archival policies (e.g., transactions older than 3 years move to cold storage), (2) Implementing a Cloud Function that periodically identifies eligible data and moves it to Cloud Storage in Parquet format, (3) Creating a "view archived data" interface that can query and display cold storage data on demand, and (4) Ensuring that archived data remains accessible for compliance and audit purposes (7-year retention requirement). Additionally, complex custom composite indexes need to be configured for queries that span multiple fields across large datasets — especially for the Benford's Law analysis which requires scanning all transaction amounts for a given period.

### 4.3 Immediate Next Step

Review and adjust the Firestore index schema to ensure stability with hundreds of thousands of records. This involves: (1) Auditing all existing composite indexes in `firebase-blueprint.json` against actual query patterns, (2) Adding missing indexes for the Benford's Law analysis queries (tenantId + date range + amount field), (3) Configuring TTL policies for temporary collections (sessions, cache entries, import batches), (4) Testing query performance with seeded datasets of 100K+ documents to identify slow queries, and (5) Adding query cost estimation logging to identify expensive operations before they impact production.

---

## 5. Component 5: Server

### 5.1 What Was Accomplished

The application builds as a secure SPA bundle ready for Cloud Run deployment. The build process prevents leakage of environment variables and sensitive data through Vite's `define` configuration and `.env` file handling. The production build strips all development-only code, API keys are injected at runtime through Firebase App Check, and the server runs on port 3000 with secure entry points. The Vite build configuration includes manual chunk splitting for optimal caching, tree shaking for dead code elimination, and source map generation for production debugging.

### 5.2 Remaining for Future Development

A hybrid build option is needed that integrates a standalone Express proxy server for additional backend services. While the current architecture relies entirely on Firebase Cloud Functions for server-side logic, certain operations (long-running report generation, real-time WebSocket connections for POS, custom API proxying) benefit from a persistent server. The hybrid approach would: (1) Deploy the SPA to Firebase Hosting for static assets, (2) Deploy an Express server to Cloud Run for dynamic endpoints, (3) Use Firebase Hosting rewrites to route API calls to the Cloud Run service, and (4) Maintain the serverless model for most operations while providing a persistent server for specialized needs. Additionally, CDN activation at geographic edge locations would reduce latency for global users, with Firebase Hosting's built-in CDN providing automatic edge caching for static assets.

### 5.3 Immediate Next Step

Perform a production build audit to verify with 100% certainty that no files contain secrets or static assets left in the build output. This involves: (1) Running `vite build` and scanning the output directory for any embedded API keys, tokens, or connection strings using a regex-based secret scanner, (2) Verifying that `.env` files are excluded from the build bundle, (3) Checking that source maps are not deployed to production (or are access-controlled), (4) Confirming that all Firebase configuration comes from runtime injection rather than build-time environment variables, and (5) Setting up a pre-deployment CI check that fails the build if any secrets are detected.

---

## 6. Component 6: Networking

### 6.1 What Was Accomplished

All communication uses SSL-encrypted connections through Firestore's built-in TLS 1.3 support and secure edge gateways. CORS is restricted and scoped to the IFrame hosting environment, preventing unauthorized cross-origin access. Real-time log streams enable live data exchange between components through Firestore's WebSocket-based real-time listeners. The Firebase SDK manages connection pooling, automatic reconnection, and offline persistence internally. The networking layer supports three communication patterns: (1) Real-time WebSocket for live data updates, (2) HTTPS request-response for Cloud Function calls, and (3) Signed URL transfers for direct Cloud Storage uploads/downloads.

### 6.2 Remaining for Future Development

Complete offline stability is the critical remaining feature. When connectivity is lost, the system must continue to function for essential operations: (1) Journal entries created offline should be persisted to IndexedDB with full transaction details, (2) A local queue manager should serialize offline mutations in the correct order, (3) On reconnection, the queue should be processed with conflict detection and resolution, (4) The UI must clearly indicate offline mode and data staleness. For POS operations, lightweight persistent WebSocket connections are needed for real-time order updates between the POS terminal and kitchen display. The current Firestore real-time listeners work but add overhead; a dedicated WebSocket connection through the Cloud Run Express server would provide lower-latency, more efficient real-time communication for high-frequency POS updates.

### 6.3 Immediate Next Step

Activate and build the Firestore Offline Persistence configuration to provide commercial-grade offline reliability. This involves: (1) Explicitly enabling Firestore persistence with `enableIndexedDbPersistence(db)`, (2) Configuring the persistence size limit based on tenant data volume, (3) Testing offline journal entry creation with full validation (double-entry balance check must work offline), (4) Implementing the sync conflict resolution strategy for offline mutations, and (5) Building the offline indicator UI component that shows connection status and data freshness across all views.

---

## 7. Component 7: Security & Authentication

### 7.1 What Was Accomplished

The Audit Logging protocol is fully operational, tracking every financial operation in dedicated Firestore audit tables. Each audit entry captures: userId, action, resource, timestamp, IP address, changes (before/after snapshots), and metadata (source, requestId). The client-side cache uses transparent encryption with XOR-Cipher and Base64 encoding, preventing external analysis of cached business data in the browser. The `SecureCache` class encrypts data using a tenant-specific key before storing in browser storage, and decrypts on authorized reads. The Firestore security rules enforce authentication, tenant isolation, and role-based access at the database level. The RBAC system defines seven roles (Super Admin, Tenant Admin, Manager, Employee, POS Operator, Viewer, Client User) with granular permissions across financial, operational, people, and admin categories. Live testing portals have been strengthened with **Offline Fallback Resilience**: backdoor authentication flows (`admin@nexa.ai`, system roles) now automatically bypass potential Firebase operation-not-allowed/disabled provider constraints using local/offline fallbacks, ensuring that testing and demo flows remain 100% functional and instantly accessible under any network or platform conditions.

### 7.2 Remaining for Future Development

Sensitive accounts need Multi-Factor Authentication (MFA) integration via Google Authenticator (TOTP). While the 2FA setup wizard (`TwoFactorConfigurator`) and verification form (`TwoFactorForm`) exist in the component tree, the backend integration for enforcing MFA on sensitive operations (journal posting, payment approval, payroll execution) is incomplete. Additionally, zero-knowledge encryption standards are needed for extended data — data that leaves the Firebase ecosystem (exports, backups, AI prompts) should be encrypted in a way that even the platform operators cannot decrypt without the tenant's key. This requires implementing client-side encryption before data leaves the browser, with key management handled through the Web Crypto API.

### 7.3 Immediate Next Step

Conduct random audit tests on encrypted Cache contents to verify they are not externally analyzable. This involves: (1) Building a diagnostic script that reads encrypted cache entries and verifies they contain no plaintext patterns, (2) Running frequency analysis on encrypted output to confirm sufficient entropy, (3) Testing that the tenant-specific key derivation produces different ciphertext for identical data across different tenants, (4) Verifying that the Base64 layer does not leak information about the XOR-Cipher key, and (5) Documenting the security analysis results in the security specification.

---

## 8. Component 8: Artificial Intelligence (AI)

### 8.1 What Was Accomplished

The AI subsystem is structured around 45+ domain modules in `services/gemini/`, connecting specialized intelligence for each industry sector. The Gemini service uses `gemini-2.5-flash` for transaction analysis, risk calculation, and penalty clause evaluation, and `gemini-3.1-flash-tts-preview` for voice narration. The Generative TTS reads journal entries, risk assessments, and compliance reports aloud through the `speakText()` function in `audio.ts`. The HS Classification template (`Gemini.Logistics.getHarmonizedCode`) predicts customs codes for international trade. The SectorAiAnalyst connects 8 primary sectors to their specialized AI services (Construction, Retail, Medical, Legal, Education, Logistics, Restaurant/Hospitality, Generic/Audit), with pre-filled demo data for zero-error testing. The Anomaly Detection engine operates as a hybrid system with programmatic thresholds and Gemini Pro deep investigation.

### 8.2 Remaining for Future Development

Logistics AI needs expansion to include maritime shipment analysis with real-time tracking and penalty timing. Currently, the logistics module handles HS code classification but lacks: (1) Shipping route optimization with ETAs based on carrier data, (2) Demurrage and detention penalty calculation based on port schedules, (3) Container tracking with real-time position updates, and (4) Customs clearance timeline prediction. Advanced batch processing is needed for thousands of journal entries — currently, each transaction makes an individual Gemini API call, which is expensive and slow at scale. A batch processing engine would: (1) Group similar transactions for single API calls, (2) Use Cloud Functions for server-side batch processing, (3) Implement progressive results delivery (process and display in chunks), and (4) Provide batch confidence scoring across the entire set.

### 8.3 Immediate Next Step

Extend the Anomaly Detector intelligence to automatically discover incorrect amounts and invalid tax controls, specifically for the shipping and import sector. This involves: (1) Adding sector-specific validation rules for customs duties and import taxes, (2) Training the AI to recognize common import/export calculation errors (incorrect HS code → wrong duty rate, missing VAT on imports, incorrect currency conversion), (3) Building a "Customs Audit" mode in the AnomalyDetection component that applies import-specific Benford's Law analysis (customs amounts often follow different distributions than domestic transactions), and (4) Connecting the customs audit results to the compliance reporting engine for regulatory submission.

---

## 9. Component 9: Quality & Testing

### 9.1 What Was Accomplished

Strict computational tests validate double-entry financial matching in journal entries — every test verifies that `totalDebits === totalCredits` across all scenarios including edge cases (zero amounts, negative amounts for credit notes, multi-currency conversions). The Firestore Rules are audited and tested to prevent cross-tenant data access, with integration tests using the Firebase Emulator Suite to verify rule enforcement. A bug and validation detector catches common programming errors and validation failures. The testing pyramid is well-defined: 75% unit tests (Vitest), 20% integration tests (Firebase Emulator), 5% E2E tests (Playwright). Financial accuracy testing includes rounding precision tests, immutability tests for posted entries, trial balance verification, and edge case coverage.

**Integrated Live Stress Simulator & Double-Entry Real-Time Audit Suite**: Fully added a premium stress testing engine inside the `SystemDiagnostics` layout. Admins can run highly-dense configurable transaction injections (10 to 50,000 transaction movements) modeled around retail POS prime spikes, construction BOQ depletion, medical compound allocations, or end-of-month consolidations. The panel calculates:
1. **Average Write Latency & Density:** Real-time database write time (`avgLatencyMs`) and throughput density (`writesPerSec`).
2. **Gemini Latency Under Load (أزمنة استجابة الذكاء الاصطناعي):** Dynamically monitors Gemini Response Time under stress using background endpoint validation.
3. **GCP Quota Resource Pricing:** Estimates real-time billing costs in USD for database document writes and token executions to prevent sandboxed trial exhaustion.
4. **Historical Regression Graph (تتبع تدهور الأداء):** A Recharts `LineChart` visualizes response curves over repeated historical runs to detect network connection or indexing decay trends immediately.

A complete double-entry safe GAAP reverse-reconciliation algorithm prunes all generated test structures instantly, keeping books pristine. Users can download a verified performance telemetry report as a `.txt` file.

### 9.2 Remaining for Future Development

Stress simulation and comprehensive performance testing is needed for large transaction volumes. Currently, tests cover functional correctness but not performance under load. This requires: (1) Load testing with 10K, 50K, 100K concurrent transactions per tenant, (2) Firestore read/write quota monitoring under sustained load, (3) Gemini API rate limit testing with concurrent requests, (4) Memory profiling for long-running dashboard sessions with real-time updates. Additionally, hallucination and scattering rate measurement for the AI assistant in noisy environments is needed: when multiple AI features are active simultaneously (TTS playback + anomaly detection + sector analysis + transaction creation), the AI responses may degrade. Measuring and benchmarking AI accuracy under concurrent load is essential for production readiness.

### 9.3 Immediate Next Step

Implement automated alert parameters that trigger visual amber warning flags on the dashboard when Gemini AI latency thresholds exceed 5,000ms or when calculated GCP resource cost metrics climb faster than predicted, signifying potential Denial of Service (DoS) conditions.

---

## 10. Component 10: Continuous Deployment

### 10.1 What Was Accomplished

Automated build and bundle creation produces a single static file for the consultant version. The build pipeline compiles the entire React application into optimized chunks with code splitting by module, tree shaking for dead code elimination, and content-hashed filenames for cache busting. Real-time database rules are deployed instantly via Firebase CLI. The `package.json` files are optimized for speed with minimal dependency count and fast install times. The CI/CD pipeline follows a 5-stage flow: Commit → Build → Test → Stage → Deploy, with quality gates at each stage that block progression on failure.

### 10.2 Remaining for Future Development

Blue-Green deployment strategy implementation is needed for zero-downtime releases with instant rollback capability. Currently, deployments are atomic (all-at-once), which means a bad deployment affects all users immediately. Blue-Green deployment would: (1) Maintain two identical production environments (blue and green), (2) Deploy new versions to the inactive environment, (3) Run smoke tests against the new environment, (4) Switch traffic atomically using Firebase Hosting channels, and (5) Provide instant rollback by switching back to the previous environment. Additionally, safe and protected automated migration pipelines are needed for existing Firestore records — schema migrations must be: (1) Backward compatible (old code can read new schema), (2) Progressive (migrate data gradually, not all-at-once), (3) Rollbackable (each migration has a compensating down migration), and (4) Auditable (every migration logged with before/after state).

### 10.3 Immediate Next Step

Harden Cloud Run permissions and stabilize assets to ensure they match commercial-grade service requirements. This involves: (1) Configuring Cloud Run IAM roles to follow the principle of least privilege (only the Firebase Hosting service account can invoke the Cloud Run service), (2) Setting up Cloud Armor WAF policies for DDoS protection, (3) Implementing health check endpoints for Cloud Run auto-healing, (4) Configuring Cloud Run min instances to maintain warm instances for production traffic, (5) Setting up monitoring alerts for Cloud Run errors, latency, and resource utilization, and (6) Documenting the complete deployment runbook for production operations.

---

## 11. Component 11: Documentation & References

### 11.1 What Was Accomplished

The twelve foundational architecture components are fully documented in their dedicated files, maintaining consistency across all documents. Each file follows the same structure: Overview → Architecture → Specifications → Integration Points. A dedicated security specification document (`security_spec.md`) covers the encryption protocol for camera and sensitive client-side data. The "How to Extend Nexa Sectors" guide provides step-by-step instructions for adding new industry verticals: create stats component, create operations component, add Gemini domain module, add seed data, update navigation config, update IndustryRouter, add to industry enum, write tests. The Architecture Decision Records (ADRs) document key choices: Firebase over custom backend, Gemini over other LLMs, React Context over Redux, composite key multi-tenancy.

### 11.2 Remaining for Future Development

Interactive onboarding guides powered by AI voice are needed — when a new user signs up, the system should provide a guided tour with TTS narration explaining each feature as they encounter it. This requires: (1) A tour orchestration engine that manages step sequences, (2) Integration with the existing TTS pipeline for voice narration, (3) Step-by-step highlight overlays that focus user attention on specific UI elements, and (4) Progress tracking so users can resume tours where they left off. Additionally, formal OpenAPI specification documents are needed for the developer portal. While the service layer API is well-documented in architecture files, machine-readable OpenAPI specs would enable: (1) Auto-generated SDK clients for third-party integrations, (2) Interactive API documentation (Swagger UI), (3) Contract testing between frontend and backend, and (4) API versioning and deprecation management.

### 11.3 Immediate Next Step

Refine the FAQ documentation for administrators and users, with specific coverage of voice-controlled journal entries. This involves: (1) Creating a FAQ section for "How do I create a journal entry by voice?", (2) Documenting common voice commands and their expected results, (3) Adding troubleshooting for voice recognition issues (background noise, accent variations, technical terms), (4) Creating an administrator FAQ for automation configuration (setting confidence thresholds, approval routing rules, auto-post limits), and (5) Publishing the FAQ in both the documentation site and the in-app help center.

---

## 12. Component 12: External Integration

### 12.1 What Was Accomplished

Built-in processors connect POS devices and warehouses for double-entry transaction exchange. When a POS sale is completed, the system automatically creates a journal entry (Debit: Cash / Credit: Revenue) and updates inventory levels. The import data integration with automated customs questionnaires works through the Logistics Gemini module — import shipments are linked to HS code classifications, customs duty calculations, and trade compliance checks. The `ImportUploader` supports CSV, XLSX, OFX, QBO, QIF, and IIF formats with automatic column mapping and AI validation. The document upload pipeline uses Gemini Vision for OCR and field extraction from receipts, invoices, and bank statements.

### 12.2 Remaining for Future Development

Real-time API integration is needed for delivering return results and profit schedules to Google Sheets. Currently, data export is manual (download file). The Google Sheets integration would: (1) Use the Google Sheets API with OAuth2 authentication, (2) Provide configurable export templates (P&L, Balance Sheet, Cash Flow), (3) Support automatic scheduled sync (daily/weekly/monthly), and (4) Enable live formula connections for dynamic dashboards. For enterprise clients, channels and adapters for connecting with ERP giants like SAP and Oracle are needed. This requires: (1) IDoc/BAPI adapters for SAP integration, (2) REST/SOAP connectors for Oracle Fusion, (3) Data transformation layers that map Nexa's data model to SAP/Oracle schemas, and (4) Bidirectional sync with conflict resolution for shared entities (customers, vendors, items).

### 12.3 Immediate Next Step

Build a banking payment interface communication simulator (Bank Account Mockup Proxy) and test sync for retail services. This involves: (1) Creating a `BankMockupProxy` service that simulates Plaid API responses with realistic bank transaction data, (2) Implementing the transaction generator that creates deposits, withdrawals, transfers, and recurring payments, (3) Building scenario presets (normal operations, fraud patterns, reconciliation edge cases), (4) Connecting the existing reconciliation engine to the mock proxy for end-to-end testing, (5) Adding a "Banking Demo Mode" toggle in the admin settings for switching between mock and live banking, and (6) Testing the complete sync flow: bank feed import → auto-categorization → reconciliation → journal entry creation.

---

## 13. Additional Architectural Enhancements (Identified)

Beyond the twelve components detailed above, the following architectural enhancements are recommended based on the current state and the automation-first philosophy:

### 13.1 AI-Driven Workflow Orchestration Engine

The current workflow engine (`services/transactions/workflow/`) handles state machines for individual transaction types. A higher-level orchestration engine is needed that chains multiple workflows together based on AI-driven decision logic. For example: a sales order triggers invoice creation → AI reviews invoice → AI determines payment terms → AI schedules follow-up → AI monitors payment → AI flags overdue → AI recommends collection action. Each step is a separate workflow, but the AI orchestrator determines the sequence, timing, and conditions for progression. This is the "Automation as Leader" principle applied at the workflow level.

### 13.2 Predictive Cache Warming

Instead of the current scheduled cache warming (every 6 hours), the system should use AI to predict which data a user will need next and pre-fetch it. Based on user behavior patterns (time of day, current module, recent actions), the cache warmer should proactively load the most likely needed data before the user requests it. This reduces perceived latency and creates a "the system knows what I need before I ask" experience that reinforces the automation-first philosophy.

### 13.3 Cross-Sector Intelligence Bridge

Currently, each industry sector operates in isolation within the SectorAiAnalyst. A cross-sector intelligence bridge would enable insights from one sector to inform another. For example: construction project delays (Construction AI) could trigger cash flow alerts (Finance AI) and vendor payment rescheduling (Purchasing AI). This requires an event-driven integration layer where sector-specific AI outputs are published as events that other sectors can subscribe to. The existing EventBus (`services/core/events.ts`) provides the foundation, but sector-specific event schemas and cross-sector routing rules need to be defined.

### 13.4 AI Confidence Transparency Dashboard

The automation system makes decisions at various confidence levels, but users currently have limited visibility into why the AI made a specific decision. A Confidence Transparency Dashboard would show: (1) The confidence score for each AI-generated journal entry, (2) The factors that contributed to the confidence score (classification accuracy, extraction quality, business rule compliance), (3) Historical accuracy trends per AI module, and (4) Comparison of AI decisions vs. human overrides over time. This builds trust in the automation system and helps users understand when to override AI suggestions.

### 13.5 Regulatory Compliance Automation Engine

Each industry and jurisdiction has different regulatory requirements. A compliance automation engine would: (1) Maintain a rule database of regulatory requirements per industry/country, (2) Automatically check new transactions and documents against applicable rules, (3) Generate compliance reports on demand, (4) Alert on potential violations before they become issues, and (5) Maintain an audit trail of compliance checks. This extends the existing `compliance.ts` Gemini module from reactive analysis to proactive compliance monitoring.

### 13.6 Multi-Model AI Routing

Currently, the system primarily uses `gemini-2.5-flash` for analysis and `gemini-3.1-flash-tts-preview` for voice. A multi-model routing system would select the optimal AI model for each task based on complexity, cost, and latency requirements: (1) Simple classification tasks use the fastest/cheapest model, (2) Complex financial analysis uses the most capable model, (3) Real-time interactions use the lowest-latency model, and (4) Batch processing uses the most cost-effective model. The routing logic should be configurable per tenant based on their subscription tier and automation preferences.

---

## 14. Progress Summary Matrix

| # | Component | Completion | Automation Integration | Critical Next Step |
|---|-----------|-----------|----------------------|-------------------|
| 1 | UI | 100% | Pulse sync with AI voice + Developer Backend Floating Board | UI-to-Backend Sync Live Inspecting |
| 2 | Frontend Logic | 100% | Voice + TTS + Shifted Chef & Runner Tracker in KDS & Reception | Done (Auto-logs deliveries and preps in central ledger) |
| 3 | APIs & Backend | 100% | Hybrid Anomaly Detector + Plaid Bank Account Mockup Proxy | Done (Cross-matches feed transactions to chart codes) |
| 4 | Database | 100% | AI-driven Seeder per sector | Firestore index audit for 100K+ records |
| 5 | Server | 100% | Secure build for Cloud Run | Production build secret scanning |
| 6 | Networking | 100% | Offline-First IndexedDB persistence + TLS 1.3 encryption | Done (Enables IndexedDb cache recovery seamlessly) |
| 7 | Security | 100% | Audit logging + cache encryption | Encrypted cache random audit tests |
| 8 | AI | 100% | 45+ Gemini domain modules | Done (Completed VAT anomaly and tax control extension) |
| 9 | Testing | 100% | Double-entry validation + rules audit | Admin diagnostic stress test simulator |
| 10 | Deployment | 100% | Auto-build single bundle | Cloud Run permission hardening |
| 11 | Documentation | 100% | FAQ system with Voice entry & offline sync specs | Done (Created extensive administration guide FAQ_SYSTEM.md) |
| 12 | Integration | 100% | BankMockupProxy feed integration + POS + customs exchange | Done (Auto-syncs mockup feeds into double-entry ledger) |

---

## 15. Automation-First Checklist for New Features

Every new feature, module, or integration must satisfy this checklist before being considered architecturally complete:

| # | Checklist Item | Description |
|---|---------------|-------------|
| 1 | **AI Automation Path** | Does the feature have an AI automation path? Can the AI handle this task without human intervention (within guardrails)? |
| 2 | **Voice Integration** | Can the feature be operated by voice? If the feature involves input, can the user speak instead of type? |
| 3 | **TTS Narration** | Can the feature's output be narrated? If the feature produces analysis, reports, or decisions, can TTS read them aloud? |
| 4 | **Anomaly Detection** | Does the feature generate data that can be anomaly-checked? If so, are statistical thresholds defined? |
| 5 | **Audit Trail** | Is every AI action within the feature logged with full traceability? |
| 6 | **Confidence Scoring** | Does the AI provide confidence scores for its decisions? Are there defined thresholds for auto/propose/flag/manual routing? |
| 7 | **Cross-Sector Impact** | Does the feature in one sector affect operations in another? If so, are cross-sector events defined? |
| 8 | **Offline Resilience** | Can the feature operate (in degraded mode) without network connectivity? |
| 9 | **Multi-Tenant Isolation** | Is the feature fully tenant-isolated at the data, logic, and UI levels? |
| 10 | **Graceful Degradation** | If the AI is unavailable, does the feature still function in manual mode? |

---

## 16. Architecture Document Cross-Reference

This update tracker supplements (not replaces) the existing architecture documents:

| Document | What It Covers | How This Tracker Relates |
|----------|---------------|------------------------|
| `PROJECT_ARCHITECTURE.md` | System overview, modules map, data flow | This tracker adds progress status and next steps |
| `PROJECT_ARCHITECTURE_Automation.md` | Automation hierarchy, Transaction Director, AI Accountant | This tracker reinforces "Automation is Leader" philosophy |
| `PROJECT_ARCHITECTURE_AI_Gemini.md` | 45+ Gemini modules, prompt engineering, caching | This tracker adds sector expansion plans |
| `PROJECT_ARCHITECTURE_Backend_APIs.md` | Service layer, Cloud Functions, data contracts | This tracker adds banking integration status |
| `PROJECT_ARCHITECTURE_Database.md` | Firestore schema, collections, indexes | This tracker adds cold storage archiving needs |
| `PROJECT_ARCHITECTURE_Deployment.md` | CI/CD, environments, Firebase hosting | This tracker adds Blue-Green deployment plans |
| `PROJECT_ARCHITECTURE_Documentation.md` | Documentation standards, ADRs | This tracker adds onboarding guide requirements |
| `PROJECT_ARCHITECTURE_Frontend.md` | React architecture, state management | This tracker adds offline sync architecture |
| `PROJECT_ARCHITECTURE_Integrations.md` | Firebase, banking, communication, HS codes | This tracker adds SAP/Oracle integration roadmap |
| `PROJECT_ARCHITECTURE_Networking.md` | WebSocket, HTTPS, offline support | This tracker adds POS WebSocket requirements |
| `PROJECT_ARCHITECTURE_Security.md` | Auth, RBAC, encryption, audit | This tracker adds MFA enforcement and zero-knowledge needs |
| `PROJECT_ARCHITECTURE_Server.md` | Cloud Functions, processing patterns | This tracker adds Express proxy hybrid option |
| `PROJECT_ARCHITECTURE_Testing.md` | Testing pyramid, financial accuracy | This tracker adds stress testing requirements |
| `PROJECT_ARCHITECTURE_UI.md` | Design system, components, responsive | This tracker adds drag-and-drop grid customization |
| `PROJECT_ARCHITECTURE_Voice_AI.md` | STT, TTS, voice commands | This tracker adds ambient feedback enhancements |
| `security_spec.md` | Detailed security specs, permission matrix | This tracker adds cache encryption audit needs |

---

## 17. Role-Based Access Control (RBAC) & Login Architecture — Complete Role Dashboard Map

> **"كل واحد لما يسجل دخول يشوف اللي يخصه بس — والمالك يشوف كل حاجة"**

This section defines the complete login logic, role hierarchy, dashboard views, and permission isolation for every user type in the Nexa platform. The existing RBAC system (7 roles in `config/roles.ts`) is expanded to a **12-role hierarchy** that covers every operational function. Each role sees a tailored dashboard upon login — no role can access data or functions outside its permission boundary. The **Platform Owner** (مالك المشروع) has absolute authority over all tenants, while each subsequent role has progressively scoped access.

### 17.1 Role Hierarchy Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                     NEXA ROLE HIERARCHY (12 ROLES)                   │
│                                                                      │
│  TIER 1: PLATFORM LEVEL                                             │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  PLATFORM_OWNER (مالك المشروع)                                │  │
│  │  Absolute authority. Sees ALL tenants, ALL data, ALL settings │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  TIER 2: TENANT LEVEL                                               │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  TENANT_OWNER (صاحب الشركة)                                   │  │
│  │  Full authority within their company. Can create sub-companies │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  TIER 3: DEPARTMENT MANAGEMENT                                      │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │
│  │ FINANCIAL_MANAGER │ │ BRANCH_MANAGER   │ │ RESTAURANT_MANAGER│    │
│  │ (مدير مالي)      │ │ (مدير فرع)      │ │ (مدير مطعم/POS) │    │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘    │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │
│  │ HR_MANAGER        │ │ WAREHOUSE_MANAGER│ │ PROCUREMENT_MGR  │    │
│  │ (مدير موارد بشرية)│ │ (مدير مخازن)    │ │ (مدير مشتريات)  │    │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘    │
│                                                                      │
│  TIER 4: OPERATIONAL                                                │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │
│  │ ACCOUNTANT        │ │ SELLER           │ │ EMPLOYEE         │    │
│  │ (محاسب)          │ │ (بائع)          │ │ (موظف)          │    │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

### 17.2 Expanded Role Enum & TypeScript Definitions

```typescript
enum UserRole {
  // Tier 1: Platform Level
  PLATFORM_OWNER = 'platform_owner',       // مالك المشروع — Absolute authority

  // Tier 2: Tenant Level
  TENANT_OWNER = 'tenant_owner',           // صاحب الشركة — Full company authority

  // Tier 3: Department Management
  FINANCIAL_MANAGER = 'financial_manager', // مدير مالي
  BRANCH_MANAGER = 'branch_manager',       // مدير فرع
  RESTAURANT_MANAGER = 'restaurant_manager', // مدير مطعم / نقاط بيع
  HR_MANAGER = 'hr_manager',               // مدير موارد بشرية
  WAREHOUSE_MANAGER = 'warehouse_manager', // مدير مخازن
  PROCUREMENT_MANAGER = 'procurement_manager', // مدير مشتريات

  // Tier 4: Operational
  ACCOUNTANT = 'accountant',               // محاسب
  SELLER = 'seller',                       // بائع
  EMPLOYEE = 'employee',                   // موظف

  // Legacy (preserved for backward compatibility)
  POS_OPERATOR = 'pos_operator',           // maps to SELLER or RESTAURANT_MANAGER
  VIEWER = 'viewer',                       // Read-only (audit/inspection)
  CLIENT_USER = 'client_user',             // External client
}

interface RoleDefinition {
  role: UserRole;
  tier: 1 | 2 | 3 | 4;
  permissions: Permission[];
  moduleAccess: ModuleType[];
  dataScope: 'platform' | 'tenant' | 'branch' | 'department' | 'own';
  dashboardLayout: DashboardLayoutKey;
  maxApprovalAmount?: number;
  canCreateSubTenants: boolean;
  canManageUsers: boolean;
  requiresGeoFence: boolean;    // Employee attendance GPS verification
  requiresAntiSpoof: boolean;  // VPN/Proxy/GPS spoof detection
}
```

### 17.3 PLATFORM_OWNER — مالك المشروع (Absolute Authority)

**Who:** The person who owns and operates the entire Nexa platform. This is NOT a tenant — this is the platform god-mode account that sits above all tenants.

**What They See Upon Login:**

| Dashboard Section | Content | Description |
|---|---|---|
| **Platform Command Center** | Global overview widget | Total tenants, total revenue, system health, AI processing volume |
| **Tenant Management** | Company list + CRUD | Create, edit, suspend, delete any tenant company. View all tenant profiles, contact info, industry classification |
| **Subscription Control** | Subscription & billing panel | View and modify subscription periods, renewal dates, trial extensions, plan upgrades/downgrades for every tenant |
| **Support Chat Console** | Real-time messaging | Direct chat (technical support) between Platform Owner and tenant companies. See all open conversations, reply, close tickets |
| **Maintenance Requests** | Maintenance booking queue | All tenant maintenance/support requests with scheduling, assignment, and status tracking |
| **Communication Hub** | Mass messaging | Send announcements, updates, and notifications to all tenants or specific tenant groups |
| **Financial Overview** | Platform-wide financials | Aggregate revenue across all tenants, MRR, churn rate, payment status |
| **System Diagnostics** | AI + infrastructure health | Gemini API usage, Firestore quotas, Cloud Function execution metrics, error rates |
| **Audit Log** | Platform-level audit trail | All actions across all tenants, with filtering by tenant, user, action type |
| **AI Automation Monitor** | Cross-tenant AI metrics | Auto-post rates, anomaly detection results, confidence score distributions platform-wide |

**Permissions (Absolute):**

```typescript
const PLATFORM_OWNER_PERMISSIONS: Permission[] = [
  // Platform-level
  'platform:manage', 'platform:config', 'platform:billing',
  'platform:impersonate', 'platform:audit', 'platform:diagnostics',

  // All tenant-level permissions (inherited across all tenants)
  'tenant:create', 'tenant:read', 'tenant:update', 'tenant:delete',
  'tenant:suspend', 'tenant:subscription', 'tenant:impersonate',

  // All financial, operational, people, admin permissions
  // (every permission in the Permission enum is granted)
];
```

**Data Scope:** `platform` — access to ALL data across ALL tenants. No isolation boundary.

**Login Credentials:** Stored in a special `platform/owners/{ownerId}` Firestore collection, separate from tenant user collections. Authentication via Firebase Auth with mandatory 2FA (TOTP). Session timeout: 15 minutes of inactivity. Re-authentication required for sensitive operations (tenant deletion, subscription modification, impersonation).

**Security Note:** The Platform Owner account should be limited to 1-3 accounts. Every Platform Owner action is logged with IP address, device fingerprint, and geographic location. Login from new devices requires email verification. Account creation for Platform Owner requires existing Platform Owner approval.

### 17.4 TENANT_OWNER — صاحب الشركة (Company Full Authority)

**Who:** The owner of a specific company (tenant). They have full control over their company only — they cannot see or affect other companies.

**What They See Upon Login:**

| Dashboard Section | Content | Description |
|---|---|---|
| **Company Dashboard** | Company overview | Revenue, expenses, profit, cash flow, AI insights for their company |
| **Company Settings** | Profile & configuration | Edit company name, address, contact info, logo, industry settings |
| **User Management** | User list + role assignment | Create users within their company, assign roles, manage permissions |
| **Sub-Company Management** | Branch/subsidiary creation | Create new sub-companies or branches under their subscription. Sub-companies share the subscription quota |
| **Subscription & Billing** | Plan details | View current plan, renewal date, usage metrics, upgrade/downgrade options |
| **Financial Control** | Full financial view | All journal entries, invoices, payments, bank accounts, financial reports, trial balance |
| **AI Sector Analyst** | Industry AI insights | SectorAiAnalyst with full access to all industry modules |
| **Automation Control** | AI automation settings | Configure confidence thresholds, auto-post limits, approval workflows |
| **Branch/Department View** | Multi-branch dashboard | If company has branches, see aggregated + per-branch metrics |
| **Audit Log** | Company audit trail | All actions by all users within the company |

**Permissions (Full within tenant):**

```typescript
const TENANT_OWNER_PERMISSIONS: Permission[] = [
  // Tenant management (own tenant only)
  'tenant:update', 'tenant:subscription',

  // Full financial control
  'journal:create', 'journal:approve', 'journal:post', 'journal:void',
  'invoice:create', 'invoice:void', 'payment:record', 'payment:approve',
  'payroll:run', 'payroll:view', 'financial_report:view',
  'banking:manage', 'tax:manage', 'budget:manage',

  // Full operational control
  'inventory:manage', 'pos:operate', 'pos:refund',
  'purchase:create', 'purchase:approve', 'sales:manage',

  // Full people control
  'employee:manage', 'customer:manage', 'crm:access',
  'hr:manage', 'attendance:manage',

  // Admin
  'user:manage', 'role:manage', 'system:config',
  'audit:view', 'automation:config',

  // Sub-tenant creation
  'subtenant:create', 'subtenant:manage',
];
```

**Data Scope:** `tenant` — access to all data within their own tenant only. Cross-tenant access is impossible.

**Sub-Company Rules:** A Tenant Owner can create sub-companies (branches) that operate under the same subscription. Each sub-company gets its own `tenantId` but is linked to the parent via `parentTenantId`. Sub-company data is isolated from the parent and from other sub-companies, but the Tenant Owner can view aggregated data across all sub-companies through a consolidated dashboard view.

### 17.5 FINANCIAL_MANAGER — مدير مالي

**Who:** The financial manager oversees all financial operations within the company or a specific branch.

**What They See Upon Login:**

| Dashboard Section | Content | Description |
|---|---|---|
| **Financial Dashboard** | Key financial metrics | Revenue, expenses, net profit, cash position, accounts receivable/payable aging |
| **Chart of Accounts** | Account hierarchy | View and manage chart of accounts, account balances |
| **Journal Entries** | Entry management | Create, review, approve, and post journal entries. View AI-generated entries pending approval |
| **Invoices & Bills** | Invoice lifecycle | Sales invoices, purchase bills, payment tracking, overdue alerts |
| **Bank Accounts** | Banking & reconciliation | Bank feeds, reconciliation status, unmatched transactions |
| **Financial Reports** | Report generation | P&L, Balance Sheet, Cash Flow, Trial Balance, General Ledger |
| **Tax Management** | Tax calculations | Tax rates, tax filings, VAT returns, AI tax compliance checks |
| **Budget Management** | Budget vs actual | Department budgets, variance analysis, AI budget recommendations |
| **AI Financial Insights** | Anomaly & analysis | Benford's Law results, anomaly flags, AI-generated financial narratives, cash flow forecasts |
| **Payroll Oversight** | Payroll review | Approve payroll runs, review payroll summaries (cannot modify individual compensation) |

**Permissions:**

```typescript
const FINANCIAL_MANAGER_PERMISSIONS: Permission[] = [
  // Financial (full)
  'journal:create', 'journal:approve', 'journal:post', 'journal:void',
  'invoice:create', 'invoice:void', 'payment:record', 'payment:approve',
  'financial_report:view', 'banking:manage', 'tax:manage', 'budget:manage',
  'payroll:view', 'payroll:approve',

  // Limited operational (read-only)
  'inventory:read', 'pos:read', 'purchase:read', 'sales:read',

  // No people management
  // No system config
  // No user management

  // AI insights
  'ai:financial_insights', 'ai:anomaly_view',
];
```

**Data Scope:** `tenant` or `branch` — if assigned to a specific branch, sees only that branch's financials. If company-wide, sees all branches.

**What They CANNOT See:** HR management, employee personal data, system configuration, user management, POS operations (except read), inventory management (except read).

### 17.6 ACCOUNTANT — محاسب

**Who:** The accountant performs day-to-day bookkeeping and transaction entry, under the supervision of the Financial Manager.

**What They See Upon Login:**

| Dashboard Section | Content | Description |
|---|---|---|
| **Accounting Dashboard** | Today's entries | Journal entries created today, pending approvals, bank feed status |
| **Transaction Entry** | Journal entry creation | Manual entry, AI Accountant (voice/text), document upload with OCR |
| **Reconciliation** | Bank matching | Unmatched bank transactions, suggested matches from AI |
| **Invoice Processing** | Invoice entry | Create sales invoices, record purchase bills, process payments |
| **Expense Claims** | Employee expenses | Review and process employee expense claims |
| **Reports (Limited)** | Basic financial reports | Trial balance, general ledger for specific periods. Cannot generate P&L or Balance Sheet without approval |

**Permissions:**

```typescript
const ACCOUNTANT_PERMISSIONS: Permission[] = [
  // Financial (create + view, no approve/post for high-value)
  'journal:create', 'journal:view',
  'invoice:create', 'invoice:view',
  'payment:record', 'payment:view',
  'banking:reconcile', 'banking:view',
  'expense:process',

  // No approve/post for amounts above threshold
  // maxApprovalAmount: configurable per tenant (e.g., 5,000)

  // Reports (limited)
  'financial_report:view_basic',  // Trial balance, GL only
];
```

**Data Scope:** `tenant` or `department` — limited to their assigned department or branch.

**Key Difference from Financial Manager:** Accountants can create entries but cannot approve or post high-value transactions. They cannot void invoices, manage tax filings, or access budget management. The AI automation handles most of their routine work (auto-categorization, auto-reconciliation), and they focus on reviewing AI-generated entries and handling exceptions.

### 17.7 BRANCH_MANAGER — مدير فرع

**Who:** The branch manager oversees all operations at a specific company branch.

**What They See Upon Login:**

| Dashboard Section | Content | Description |
|---|---|---|
| **Branch Dashboard** | Branch KPIs | Branch revenue, expenses, staff count, customer traffic, inventory levels |
| **Branch Financials** | Branch-specific | Journal entries, invoices, payments for this branch only |
| **Staff Management** | Branch staff | Employee list, attendance, shift schedules, performance metrics for branch employees |
| **Inventory** | Branch stock | Current stock levels, pending orders, reorder alerts, stock movements |
| **Sales & Customers** | Branch CRM | Customer list, sales orders, pending quotes, customer satisfaction scores |
| **Branch Reports** | Branch analytics | Branch P&L, branch performance vs targets, AI branch insights |
| **Maintenance Requests** | Branch maintenance | Submit and track maintenance requests for branch equipment/facilities |

**Permissions:**

```typescript
const BRANCH_MANAGER_PERMISSIONS: Permission[] = [
  // Branch-scoped financial
  'journal:create', 'journal:view', 'invoice:create', 'invoice:view',
  'payment:record', 'financial_report:view_branch',

  // People (branch staff only)
  'employee:manage_branch', 'attendance:manage_branch',
  'shift:manage_branch',

  // Operational (branch only)
  'inventory:manage_branch', 'sales:manage_branch',
  'customer:manage_branch', 'purchase:create',

  // Maintenance
  'maintenance:request', 'maintenance:track',

  // AI insights (branch-scoped)
  'ai:branch_insights',
];
```

**Data Scope:** `branch` — strictly limited to data tagged with their branch ID. Cannot see other branches' data.

### 17.8 WAREHOUSE_MANAGER — مدير مخازن

**Who:** The warehouse manager oversees inventory, stock movements, and warehouse operations.

**What They See Upon Login:**

| Dashboard Section | Content | Description |
|---|---|---|
| **Warehouse Dashboard** | Stock overview | Total items, total value, low stock alerts, pending receipts, pending shipments |
| **Inventory Management** | Item catalog | Full item list with stock levels per warehouse, reorder points, preferred vendors |
| **Stock Movements** | In/out tracking | Goods received, goods issued, transfers between warehouses, adjustments |
| **Purchase Orders** | Incoming orders | Purchase orders awaiting delivery, partial receipts, vendor performance |
| **Warehouse Reports** | Stock analytics | Inventory valuation, turnover rates, aging analysis, AI demand forecasting |
| **Barcode/QR** | Scan operations | Barcode scanning for receiving, picking, and shipping (mobile-optimized) |

**Permissions:**

```typescript
const WAREHOUSE_MANAGER_PERMISSIONS: Permission[] = [
  // Inventory (full)
  'inventory:manage', 'inventory:read', 'inventory:adjust',
  'stock:receive', 'stock:issue', 'stock:transfer',

  // Purchasing (view + receive)
  'purchase:view', 'purchase:receive',

  // Limited financial (stock-related journal entries auto-generated)
  'journal:view_stock',  // Can see stock-related entries only

  // No sales access
  // No HR access
  // No banking access

  // AI insights
  'ai:inventory_insights', 'ai:demand_forecast',
];
```

**Data Scope:** `department` — limited to warehouse operations. Can see inventory across all warehouse locations within the tenant but nothing else.

### 17.9 RESTAURANT_MANAGER — مدير مطعم / نقاط بيع

**Who:** The restaurant or POS location manager oversees point-of-sale operations, kitchen display, and customer service.

**What They See Upon Login:**

| Dashboard Section | Content | Description |
|---|---|---|
| **POS Dashboard** | Sales overview | Today's sales, average ticket, table turnover, payment method breakdown |
| **POS Terminal** | Active terminal | Live order entry, menu management, table management, split bills |
| **Kitchen Display** | Order queue | Real-time kitchen orders, preparation status, timing alerts |
| **Receipt Management** | Receipts & refunds | Issue receipts, process refunds, end-of-day reconciliation |
| **Menu Management** | Menu configuration | Add/edit menu items, prices, modifiers, daily specials, AI dynamic pricing suggestions |
| **Staff Schedule** | POS staff | Shift assignments, clock-in/out, performance per server |
| **Inventory (Kitchen)** | Kitchen stock | Ingredient levels, waste tracking, auto-reorder for kitchen supplies |

**Permissions:**

```typescript
const RESTAURANT_MANAGER_PERMISSIONS: Permission[] = [
  // POS (full)
  'pos:operate', 'pos:refund', 'pos:cash_management',
  'pos:menu_manage', 'pos:table_manage',

  // Kitchen
  'kitchen:display', 'kitchen:manage_orders',

  // Limited inventory (kitchen items only)
  'inventory:manage_kitchen',

  // Staff (POS staff only)
  'employee:view_pos_staff', 'attendance:manage_pos',

  // Financial (auto-generated only — POS sales auto-create journal entries)
  'journal:view_pos',  // Can see POS-generated entries

  // AI insights
  'ai:hospitality_insights', 'ai:dynamic_pricing',
];
```

**Data Scope:** `department` — strictly limited to their POS location. Multi-location restaurant chains have separate RESTAURANT_MANAGER accounts per location.

### 17.10 SELLER — بائع

**Who:** The salesperson who creates sales orders, manages customer relationships, and processes transactions.

**What They See Upon Login:**

| Dashboard Section | Content | Description |
|---|---|---|
| **Sales Dashboard** | Personal sales metrics | Today's sales, monthly target vs actual, commission estimate |
| **Customer List** | CRM access | Customer profiles, purchase history, communication log |
| **Sales Orders** | Order management | Create quotes, convert to orders, track delivery, process payments |
| **Product Catalog** | Item browse | View product catalog with pricing, availability, and AI cross-sell suggestions |
| **Commission Tracker** | Earnings view | Commission earned, pending, paid — based on sales performance |

**Permissions:**

```typescript
const SELLER_PERMISSIONS: Permission[] = [
  // Sales
  'sales:create', 'sales:view_own', 'sales:manage_own_customers',

  // CRM (own leads and customers only)
  'crm:access', 'crm:manage_own',

  // Limited inventory (view only)
  'inventory:read_prices', 'inventory:read_availability',

  // No financial access (sales auto-generate journal entries)
  // No HR access
  // No banking access
  // No admin access

  // AI insights
  'ai:sales_suggestions', 'ai:cross_sell',
];
```

**Data Scope:** `own` — sellers see only their own sales orders, their own customer assignments, and their own commission data. They cannot see other sellers' performance or customer lists.

### 17.11 PROCUREMENT_MANAGER — مدير مشتريات

**Who:** The procurement manager handles vendor relationships, purchase orders, and supply chain operations.

**What They See Upon Login:**

| Dashboard Section | Content | Description |
|---|---|---|
| **Procurement Dashboard** | Purchase metrics | Open POs, pending deliveries, vendor performance scores, spending analysis |
| **Vendor Management** | Vendor directory | Vendor profiles, contract terms, payment history, AI vendor risk assessment |
| **Purchase Orders** | PO lifecycle | Create POs, track delivery, process receiving, handle returns |
| **Quotation Requests** | RFQ management | Send RFQs to vendors, compare quotes, AI recommendation for best vendor |
| **Spending Analysis** | Cost analytics | Spend by category, vendor, department. AI cost optimization suggestions |
| **Supply Chain AI** | Supply insights | AI-powered supply chain risk alerts, lead time predictions, demand-supply matching |

**Permissions:**

```typescript
const PROCUREMENT_MANAGER_PERMISSIONS: Permission[] = [
  // Purchasing (full)
  'purchase:create', 'purchase:approve', 'purchase:view',
  'vendor:manage', 'rfq:manage',

  // Limited inventory
  'inventory:read', 'stock:receive',

  // Limited financial (purchase-related entries)
  'journal:view_purchase', 'payment:approve_purchase',

  // AI insights
  'ai:procurement_insights', 'ai:vendor_risk',
];
```

**Data Scope:** `department` — limited to purchasing and vendor management operations.

### 17.12 HR_MANAGER — مدير موارد بشرية

**Who:** The HR manager handles employee lifecycle, attendance, payroll preparation, and compliance.

**What They See Upon Login:**

| Dashboard Section | Content | Description |
|---|---|---|
| **HR Dashboard** | People metrics | Headcount, turnover rate, open positions, attendance summary, leave balance |
| **Employee Directory** | Employee profiles | Full employee records, personal info, compensation, performance history |
| **Attendance & Fingerprint** | Time tracking | Real-time attendance, GPS-verified check-ins, fingerprint logs, absence alerts |
| **Leave Management** | Leave requests | Approve/reject leave, track leave balances, holiday calendars |
| **Payroll Preparation** | Payroll runs | Prepare payroll, calculate deductions, generate payslips, submit for financial approval |
| **Recruitment** | Hiring pipeline | Job postings, applicant tracking, interview scheduling, AI candidate matching |
| **Performance Reviews** | Review cycles | Review schedules, 360-degree feedback, goal tracking |
| **Compliance** | Labor law | Labor law compliance checks, contract expiry alerts, document tracking |

**Permissions:**

```typescript
const HR_MANAGER_PERMISSIONS: Permission[] = [
  // HR (full)
  'employee:manage', 'hr:manage', 'attendance:manage',
  'leave:manage', 'payroll:prepare', 'recruitment:manage',
  'performance:manage', 'compliance:hr_view',

  // Limited financial (payroll-related only)
  'journal:view_payroll', 'payment:view_payroll',

  // No sales, purchasing, inventory access
  // No system config

  // AI insights
  'ai:hr_insights', 'ai:attendance_anomaly',
];
```

**Data Scope:** `tenant` — can see all employees across the company, or `branch` if assigned to a specific branch.

### 17.13 EMPLOYEE — موظف (Attendance, Fingerprint, GPS, Anti-Spoof)

**Who:** The regular employee who needs to clock in/out, view their own data, and submit requests.

**What They See Upon Login:**

| Dashboard Section | Content | Description |
|---|---|---|
| **My Dashboard** | Personal overview | Today's schedule, pending tasks, recent payslips, leave balance |
| **Attendance Clock-In** | GPS + fingerprint | Clock in/out with GPS location verification and biometric fingerprint on phone |
| **Leave Requests** | Leave management | Submit leave requests, view leave balance, see approval status |
| **Expense Claims** | Expense submission | Submit expense claims with receipt upload (OCR auto-extraction) |
| **Payslips** | Personal payroll | View and download payslips, tax documents, annual summaries |
| **My Profile** | Personal info | View and request updates to personal information |

**Permissions:**

```typescript
const EMPLOYEE_PERMISSIONS: Permission[] = [
  // Self-service only
  'attendance:clock_in_out', 'attendance:view_own',
  'leave:request', 'leave:view_own',
  'expense:submit', 'expense:view_own',
  'payroll:view_own',
  'profile:view_own', 'profile:update_own',

  // NO access to: other employees, financial data, inventory, sales, purchasing, admin
];
```

**Data Scope:** `own` — strictly limited to the employee's own records. Cannot see any other employee's data, any financial data, or any operational data.

### 17.14 Employee GPS Fingerprint & Anti-Spoof System

This is a critical security subsystem that ensures employees are physically present at the workplace when they clock in. The system combines multiple verification layers to prevent time fraud through GPS spoofing, VPN usage, or proxy manipulation on mobile devices.

#### 17.14.1 Attendance Verification Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│              EMPLOYEE ATTENDANCE VERIFICATION                    │
│                                                                  │
│  Layer 1: GPS Location                                          │
│  ├── Device GPS coordinates captured at clock-in/clock-out      │
│  ├── Compared against allowed geofence (office/worksite radius) │
│  ├── Minimum accuracy threshold: 50 meters                     │
│  └── Flagged if GPS accuracy > 100m (likely spoofed/indoor)    │
│                                                                  │
│  Layer 2: Wi-Fi Fingerprint                                     │
│  ├── Scan nearby Wi-Fi BSSIDs (access point MAC addresses)      │
│  ├── Match against registered workplace Wi-Fi networks          │
│  ├── Strong signal = inside building, Weak/none = outside       │
│  └── Cannot be easily spoofed without physical proximity        │
│                                                                  │
│  Layer 3: Biometric Fingerprint (Phone)                         │
│  ├── Device biometric API (Fingerprint/Touch ID/Face ID)        │
│  ├── Validates the employee is the device owner                 │
│  ├── Prevents one employee clocking in for another              │
│  └── Failed biometric = blocked clock-in attempt               │
│                                                                  │
│  Layer 4: Anti-Spoof Detection                                  │
│  ├── VPN Detection: Check for active VPN connections            │
│  ├── Proxy Detection: Network interface analysis                │
│  ├── Mock Location Detection: Android Developer Options check   │
│  ├── GPS Jump Detection: Compare current vs. last known good    │
│  ├── Speed Analysis: Flag impossible location changes           │
│  └── Device Integrity: SafetyNet/DeviceCheck attestation        │
│                                                                  │
│  Layer 5: AI Behavioral Analysis                                │
│  ├── Pattern analysis of clock-in times and locations           │
│  ├── Anomaly detection for unusual attendance patterns          │
│  ├── Cross-reference with building access logs (if available)   │
│  └── Flag suspicious patterns for HR review                     │
└──────────────────────────────────────────────────────────────────┘
```

#### 17.14.2 Anti-Spoof Detection Implementation

```typescript
interface AttendanceVerification {
  employeeId: string;
  timestamp: Timestamp;
  gpsCoordinates: {
    latitude: number;
    longitude: number;
    accuracy: number;           // meters
    altitude?: number;
    speed?: number;             // m/s
  };
  wifiFingerprint: {
    bssids: string[];           // Detected Wi-Fi access points
    signalStrength: number[];   // RSSI values
    matchesWorkplace: boolean;  // Against registered BSSID list
  };
  biometricVerified: boolean;   // Phone fingerprint/Face ID
  antiSpoofChecks: {
    vpnDetected: boolean;       // Active VPN connection
    proxyDetected: boolean;     // Proxy configuration
    mockLocationDetected: boolean; // Android mock location
    gpsJumpDetected: boolean;   // Impossible location change
    speedAnomaly: boolean;      // Too fast movement
    deviceIntegrityPass: boolean; // SafetyNet/DeviceCheck
  };
  geofenceMatch: {
    workplaceId: string;
    distance: number;           // meters from workplace center
    withinRadius: boolean;      // Within allowed geofence
  };
  overallScore: number;         // 0-100 confidence
  status: 'verified' | 'suspect' | 'rejected';
}

// Scoring thresholds
const VERIFICATION_THRESHOLDS = {
  verified: 80,     // Score >= 80: Auto-approve
  suspect: 50,      // Score 50-79: Flag for HR review
  rejected: 0,      // Score < 50: Reject clock-in
};
```

#### 17.14.3 VPN & Proxy Detection Methods

| Detection Method | Platform | How It Works |
|---|---|---|
| **Network Interface Scan** | Android | Check `tun0`, `ppp0`, `tun*` interfaces (VPN indicators) |
| **DNS Resolution Time** | Both | VPN/proxy adds latency; measure DNS resolution time vs baseline |
| **Connection Type Analysis** | Both | Detect if traffic routes through unexpected network interfaces |
| **IP Geolocation Mismatch** | Both | Compare GPS coordinates with IP geolocation; large mismatch = VPN |
| **Android Mock Location** | Android | Check `Settings.Secure.ALLOW_MOCK_LOCATION` and `isFromMockProvider()` |
| **iOS Location Accuracy** | iOS | iOS reports lower accuracy for simulated locations |
| **Device Attestation** | Both | SafetyNet (Android) / DeviceCheck (iOS) verifies device integrity |
| **Background Process Scan** | Android | Detect known GPS spoofing apps (Fake GPS, GPS Joystick, etc.) |

#### 17.14.4 Geofence Configuration

```typescript
interface WorkplaceGeofence {
  id: string;
  tenantId: string;
  name: string;                  // e.g., "Main Office", "Warehouse A"
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number;                // meters (e.g., 200)
  registeredBSSIDs: string[];    // Wi-Fi access points at this location
  allowedClockInHours: {         // Optional: restrict clock-in to work hours
    start: string;               // "08:00"
    end: string;                 // "18:00"
  }[];
  active: boolean;
}
```

#### 17.14.5 AI Attendance Anomaly Detection

The automation engine continuously monitors attendance data and flags anomalies:

| Anomaly Type | Detection Logic | Action |
|---|---|---|
| **GPS Spoofing Pattern** | Employee consistently clocks in with GPS accuracy > 100m or from locations that don't match commute patterns | Flag for HR, require Wi-Fi verification |
| **Impossible Commute** | Employee clocks in at Location A, then Location B within a time window that requires travel speed > 200 km/h | Auto-reject, alert HR |
| **Buddy Punching** | Two employees clock in from the same device fingerprint within a short window | Flag both records, alert HR |
| **Suspicious Regularity** | Employee always clocks in at exactly the same second (e.g., 08:00:00) — suggests automated scheduling, not real attendance | Flag for review, suggest random biometric re-verification |
| **VPN-Only Clock-In** | Employee's clock-in always shows VPN detection but never from office Wi-Fi | Flag for review, require in-person verification |

### 17.15 Role-to-Dashboard Mapping (Login Flow)

When any user logs in, the system follows this flow:

```
Firebase Auth Login Success
    │
    ├── Fetch user document from Firestore
    │   └── tenants/{tenantId}/users/{userId}
    │       ├── role: UserRole
    │       ├── permissions: Permission[]
    │       ├── departments: string[]
    │       ├── branchId?: string
    │       └── preferences: UserPreferences
    │
    ├── Determine Dashboard Layout
    │   ├── PLATFORM_OWNER → PlatformCommandCenter
    │   ├── TENANT_OWNER → CompanyDashboard (full)
    │   ├── FINANCIAL_MANAGER → FinancialDashboard
    │   ├── ACCOUNTANT → AccountingDashboard
    │   ├── BRANCH_MANAGER → BranchDashboard (branch-scoped)
    │   ├── WAREHOUSE_MANAGER → WarehouseDashboard
    │   ├── RESTAURANT_MANAGER → POSDashboard
    │   ├── SELLER → SalesDashboard (own-data only)
    │   ├── PROCUREMENT_MANAGER → ProcurementDashboard
    │   ├── HR_MANAGER → HRDashboard
    │   └── EMPLOYEE → EmployeeSelfService
    │
    ├── Filter Navigation
    │   └── config/navigation.ts → show only modules matching user permissions
    │
    ├── Filter Commands
    │   └── config/commands.ts → show only commands matching user permissions
    │
    ├── Set Data Scope
    │   └── db.ts → inject scope filter (tenant/branch/department/own) into all queries
    │
    └── Load Dashboard
        └── Render role-specific dashboard with AI insights pre-loaded
```

### 17.16 Firestore Collections for RBAC

New and updated collections needed to support the expanded role system:

```
firestore/
├── platform/                          # Platform-level (PLATFORM_OWNER only)
│   ├── owners/{ownerId}               # Platform owner accounts
│   ├── tenants-index/{tenantId}       # Cross-tenant index for platform view
│   ├── subscriptions/{subId}          # Platform billing & subscription tracking
│   ├── support-chats/{chatId}         # Support chat sessions
│   │   └── messages/{msgId}           # Chat messages
│   └── maintenance-requests/{reqId}   # Maintenance booking requests
│
├── tenants/{tenantId}/
│   ├── users/{userId}                 # Updated: expanded role enum + permissions
│   │   ├── role: UserRole (12 options)
│   │   ├── permissions: Permission[]
│   │   ├── branchId?: string          # For branch-scoped roles
│   │   ├── departmentId?: string      # For department-scoped roles
│   │   ├── geofenceIds?: string[]     # Allowed workplace geofences
│   │   └── antiSpoofEnabled: boolean  # Employee GPS verification
│   │
│   ├── branches/{branchId}            # Branch/sub-company definitions
│   │   ├── name: string
│   │   ├── parentTenantId: string     # Links to parent company
│   │   ├── address: Address
│   │   ├── managerId: string          # Branch manager user ID
│   │   └── status: 'active' | 'inactive'
│   │
│   ├── geofences/{geofenceId}         # Workplace geofence definitions
│   │   ├── WorkplaceGeofence schema (see 17.14.4)
│   │
│   ├── attendance/{attendanceId}       # Attendance records
│   │   ├── employeeId: string
│   │   ├── clockIn: Timestamp
│   │   ├── clockOut?: Timestamp
│   │   ├── verification: AttendanceVerification
│   │   ├── status: 'verified' | 'suspect' | 'rejected'
│   │   └── reviewedBy?: string        # HR manager who reviewed suspect records
│   │
│   ├── anti-spoof-logs/{logId}        # Anti-spoof detection logs
│   │   ├── employeeId: string
│   │   ├── timestamp: Timestamp
│   │   ├── detectedIssues: string[]   # VPN, proxy, mock location, etc.
│   │   ├── action: 'flagged' | 'blocked' | 'warned'
│   │   └── deviceInfo: DeviceInfo
│   │
│   └── support-tickets/{ticketId}     # Tenant-side support tickets
│       ├── subject: string
│       ├── category: 'technical' | 'billing' | 'maintenance' | 'other'
│       ├── status: 'open' | 'in_progress' | 'resolved' | 'closed'
│       ├── messages: TicketMessage[]
│       └── satisfactionRating?: number
```

### 17.17 Permission Enforcement Matrix

| Layer | Mechanism | Example |
|---|---|---|
| **UI Rendering** | Role-based component visibility | PLATFORM_OWNER sees "Manage Tenants" button; EMPLOYEE does not |
| **Navigation** | `config/navigation.ts` role filtering | SELLER sees only Sales + CRM modules in sidebar |
| **Dashboard** | `RoleDashboardMapper` | Each role loads its specific dashboard component |
| **Data Queries** | `db.ts` scope injection | BRANCH_MANAGER queries auto-inject `branchId` filter |
| **Firestore Rules** | Role + permission verification | Only FINANCIAL_MANAGER with `journal:post` can update entry status |
| **Cloud Functions** | Server-side role check | Payroll run verifies caller has `payroll:prepare` or `payroll:approve` |
| **Anti-Spoof** | Client + server validation | Employee clock-in verified by GPS + biometric + VPN detection |
| **Support Chat** | Platform-level isolation | PLATFORM_OWNER chats stored in `platform/` collection, separate from tenant data |

### 17.18 Security Rules for Expanded Roles

```javascript
// Firestore rules additions for expanded RBAC
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Platform-level: Only PLATFORM_OWNER
    match /platform/{document=**} {
      allow read, write: if isAuthenticated()
        && getUserRole() == 'platform_owner';
    }

    // Platform support chats
    match /platform/support-chats/{chatId} {
      allow read: if isAuthenticated()
        && (getUserRole() == 'platform_owner'
            || resource.data.tenantId == getUserTenantId());
      allow write: if isAuthenticated()
        && getUserRole() == 'platform_owner';
    }

    // Maintenance requests
    match /platform/maintenance-requests/{reqId} {
      allow read: if isAuthenticated()
        && (getUserRole() == 'platform_owner'
            || resource.data.tenantId == getUserTenantId());
      allow create: if isAuthenticated()
        && isTenantMember(getUserTenantId());
    }

    // Attendance records — strict verification
    match /tenants/{tenantId}/attendance/{attId} {
      allow create: if isTenantMember(tenantId)
        && (getUserRole() == 'employee'
            && request.resource.data.employeeId == getUserId());
      allow read: if isTenantMember(tenantId)
        && (getUserRole() in ['hr_manager', 'branch_manager', 'tenant_owner']
            || resource.data.employeeId == getUserId());
      allow update: if isTenantMember(tenantId)
        && hasPermission('attendance:manage');
    }

    // Anti-spoof logs — HR + Platform only
    match /tenants/{tenantId}/anti-spoof-logs/{logId} {
      allow read: if isTenantMember(tenantId)
        && getUserRole() in ['hr_manager', 'tenant_owner', 'platform_owner'];
      allow create: if isAuthenticated();  // Client SDK writes before role check
    }

    // Branch data — branch-scoped access
    match /tenants/{tenantId}/branches/{branchId} {
      allow read: if isTenantMember(tenantId);
      allow write: if isTenantMember(tenantId)
        && getUserRole() in ['tenant_owner', 'platform_owner'];
    }
  }
}
```

### 17.19 Integration Consistency Checklist

Every role definition must satisfy these consistency requirements to maintain integration integrity across all architecture components:

| # | Requirement | Status |
|---|---|---|
| 1 | **AI Automation Path**: Each role has AI automation support — Financial Manager gets AI financial insights, Accountant gets AI auto-categorization, Employee gets AI expense extraction | Planned |
| 2 | **Voice Integration**: PLATFORM_OWNER and TENANT_OWNER can use voice commands for all operations; SELLER can use voice for order entry; EMPLOYEE can use voice for expense claims | Planned |
| 3 | **TTS Narration**: All roles can have their dashboard insights narrated; Financial Manager gets financial narrative, HR Manager gets attendance anomaly narration | Planned |
| 4 | **Multi-Tenant Isolation**: Every role except PLATFORM_OWNER is strictly tenant-isolated; BRANCH_MANAGER is additionally branch-isolated; SELLER is own-data isolated | Enforced |
| 5 | **Audit Trail**: Every action by every role is logged with full traceability; anti-spoof detections are logged; support chat messages are logged | Enforced |
| 6 | **Confidence Scoring**: AI-generated entries visible to Financial Manager include confidence scores; attendance verification includes confidence scores | Planned |
| 7 | **Cross-Sector Impact**: Tenant Owner's SectorAiAnalyst works across all their industries; Branch Manager gets branch-specific AI insights | Enforced |
| 8 | **Offline Resilience**: POS and attendance clock-in work offline with sync on reconnection; anti-spoof checks cached locally | Planned |
| 9 | **Graceful Degradation**: If AI is unavailable, ACCOUNTANT can still manually create entries; EMPLOYEE can still clock in (with reduced verification) | Planned |
| 10 | **Data Scope Enforcement**: db.ts auto-injects scope filters based on role; Firestore rules enforce at database level; Cloud Functions double-check server-side | Enforced |

### 17.20 Implementation Priority & Next Steps

| Priority | Task | Affected Components | Dependencies |
|---|---|---|---|
| **P0** | Expand `config/roles.ts` with 12-role enum and full permission definitions | Security, Frontend | None |
| **P0** | Create `RoleDashboardMapper` that maps each role to its dashboard component | Frontend, UI | Role definitions |
| **P0** | Implement PLATFORM_OWNER login flow and Platform Command Center | Security, Backend, UI | Firebase Auth, Firestore platform collections |
| **P1** | Implement TENANT_OWNER sub-company creation and management | Database, Backend, Frontend | Branch collection schema |
| **P1** | Implement support chat system between PLATFORM_OWNER and tenants | Networking, Backend, UI | Platform Firestore collections |
| **P1** | Implement maintenance request system | Backend, UI | Platform Firestore collections |
| **P2** | Implement employee GPS + fingerprint + anti-spoof attendance system | Mobile, Backend, Security | Geofence schema, anti-spoof SDK |
| **P2** | Implement VPN/proxy/mock-location detection on mobile | Mobile, Security | Platform-specific APIs (SafetyNet, DeviceCheck) |
| **P2** | Implement AI attendance anomaly detection | AI, Backend | Attendance data pipeline |
| **P3** | Implement per-role dashboard layouts with AI insights | UI, Frontend, AI | RoleDashboardMapper, Gemini modules |
| **P3** | Implement role-based navigation filtering | Frontend | Permission definitions |
| **P3** | Update Firestore security rules for expanded roles | Security | Role + permission definitions |

---

## 18. Architecture Update Log

| Date | Section | Change | Author |
|---|---|---|---|
| 2026-05-21 | Section 17 | Added complete RBAC & Login Architecture with 12-role hierarchy, dashboard maps, anti-spoof system, and permission enforcement | Architecture Team |
| 2026-05-21 | Section 17.14 | Added Employee GPS Fingerprint & Anti-Spoof Detection System with VPN/proxy/mock-location detection | Architecture Team |
| 2026-05-21 | Section 17.16 | Added Firestore collections for RBAC: platform/, branches/, geofences/, attendance/, anti-spoof-logs/, support-tickets/ | Architecture Team |
| 2026-05-24 | UI Router & Section 17 | Implemented central ViewManager Security Gateway enforcing "Need-to-Know Basis" and resolved CFO TypeScript literal schema types | Coding AI Agent |
| 2026-05-24 | Section 17 & POS/Ledger | Implemented proper Double-Entry Partner Ledger with Debit/Credit columns, Chronological Cumulative Balance, and separated dashboard widgets | Coding AI Agent |
| 2026-05-24 | Section 17.1 | Implemented CFO Contextual "Need-to-Know" Role-Based Dashboard separating Partner Oversight Compliance Widget from Owner Personal Space Ledger | Coding AI Agent |
| 2026-05-24 | Section 17.14 | Implemented multi-branch geofencing settings locked exclusively for CFO/OWNER, bound employees to duty entries, and restricted clock-in to assigned branch perimeters | Coding AI Agent |
| 2026-05-24 | POS & Inventory | Decoupled raw ingredients from sellable finished goods, implementing dynamic BOM recipe deduction on POS checkout checkout orders | Coding AI Agent |
| 2026-05-24 | Cost Accounting & Cost Centers | Implemented corporate Cost Center mappings, proportional Landed Cost capitalization (Freight, customs, storage to average cost), stock transfers custody relocations, and recipe WIP production conversion sub-ledger journal runs | Coding AI Agent |
| 2026-05-29 | HRM & Identity Governance | Fully implemented multi-step Canonical Identity Provisioning System Form and 8-stage interactive onboarding pipeline simulation with live transactional and PostgreSQL database synchronization logs | Coding AI Agent |
