# Documentation Architecture

## 1. Overview

The documentation architecture ensures that all aspects of the platform are well-documented for developers, administrators, and end users. Documentation is treated as a first-class artifact alongside code, with the architecture documents serving as the single source of truth for system design decisions.

---

## 2. Documentation Structure

```
docs/
├── architecture/                           # Architecture documentation
│   ├── PROJECT_ARCHITECTURE.md             # Master overview
│   ├── PROJECT_ARCHITECTURE_AI_Gemini.md   # AI integration design
│   ├── PROJECT_ARCHITECTURE_Backend_APIs.md # Backend API design
│   ├── PROJECT_ARCHITECTURE_Database.md    # Database schema design
│   ├── PROJECT_ARCHITECTURE_Deployment.md  # Deployment pipeline
│   ├── PROJECT_ARCHITECTURE_Documentation.md # This file
│   ├── PROJECT_ARCHITECTURE_Frontend.md    # Frontend component design
│   ├── PROJECT_ARCHITECTURE_Integrations.md # Third-party integrations
│   ├── PROJECT_ARCHITECTURE_Networking.md  # Communication patterns
│   ├── PROJECT_ARCHITECTURE_Security.md    # Security design
│   ├── PROJECT_ARCHITECTURE_Server.md      # Server-side architecture
│   ├── PROJECT_ARCHITECTURE_Testing.md     # Testing strategy
│   ├── PROJECT_ARCHITECTURE_UI.md          # UI/UX design system
│   └── security_spec.md                    # Detailed security specification
│
├── api/                                    # API documentation
│   ├── services/                           # Per-service API docs
│   └── cloud-functions/                    # Cloud Function docs
│
├── guides/                                 # User/developer guides
│   ├── getting-started.md                  # New developer onboarding
│   ├── adding-industry.md                  # How to add a new industry
│   ├── adding-ai-module.md                # How to add a Gemini domain module
│   └── deployment-runbook.md              # Deployment procedures
│
└── adr/                                    # Architecture Decision Records
    ├── 001-firebase-over-custom-backend.md
    ├── 002-gemini-over-other-llms.md
    ├── 003-context-over-redux.md
    └── 004-composite-key-multi-tenancy.md
```

---

## 3. Documentation Standards

### 3.1 Code Documentation

**TypeScript/TSX Documentation:**
- All exported functions, classes, and interfaces must have JSDoc comments
- Complex business logic must include inline comments explaining the "why"
- Service methods must document parameters, return types, and thrown errors

```typescript
/**
 * Creates a balanced journal entry and posts it to the ledger.
 *
 * @param data - Journal entry input including lines and metadata
 * @returns The created journal entry with generated ID
 * @throws {ValidationError} If entry is unbalanced (code: VAL-001)
 * @throws {BusinessError} If fiscal period is closed (code: BIZ-002)
 * @throws {PermissionError} If user lacks journal:create permission (code: PERM-001)
 *
 * @example
 * ```typescript
 * const entry = await journalService.createEntry({
 *   date: new Date(),
 *   lines: [
 *     { accountId: 'cash', debit: 1000, credit: 0 },
 *     { accountId: 'revenue', debit: 0, credit: 1000 },
 *   ],
 * });
 * ```
 */
async createEntry(data: JournalEntryInput): Promise<JournalEntry> {
  // Implementation...
}
```

### 3.2 Architecture Documentation Standards

| Standard | Rule |
|----------|------|
| **Format** | Markdown with embedded diagrams (Mermaid or ASCII) |
| **Diagrams** | Architecture diagrams for all major system interactions |
| **Tables** | Use tables for configuration, comparison, and enumeration |
| **Code Examples** | Include TypeScript code examples for key patterns |
| **Decision Records** | All significant design decisions documented with context and rationale |
| **Version** | Architecture docs versioned alongside code |

### 3.3 API Documentation Standards

Each service module must document:

| Section | Content |
|---------|---------|
| **Overview** | What the service does, its role in the system |
| **Public API** | All public methods with parameters, return types, and errors |
| **Dependencies** | Other services this module depends on |
| **Data Contracts** | TypeScript interfaces for input/output types |
| **Events Emitted** | Events this service publishes to the event bus |
| **Events Consumed** | Events this service subscribes to |
| **Error Codes** | All error codes specific to this service |
| **Configuration** | Any module-specific configuration required |
| **Examples** | Usage examples for common scenarios |

---

## 4. Architecture Decision Records (ADR)

### ADR Template

```markdown
# ADR-{NUMBER}: {TITLE}

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXX]

## Context
What is the issue that we're seeing that is motivating this decision or change?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult to do because of this change?

### Positive
- ...

### Negative
- ...

### Risks
- ...
```

### Existing Decisions

| ADR | Decision | Rationale |
|-----|----------|-----------|
| 001 | Firebase over custom backend | Zero server management, built-in auth, real-time sync, pay-per-use |
| 002 | Gemini over other LLMs | Multi-modal, 45+ domain modules, Google ecosystem integration |
| 003 | React Context over Redux | Lightweight, Firebase's real-time model reduces need for global store |
| 004 | Composite key multi-tenancy | Simpler than separate Firebase projects, cost-effective, Firestore-native |

---

## 5. Onboarding Documentation

### 5.1 Developer Onboarding (`getting-started.md`)

Must cover:
1. Prerequisites (Node.js, Firebase CLI, IDE setup)
2. Environment setup (clone, install, Firebase config)
3. Running locally (Vite dev server + Firebase Emulators)
4. Project structure walkthrough
5. Key architectural concepts
6. Development workflow (branching, PRs, testing)
7. Debugging tips (Firebase Emulator UI, React DevTools)

### 5.2 Adding New Industry (`adding-industry.md`)

Steps documented:
1. Create stats component (`components/industry/NewIndustryStats.tsx`)
2. Create operations component (`components/industry/NewIndustryOperations.tsx`)
3. Add Gemini domain module (`services/gemini/newindustry.ts`)
4. Add seed data (`services/core/seeds/newindustry.ts`)
5. Update navigation config (`config/navigation.ts`)
6. Update IndustryRouter component
7. Add to industry enum in `types/enums.ts`
8. Write tests for new components and services

---

## 6. Documentation Maintenance

### 6.1 Review Schedule

| Document | Review Frequency | Owner |
|----------|-----------------|-------|
| Architecture docs | Quarterly | Tech lead |
| API docs | Per release | Service owners |
| Security spec | Semi-annually | Security lead |
| User guides | Per feature release | Product team |
| ADRs | As needed | Decision proposer |

### 6.2 Documentation Quality Checks

- **Accuracy:** Docs reflect current code state (verified in PR reviews)
- **Completeness:** All public APIs documented
- **Consistency:** Terminology and style consistent across all docs
- **Freshness:** No docs older than 6 months without review
- **Accessibility:** All images have alt text, tables have headers
