# Frontend Architecture

## 1. Overview

The frontend is a modern **Single Page Application (SPA)** built with **React 18**, **TypeScript**, and **Vite**. It is styled using **Tailwind CSS** with a design system emphasizing high contrast, generous whitespace, and responsive layouts. The application states are coordinated via React Context providers, with data fetched in real-time through the Firestore SDK.

---

## 2. Component Hierarchy

```
App.tsx (Routing / Theme / Auth Guard)
  └── DashboardApp.tsx (Main Layout & Shell)
        ├── Sidebar (Hierarchical Navigation)
        └── Main Content (Sector Route Controller)
              ├── Dashboard (Primary Overview)
              │     ├── Financial KPI Section
              │     ├── Active Transactions Section
              │     └── SectorAiAnalyst (Nexa Copilot)
              │
              ├── Sector Pages (40+ Industry Views)
              │     ├── RetailOverview
              │     ├── HealthOverview
              │     └── ConstructionOverview
              │
              ├── Features / Tools
              │     ├── TransactionDirectorModal
              │     ├── AnomalyDetection
              │     └── BankInsights
              │
              └── Admin / Settings
                    ├── UserSettings (2FA / Profile)
                    └── SystemDiagnostics (Health Metrics)
```

---

## 3. Directory Layout

The workspace root contains files for the client-side SPA structure:

- `/index.html`: Main SPA mount file
- `/src/main.tsx`: Entry point mounting `/src/App.tsx`
- `/src/App.tsx`: Routing, global state integration, and theme handling
- `/src/index.css`: Tailwind imports and font configuration
- `/src/types.ts`: Domain types and interface declarations
- `/src/components/`: Modular component split:
  - `Dashboard.tsx`: Primary dashboard layout
  - `Sidebar.tsx`: Navigation rail
  - `Header.tsx`: Profile summary & command palette trigger
  - `SectorAiAnalyst.tsx`: Specialized AI assistant interface
  - `dashboard/`: Subcomponents for charts, cards, and widgets
  - `tools/`: Modals, upload forms, and specific utility sheets
  - `industries/`: Specialized interfaces for the 40+ sectors
  - `support/`: Live chat and ticket management UI

---

## 4. State Management Strategy

To avoid complexity and state desynchronization:

- **React Context:** Used for global variables (e.g., Theme, Active Tenant, Current User, View Routing, Language settings) via `AppContext.tsx`.
- **Local State (`useState`):** Preferred for view-specific states, search keywords, form attributes, and toggle booleans.
- **Cache-First Queries:** Real-time listeners bind directly to data nodes. Updates propagate automatically across active components.

---

## 5. UI Layout Design Specifications

All components conform to the following guidelines from `PROJECT_ARCHITECTURE_UI.md`:

- **Layout Structure:** 12-column Grid sizing with standard spacing classes (`gap-4`, `gap-6`).
- **Typography:** Display elements use "Inter" with tight character tracking (`tracking-tight`). Numbers and currency tables use "JetBrains Mono" (`font-mono`).
- **Design Mode:** Standard Dark Luxe theme with glassmorphism panels. Colors are soft off-whites, slates, and charcoal grays.
- **Animations:** Subtle transitions (`transition-all duration-200`) on buttons and cards. Smooth fade-in on mount using Tailwind or `motion` where possible.
- **Form Controls:** Fields have explicit focus states with clear boundary lines (`focus:ring-2 focus:ring-emerald-500`).
- **Validation Messages:** Errors display instantly using accessible label styling below fields, with red alerts (`text-red-500`).

---

## 6. Real-time Real-World Integration

- Inputs created through components like `TransactionDirectorModal` compile instantly into balanced ledger proposals.
- Analysis requests from the `SectorAiAnalyst` component fire directly to their mapped Gemini controller methods.
- Upload fields support both drag-and-drop operations and click-to-upload selectors with validation.
- Play buttons trigger browser-native Text-to-Speech playback using raw Base64 wav arrays fetched via Gemini TTS methods.
- Statistical Benford analysis outputs convert immediately to SVG area charts for intuitive observation.

---

## 7. Bento Layout Customization and Persisted Configuration

### 7.1 Client-Side Layout State & Context
The frontend manages the layout customization using global context coordinates:
- The customizer state toggle `isCustomizingLayout` is managed inside `contexts/AppContext.tsx` and can be switched globally through buttons in `components/dashboard/DashboardHeader.tsx`.
- The `FinancialOverview.tsx` dashboard component reacts dynamically to the customization toggle to wrap grid cells in visual design canvases.

### 7.2 Native HTML5 Drag & Drop Implementation
In order to guarantee flawless execution in React 19 and avoid peer-dependency type hazards, we implemented a custom client-side gesture listener using native HTML5 Drag and Drop events:
1. `draggable={isCustomizingLayout}` sets drag authorization.
2. `onDragStart` initiates tracking of the origin index and disables default drag images.
3. `onDragOver` monitors target coordinates and triggers instant local state index swapping (`widgets` array manipulation) when dragging over adjacent cards to create high-frequency, responsive animation feedback.
4. `onDragEnd` clears tracking variables and commits the final ordered list to local storage.

### 7.3 LocalStorage Sync & Fail-safe Merging
To protect user settings against schema upgrades, the dashboard loading hook incorporates a structural merge mechanism:
- Cleans and checks stored serialized JSON arrays.
- Fills missing components with native defaults if new widgets are introduced in code updates.
- Keeps coordinates and heights correct to ensure pristine, error-free pixel dimensions.
- Features manual "Reset Layout" capabilities that clear storage keys and restore default bento ratios instantly.

---

## 8. Role-Based Conditional Screen Rendering & Component State Mapping

### 8.1 Adaptive Dashboard Setup (`Dashboard.tsx`)
* Uses `useApp()` to resolve `currentUniversalRole` and `currentUserIdentity`.
* Formulates binary display triggers based on security permissions:
  * `showLedger` evaluates as true ONLY for the `OWNER` / `PARTNER` roles, preventing standard cashiers or external accountants from seeing personal accounts directly in their workspaces.
  * `showOversight` evaluates as true for executive/oversight roles (`CEO`, `CFO`, `ACCOUNTANT`, `CHIEF_ACCOUNTANT`, `ADMIN`, `SYSTEM_ADMIN`). This isolates partner compliance controls to qualified users only.

### 8.2 Lifecycle & API Coordination
* `PartnerOversightWidget.tsx`:
  * Mounts and issues a call to `PartnerLedgerService.getPartnersBreakdown()` to summarize unique partner records, total deposits/withdrawals, net balances, and limit thresholds.
  * Contains local react selection state `selectedPartnerEmail` and `selectedPartnerName`.
  * Monitors changes to `selectedPartnerEmail` to dynamically trigger secondary queries fetching specific partner transaction lists on-demand.


## 9. Hierarchical Leave Request & Simulated Role State Management (`LeaveManagement.tsx`)

### 9.1 Local Simulation State vs Global Context
* `LeaveManagement.tsx` queries the global `AppContext` to acquire the logged-in user details.
* To support flexible integration testing, a local `simulatedUser` react state is introduced which shadows the global profile. Selecting a target button updates `simulatedUser` and re-runs filtration queries instantly without necessitating global session re-authentication.

### 9.2 Auto-Calculated Date Delta Hook
* Form state handles calendar picking for `startDate` and `endDate`.
* A computed variable calculates duration days instantaneously on changes:
  `days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)) + 1)`
* Prevents submission if the calculated delta represents an invalid range (negative days).

### 9.3 Role-Bound Action & Inbox Filtration
* **Inbox Filtration Loop**: React evaluates the active `simulatedUser.role` during the main array render.
  * If `simulatedUser` is a cashier, their pending actions box remains hidden.
  * If `simulatedUser` matches `ACCOUNTANT`, the inbox filters requests where `status === 'PENDING'` AND `targetApproverRole === 'ACCOUNTANT'`.
  * If `simulatedUser` matches `CHIEF_ACCOUNTANT`, it filters requests where `status === 'PENDING'` AND `targetApproverRole === 'CHIEF_ACCOUNTANT'`.
  * If `simulatedUser` matches the `OWNER`, they see all pending requests.
* **Security Validation Gate**: Button clicks triggering `Nexa.Core.Db.update('leave_requests', ...)` first verify if the simulated role matches the request's exact `targetApproverRole` to block cross-role bypasses.

---

## 10. Traceable Entity-Centric State Management (إدارة الحالات المعرّفة بالـ UUID v7)

To enforce Odoo/SAP level relational integrity, every frontend view handles state strictly via system-wide UUID keys instead of changeable labels or indices:
1. **Sales Pipeline (`CrmPipeline.tsx`)**:
   - Isolates deals by `salesRepresentativeId` and `owner` (e.g., Saleh Al-Otaibi is statically filtered unless logged is an auditor/accountant who holds supervisory bypass rights).
   - Maps each pipeline change to a unique `dealId` and auto-notifies the ledger via transaction event logs.
2. **Retail POS Terminal (`POS.tsx`)**:
   - Integrates safety-lock behavior: if `currentUniversalRole` is `ACCOUNTANT` or `AUDITOR`, the POS operates in Audit-Mode (Read-Only). Operations modifying data (`addToCart`, `submitOrder`, etc.) are securely short-circuited.
   - Every checkout event generates a transaction UUID trace, linking `cashierId`, `warehouseId`, and `invoiceId` transparently.
3. **Supply Chain Portal (`SupplyChainCycle.tsx`)**:
   - Prevents multi-step workflow overlap by restricting the 4 steps (Operating Manager, Warehouse Custodian `هاني الشمري`, Procurement agent `أحمد محمود`, and Auditor) strictly based on `currentUniversalRole` validation.
   - Out-of-bounds roles are visually locked and restricted via `disabled` flags, preventing structural transaction contamination.

---

## 11. System Configuration & Progress Tracker

| Module Component | Development Status | Relational Integrity Status | Traceability Audit | Code Status |
| :--- | :---: | :---: | :---: | :---: |
| **Bento Customizer** | 🟢 100% | Compliant (`localStorage`) | Traceable (`user_bento_layouts`) | Stable |
| **Role Simulator** | 🟢 100% | Compliant | Traceable (`currentUniversalRole` logs) | Stable |
| **CRM Isolation** | 🟢 100% | Statically locked (`SO` vs `SS`) | Traceable (`owner` property mapping) | Stable |
| **POS Audit Mode** | 🟢 100% | Statically locked (Read-Only) | Non-Disruptive Audit Layer | Stable |
| **Supply Chain Cycle** | 🟢 100% | Dual role access locks | Traceable signed slips (`هاني الشمري`) | Stable |




