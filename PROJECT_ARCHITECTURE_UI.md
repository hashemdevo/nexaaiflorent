# UI/UX Architecture

## 1. Overview

The platform's UI is designed as an **enterprise-grade dashboard application** with a modular, widget-based layout system. The design supports multiple industry verticals, adapts to different user roles, and provides both comprehensive data views and quick-action workflows. The design system prioritizes information density, accessibility, and consistency across all modules.

---

## 2. Design System Foundations

### 2.1 Design Principles

| Principle | Description | Application |
|-----------|-------------|-------------|
| **Progressive Disclosure** | Show essential info first, reveal details on demand | Dashboard KPIs → Drill-down → Full report |
| **Role-Adaptive** | UI adapts based on user role and permissions | Admin sees management tools, employee sees limited view |
| **Industry-Aware** | Default views match user's industry | Restaurant sees table management, construction sees site overview |
| **AI-Enhanced** | AI suggestions integrated naturally into workflows | Inline AI suggestions, not separate AI pages |
| **Consistent** | Same patterns across all modules | Every list has same filter/sort/pagination controls |
| **Accessible** | WCAG 2.1 AA compliance | Keyboard navigation, screen reader support, color contrast |

### 2.2 Color System

```
Primary Palette:
├── Primary Blue:    #2563EB   (Actions, links, focus)
├── Primary Dark:    #1D4ED8   (Hover states)
├── Primary Light:   #DBEAFE   (Backgrounds, selected states)

Semantic Colors:
├── Success Green:   #16A34A   (Positive values, completed, approved)
├── Warning Amber:   #D97706   (Pending, attention needed)
├── Danger Red:      #DC2626   (Errors, overdue, rejected)
├── Info Blue:       #0EA5E9   (Information, tips, AI suggestions)

Neutral Palette:
├── Gray 900:        #111827   (Primary text)
├── Gray 700:        #374151   (Secondary text)
├── Gray 500:        #6B7280   (Muted text, placeholders)
├── Gray 300:        #D1D5DB   (Borders, dividers)
├── Gray 100:        #F3F4F6   (Backgrounds, cards)
├── White:           #FFFFFF   (Card backgrounds, modals)

Financial Colors:
├── Revenue:         #16A34A   (Income, gains)
├── Expense:         #DC2626   (Costs, losses)
├── Neutral:         #6B7280   (Transfers, adjustments)
```

### 2.3 Typography

| Element | Font | Size | Weight | Usage |
|---------|------|------|--------|-------|
| H1 | Inter | 30px | Bold | Page titles |
| H2 | Inter | 24px | Semibold | Section headers |
| H3 | Inter | 20px | Semibold | Card titles, modal headers |
| H4 | Inter | 16px | Medium | Widget headers |
| Body | Inter | 14px | Regular | Primary content |
| Small | Inter | 12px | Regular | Captions, labels, metadata |
| Mono | JetBrains Mono | 14px | Regular | Currency amounts, codes |

### 2.4 Spacing System

```
Base unit: 4px
├── xs:  4px   (Icon padding, tight spacing)
├── sm:  8px   (Within-component spacing)
├── md:  16px  (Between-component spacing)
├── lg:  24px  (Section spacing)
├── xl:  32px  (Page section spacing)
└── 2xl: 48px  (Major section separation)
```

---

## 3. Layout Architecture

### 3.1 App Shell Layout

```
┌─────────────────────────────────────────────────────────┐
│  ┌──────┐  ┌──────────────────────────────────────────┐ │
│  │      │  │  DashboardHeader                         │ │
│  │      │  │  [Logo] [Search] [Notifications] [User]  │ │
│  │      │  ├──────────────────────────────────────────┤ │
│  │      │  │                                          │ │
│  │      │  │  Main Content Area                       │ │
│  │ Side │  │                                          │ │
│  │ bar  │  │  ┌──────────┐  ┌──────────┐  ┌───────┐ │ │
│  │      │  │  │  Widget  │  │  Widget  │  │ Widget│ │ │
│  │      │  │  └──────────┘  └──────────┘  └───────┘ │ │
│  │      │  │  ┌──────────┐  ┌──────────────────────┐ │ │
│  │      │  │  │  Widget  │  │      Widget           │ │ │
│  │      │  │  └──────────┘  └──────────────────────┘ │ │
│  │      │  │                                          │ │
│  └──────┘  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Sidebar Navigation (`components/layout/Sidebar.tsx`)

| State | Width | Behavior |
|-------|-------|----------|
| **Expanded** | 256px | Full icon + label navigation, grouped by category |
| **Collapsed** | 64px | Icon-only with tooltip on hover |
| **Mobile** | Hidden | Slide-out drawer with hamburger toggle |

**Sidebar Structure (from `config/navigation.ts`):**

```
Dashboard
├── Financial
│   ├── Ledger
│   ├── Banking
│   ├── Invoices
│   ├── Bills
│   ├── Expenses
│   └── Budgets
├── Operations
│   ├── Inventory
│   ├── POS
│   ├── Manufacturing
│   ├── Projects
│   └── Quality
├── People
│   ├── CRM
│   ├── HRM
│   └── Payroll
├── Intelligence
│   ├── Analytics
│   ├── Simulation
│   └── AI Insights
├── Tools
│   ├── Communication
│   ├── Import/Export
│   └── Purchasing
└── Settings
    ├── Team
    ├── Subscription
    └── Activity Log
```

### 3.3 Content Area Patterns

#### Dashboard Grid Pattern
```
┌──────────────────────────────────────────┐
│  DashboardHeader (full width)            │
├────────┬────────┬────────┬──────────────┤
│ Stat   │ Stat   │ Stat   │ Stat         │
│ Card   │ Card   │ Card   │ Card         │
├────────┴────────┴────────┴──────────────┤
│  Financial Overview (full width chart)   │
├──────────────────┬───────────────────────┤
│  Recent Trans.   │  Cash Flow Forecast   │
│  (half width)    │  (half width)         │
├──────────────────┴───────────────────────┤
│  Expense Breakdown + Top Products        │
└──────────────────────────────────────────┘
```

#### List View Pattern
```
┌──────────────────────────────────────────┐
│  [Search] [Filters] [Sort] [+ New]      │
├──────────────────────────────────────────┤
│  Column Headers (sortable)               │
├──────────────────────────────────────────┤
│  Row 1 (clickable → detail/expand)       │
├──────────────────────────────────────────┤
│  Row 2                                   │
├──────────────────────────────────────────┤
│  Row 3                                   │
├──────────────────────────────────────────┤
│  Pagination: [< 1 2 3 ... 10 >]         │
└──────────────────────────────────────────┘
```

#### Form Pattern
```
┌──────────────────────────────────────────┐
│  Form Header (title + actions)           │
├──────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐      │
│  │  Field Group  │  │  Field Group  │     │
│  │  Label        │  │  Label        │     │
│  │  [Input]      │  │  [Select]     │     │
│  │  Helper text   │  │  Helper text  │     │
│  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────┐     │
│  │  Full-width field                │     │
│  └──────────────────────────────────┘     │
├──────────────────────────────────────────┤
│  [Cancel]  [Save Draft]  [Submit]        │
└──────────────────────────────────────────┘
```

---

## 4. Component Library

### 4.1 Common Components

| Component | Purpose | Variations |
|-----------|---------|------------|
| **StatCard** | Single KPI display | Trend (up/down), comparison (vs. last period), mini-chart |
| **TrendChart** | Time-series visualization | Line, area, bar variants |
| **DataTable** | Tabular data display | Sortable, filterable, paginated, expandable rows |
| **FormInput** | Input field wrapper | Text, number, date, select, multi-select, textarea |
| **Modal** | Overlay dialog | Confirmation, form, detail view, multi-step |
| **Toast** | Temporary notification | Success, error, warning, info |
| **Badge** | Status indicator | Dot, label, count, colored variants |
| **Avatar** | User/entity image | Image, initials fallback, size variants |
| **Dropdown** | Menu overlay | Single select, multi select, with search |
| **CommandPalette** | Quick action search | Keyboard shortcut, fuzzy search |

### 4.2 Domain-Specific Components

| Component | Domain | Purpose |
|-----------|--------|---------|
| `JournalLine` | Finance | Single debit/credit line in journal entry |
| `InvoicePaper` | Sales | Invoice document preview/renderer |
| `ReceiptTemplate` | POS | Printable receipt layout |
| `CartSidebar` | POS | Shopping cart with item management |
| `AssetCard` | Assets | Fixed asset summary card |
| `DepreciationTable` | Assets | Asset depreciation schedule |
| `KPIGrid` | Analytics | Configurable KPI widget grid |
| `ModelArena` | Simulation | Side-by-side model comparison |

---

## 5. Interaction Patterns

### 5.1 Command Palette (`Ctrl+K`)

The command palette provides universal quick access:

```
┌──────────────────────────────────────────┐
│  🔍 Search commands, modules, data...    │
├──────────────────────────────────────────┤
│  ⚡ Quick Actions                         │
│  ├── New Invoice          Ctrl+N         │
│  ├── New Journal Entry    Ctrl+J         │
│  ├── Add Customer         Ctrl+Shift+C   │
│  └── Run Report           Ctrl+R         │
│  📊 Recent Items                          │
│  ├── Invoice #1234 (Acme Corp)           │
│  ├── JE-2024-0089 (Payroll)             │
│  └── Customer: Beta Inc                  │
│  🔀 Navigation                            │
│  ├── Go to Dashboard                     │
│  ├── Go to Ledger                        │
│  └── Go to Analytics                     │
└──────────────────────────────────────────┘
```

### 5.2 AI Interaction Patterns

| Pattern | Component | Trigger | Response |
|---------|-----------|---------|----------|
| **Inline Suggestion** | `AIInputForm` | User pauses typing | AI suggestion appears inline, tab to accept |
| **Side Panel Analysis** | `AIInsights` | User opens insights | AI analysis in collapsible side panel |
| **Modal Review** | `AIReviewForm` | User submits transaction | AI review modal with suggestions |
| **Widget Insights** | `AIAlerts` | Dashboard load | AI-generated alerts in notification center |
| **Conversational** | `SupportChat` | User types question | AI-powered chat response |

### 5.3 Workflow Patterns

| Pattern | Example | Components |
|---------|---------|------------|
| **Create → Review → Approve** | Journal entries | `ManualJournalForm` → `AIReviewForm` → approval flow |
| **Browse → Select → Act** | Customer management | List → Detail → Action menu |
| **Input → Categorize → Record** | Transactions | `TransactionInput` → AI classification → `JournalLine` |
| **Scan → Verify → Adjust** | Inventory | `InventoryScanner` → verification → adjustment |
| **Configure → Run → Analyze** | Simulation | `SimulationLab` → `SimulationChart` → `VariableExplainer` |

---

## 6. Responsive Design

### 6.1 Breakpoint Behavior

| Screen | Width | Layout Changes |
|--------|-------|----------------|
| **Desktop** | > 1024px | Full sidebar, multi-column grid, all features |
| **Tablet** | 640-1024px | Collapsible sidebar, 2-column grid, simplified charts |
| **Mobile** | < 640px | Bottom navigation, single column, card-based layout, swipe actions |

### 6.2 Mobile Adaptations

| Feature | Desktop | Mobile |
|---------|---------|--------|
| **Navigation** | Sidebar | Bottom tab bar + hamburger menu |
| **Data tables** | Full columns | Card-based list with expand |
| **Forms** | Multi-column | Single column, step-by-step |
| **Charts** | Full interactive | Simplified, tap for details |
| **POS** | Full terminal | Streamlined mobile POS |
| **Search** | Command palette | Search bar with suggestions |

---

## 7. Theming System

### 7.1 Theme Configuration (`services/system/themes.ts`)

```typescript
interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;           // Brand color
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  density: 'compact' | 'default' | 'comfortable';
  fontSize: 'small' | 'default' | 'large';
}
```

### 7.2 Dark Mode

Dark mode follows the system preference with manual override:

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | #FFFFFF | #111827 |
| Card | #F9FAFB | #1F2937 |
| Text | #111827 | #F9FAFB |
| Border | #E5E7EB | #374151 |
| Primary | #2563EB | #3B82F6 |
| Success | #16A34A | #22C55E |
| Danger | #DC2626 | #EF4444 |

---

## 8. Accessibility

### 8.1 WCAG 2.1 AA Compliance

| Requirement | Implementation |
|-------------|---------------|
| **Color Contrast** | Minimum 4.5:1 for text, 3:1 for large text |
| **Keyboard Navigation** | All interactive elements focusable and operable via keyboard |
| **Screen Reader** | Semantic HTML, ARIA labels, live regions for dynamic content |
| **Focus Management** | Visible focus indicators, logical tab order, focus trapping in modals |
| **Error Identification** | Form errors associated with fields, announced to screen readers |
| **Consistent Navigation** | Same navigation pattern across all pages |

### 8.2 Financial Accessibility

- **Currency formatting:** Locale-aware, with explicit currency symbols
- **Color independence:** Financial status (gain/loss) not conveyed by color alone
- **Data tables:** Proper header associations, sortable column announcements
- **Charts:** Text alternatives or data tables for all visualizations

---

## 9. Sector AI Analyst UI Design

### 9.1 SectorAiAnalyst Component Layout

**Status: [x] COMPLETED — Embedded in Dashboard**

```
┌──────────────────────────────────────────────────────────┐
│  Nexa Smart Industry Copilot            [Sector ▼]       │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Input Form (auto-generated for selected sector)  │   │
│  │  ├── Pre-filled demo data for zero-error testing  │   │
│  │  ├── Industry-specific fields                     │   │
│  │  └── [Analyze] button (gradient green-to-blue)    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  AI Results Panel                                 │   │
│  │  ├── Risk Assessment (color-coded: green/amber/red)│   │
│  │  ├── Structured Metrics (table format)            │   │
│  │  ├── Natural Language Summary (narrative text)    │   │
│  │  └── [🔊 Play Narration] (TTS voice playback)    │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### 9.2 Sector-Specific Visual Identity

Each industry sector has a visual theme accent within the SectorAiAnalyst:

| Sector | Accent Color | Icon |
|--------|-------------|------|
| Construction | Orange (#D97706) | HardHat |
| Retail | Purple (#7C3AED) | ShoppingCart |
| Medical/Hospital | Red (#DC2626) | Heart |
| Legal | Blue (#2563EB) | Scale |
| Education | Green (#16A34A) | GraduationCap |
| Logistics | Cyan (#0891B2) | Truck |
| Restaurant/Hospitality | Amber (#F59E0B) | UtensilsCrossed |
| Generic/Accounting | Slate (#475569) | Calculator |

---

## 10. Voice UI Design Patterns

### 10.1 Voice Input Visual States

| State | Visual | Animation |
|-------|--------|-----------|
| **Idle** | Microphone icon (gray) | None |
| **Listening** | Pulsing red circle with waveform | `animate-pulse` (1.5s) |
| **Processing** | Spinning loader | `animate-spin` |
| **Success** | Green checkmark | Fade in |
| **Error** | Red X with message | Shake animation |

### 10.2 TTS Playback Visual States

| State | Visual | Animation |
|-------|--------|-----------|
| **Idle** | Volume2 icon (transparent background) | None |
| **Playing** | Volume2 icon (blue glow background) | `animate-pulse` (2s) |
| **Loading** | Volume1 icon with spinner | `animate-spin` |

### 10.3 Transaction Director Modal Layout

```
┌──────────────────────────────────────────────────────────┐
│  Add Transaction                                    [×]  │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  [Manual Entry]  [Upload Document]  [AI Accountant]     │
│  ─────────────────────────────────────────────────────── │
│                                                          │
│  ┌─ Upload Document Tab ──────────────────────────────┐ │
│  │                                                     │ │
│  │  [Choose File] (purple button)                      │ │
│  │  Selected: WhatsApp Image 2026-04-30.jpeg           │ │
│  │                                                     │ │
│  │  Cost Center (optional)                             │ │
│  │  [None ▼]                                           │ │
│  │                                                     │ │
│  │  [Submit ⟳] (gradient green-to-blue, loading)      │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─ AI Accountant Tab ────────────────────────────────┐ │
│  │                                                     │ │
│  │  [🎤 Click to speak or type here...]               │ │
│  │                                                     │ │
│  │  AI Review:                                         │ │
│  │  ┌──────────────────────────────────────────────┐  │ │
│  │  │ Journal Entry: Debit Cash $5,000             │  │ │
│  │  │                Credit Revenue $5,000         │  │ │
│  │  │ Confidence: 94%  [🔊 Read Aloud]             │  │ │
│  │  └──────────────────────────────────────────────┘  │ │
│  │                                                     │ │
│  │  [Approve]  [Modify]  [Reject]                      │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 11. Dark Luxury Theme (Nexa Design Language)

### 11.1 Theme Characteristics

The platform uses a **dark luxury theme** with glass-morphism effects that create a premium, professional aesthetic:

| Element | Style | Implementation |
|---------|-------|---------------|
| **Background** | Deep dark (#0F1117) | Full-page dark background |
| **Cards** | Glass morphism | `bg-white/5 backdrop-blur-xl border border-white/10` |
| **Buttons (Primary)** | Gradient (green-to-blue) | `bg-gradient-to-r from-green-500 to-blue-600` |
| **Buttons (Secondary)** | Transparent with border | `bg-white/5 border border-white/10 hover:bg-white/10` |
| **Text (Primary)** | White (#F9FAFB) | High contrast on dark backgrounds |
| **Text (Secondary)** | Gray (#9CA3AF) | Muted for labels and descriptions |
| **Icons** | Lucide React | Smooth, consistent iconography |
| **Charts** | Semi-transparent fills | `fill-opacity: 0.2` with solid lines |
| **Modals** | Dark overlay + glass card | `bg-black/50 backdrop-blur-sm` overlay |

### 11.2 Glass Morphism Component Pattern

```typescript
// Standard glass card component styling
const glassCardClasses = cn(
  "bg-white/5 backdrop-blur-xl border border-white/10",
  "rounded-2xl p-6 shadow-xl",
  "transition-all duration-300",
  "hover:bg-white/[0.07] hover:border-white/20"
);

// Glass button (primary)
const glassButtonPrimary = cn(
  "bg-gradient-to-r from-green-500 to-blue-600",
  "text-white font-medium rounded-xl px-4 py-2",
  "hover:from-green-600 hover:to-blue-700",
  "transition-all duration-200 shadow-lg hover:shadow-xl"
);
```

### 11.3 Animation Library

| Animation | Usage | Implementation |
|-----------|-------|---------------|
| **Pulse** | Active AI processing, voice recording | `animate-pulse` (Tailwind) |
| **Spin** | Loading states | `animate-spin` (Tailwind) |
| **Fade** | Component mount/unmount | CSS transition `opacity-0 → opacity-100` |
| **Slide** | Sidebar, modals | CSS transform `translate-x` |
| **Scale** | Button press feedback | `hover:scale-105 active:scale-95` |
| **Glow** | Active/focused elements | `shadow-lg shadow-blue-500/20` |

---

## 12. Bento Grid Customization (Flexible Dashboard Layout)

### 12.1 Overview
The dashboard features an interactive Bento Grid Layout Customization engine, enabling users to adapt the workspace structure to their personal operation workflow. It introduces drag-and-drop, visibility controls, and column span sizing toggles.

### 12.2 Sizing Structure & Grid Mapping
Each Bento widget is linked to a column span system utilizing a 12-column CSS Grid:
* **Compact (1/3 Width)**: Map to classes `lg:col-span-4`. Good for cards or simple KPIs.
* **Medium (1/2 Width)**: Map to classes `lg:col-span-6`. Ideal for smaller charts or details.
* **Wide (2/3 Width)**: Map to classes `lg:col-span-8`. Perfect for complex interactive tables and larger line charts.
* **Full (1/1 Width)**: Map to classes `lg:col-span-12`. Optimized for dense ledger tables and main revenue flow charts.

### 12.3 Customizer State Operations
* **Drag-and-Drop Repositioning**: Built-in HTML5 canvas drag handle (`GripVertical`) that updates layout order indexes on hover to provide smooth, library-independent performance on React 19.
* **Direct Directional Shifting**: Sequential prev/next buttons for direct keyboard-style coordinate manipulation.
* **Visibility Filtering**: Independent toggle triggers that flag visibility variables without deleting layout metadata. Hidden widgets are displayed in developer workspace lists with custom dashed hatched templates, allowing instant "Show" switches.
* **Client-Side Persistence**: Synchronized state structures automatically written to `localStorage` under `nexa_dashboard_bento_config`. Includes structural fallback logic to sync newly introduced metrics with existing cached items.
* **Direct Cloud Synchronization**: Custom layout adjustments are automatically synchronized in near-real-time to Cloud Firestore in the `user_bento_layouts` sub-collection, linked dynamically to the authenticated user's `currentUserIdentity`. This guarantees a completely aligned dashboard structure instantly across all of the user's logged-in devices. On logouts or default resets, database records are safely deleted or unified to baseline configurations.

---

## 13. Official Document Print Formatting & Corporate Letterhead

### 13.1 Print Mode Contextual Differentiation
The workspace supports two distinct print-mode behaviors configured via global `@media print` directives and dynamic DOM class targeting:
1. **POS Receipt Thermal Mode**: Active when the body contains the `print-receipt-mode` class. Isolates and prints only the `printable-receipt` block in 80mm cash register styling, hiding all other DOM segments.
2. **Corporate Executive Report Mode**: Fallback active mode when printing standard system reports, financial overviews, ledgers, or invoices. Adapts the glassmorphic dark-luxury scheme into a high-contrast print layout optimized for physical A4 papers or PDF records.

### 13.2 Interactive Letterhead Branding System (الهيدليتر الرسمي)
A digital high-fidelity corporate letterhead is dynamically injected at the top of general report print layouts:
* **Arabic Header Segment**: Displays standard enterprise metadata in beautiful Arabic layout (e.g., "نكسـا ليدجـر للأنظمة المحاسبية", registration CRN 1010345722, Tax Unified ID, HQ Riyadh).
* **English Header Segment**: Parallel English translation branding ("NEXA LEDGER SYSTEMS", "Nexa Financial Solutions & AI Corp.", support email & main website URL).
* **Corporate Seal of Authority**: Centered circular geometric branding mark representing executive validation.
* **Separating Horizon Bar & Metadata Track**: Dual borders styled with executive slate gradients with unified document date timestamps showing both Gregorian and local Islamic Lunar calendars alongside systemic auditing tags.

### 13.3 CSS Media Overrides for Ink Economy
* **Color Schemes**: Disables deep cosmic black layers, radial backgrounds, card transparency panels, and glowing borders. Cards automatically render as clean white paper slabs with compact borders (`border-slate-300`). Text is converted to deep slate charcoal or black.
* **Layout Re-anchoring**: Automatically forces sidebar menus, interactive controls, buttons, widgets, floating tools, support widgets, and command boxes to `display: none !important`. Forces the main container width to fill the page cleanly with 12mm bounding margins.
* **Chart Adaptive Processing**: Recharts elements automatically use black-and-white print adjustments (using `filter: grayscale(100%)`) to ensure charts do not smudge or fade during monochromatic physical output.

---

## 14. Developer Backend Interface (اللوحة الخلفية للمطور)

### 14.1 Concept and Purpose (مبدأ كل صفحة لها صفحة باك)
To ensure immediate transparency into the data loop and enforce structural integrity, the platform includes a floating developer console mapped directly to the active front-end screen. Users can view the system's "backside" specs, direct database tables, active model schemas, and run diagnostics in one click.

### 14.2 Structural Elements of the Backend Board
1. **Interactive Database Canvas**: Lists real documents inside Firestore. Allows live editing, querying, and deletion of individual documents.
2. **Schema Property Specification**: Displays standard static definitions, field typings, and audit requirements.
3. **Double-entry Seeder Controls**: Enables instant database seeding with high-quality sample transactions directly linked to the current screen context.
4. **API and Security Mapping Trace**: Publicly identifies the active express services, Firestore endpoints, and system rules governing security.

---

## 15. Role-Adaptive Dashboard Widgets Configuration (إعدادات الواجهات المتكيفة مع الأدوار)

为了实现 "Need-to-Know Basis" 核心安全原则与 Contextual Dashboards，系统实现了双通道独立的 Partner Ledger UI 组件。

### 15.1 Personal Space: Partner Ledger Widget (`PartnerLedgerWidget.tsx`)
* **Target Audience**: Logged-in `OWNER` and `PARTNER` roles.
* **Layout Design**: Single-owner centric workspace containing:
  * Personal balance status display cards.
  * Debit (withdrawn) and Credit (deposited capital) double-entry chronological table.
  * Direct manual ledger entry deposit and withdrawal creation forms for personal balancing.
* **Access Control**: Strictly filters server response queries to prevent a partner from viewing another partner's current ledger activity in their personal space.

### 15.2 Financial Administration Space: Partner Oversight Widget (`PartnerOversightWidget.tsx`)
* **Target Audience**: `CEO`, `CFO`, `CHIEF_ACCOUNTANT`, `ACCOUNTANT`, `ADMIN`, `SYSTEM_ADMIN` roles.
* **Layout Design**: Balanced dashboard grid containing:
  * Global corporate compliance metrics (active partners count, total outstanding capital debts, total credit reserves, limit-breaching partners count).
  * Unique Partners Compliance & Audit Overview table detailing name, email, running balance, total deposits, total withdrawals, and limit flags.
  * Dynamic in-place ledger audit drilling system: selecting any partner instantly fetches their individual transactional running ledger on the fly, eliminating structural overview noise.


## 16. Hierarchical Leave Approval UI Layout (`LeaveManagement.tsx`)

### 16.1 Design Concept (مكتب الموظف والمدير الموحد)
To support hierarchical approvals and testing without continuous logout-login overhead, the Leave Management interface uses a unified responsive workspace featuring a specialized **Interactive Role Simulator Toolbar** at the top. This toolbar lets users simulate different positions in the hierarchy on the fly.

### 16.2 Essential Layout Zones
1. **Simulation Toolbar (لوحة محاكاة الهياكل الإدارية)**:
   * Provides rapid toggles to simulate being an `OWNER`, `CHIEF_ACCOUNTANT`, `ACCOUNTANT`, `CASHIER`, or `KITCHEN_STAFF`.
   * Displays immediate status metadata: WHO they are simulating, their role, and their target supervisor.
2. **Current Approvals Inbox (صندوق طلبات الاعتماد الواردة)**:
   * Dynamic list that filters and displays pending requests only if the simulated user is authorized to approve them (e.g., Accountant reviews Cashier, Chief Accountant reviews Accountant, Owner reviews Chief Accountant).
   * Features high-contrast Amber indicators ("بانتظار الرتبة الأعلى").
   * Integrates instant interactive controller buttons: Accept (ربط بالرواتب) or Reject.
3. **Personal Leave Ledger (طلبات إجازاتي الشخصية)**:
   * Chronological list showing requests submitted under the active role.
   * Tells the user which higher authority currently has their request on hold (e.g., pending review by General Accountant).
4. **Interactive Balance Card (رصيد إجازاتي المدفوعة)**:
   * High-contrast stat blocks showing paid leaves remaining (e.g., 25 annual days, 12 sick days).
   * Displays a visual flowchart representing the complete path of higher authorization.
5. **Interactive Request Dialog (تقديم التماس إجازة هيكلي جديد)**:
   * Pop-up form that automatically maps the next supervisor to the request dynamically based on the active role.
   * Integrates an auto-calendar that computes final work offset days instantly.
   * Warns the employee about the payroll financial impact if the requested type is an unpaid leave (UNPAID).


