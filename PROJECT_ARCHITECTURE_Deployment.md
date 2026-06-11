# Deployment Architecture

## 1. Overview

The platform uses a **serverless deployment model** on Google Cloud Platform (GCP), leveraging Firebase Hosting for the frontend and Cloud Functions for the backend. The deployment pipeline is designed for continuous delivery with zero-downtime releases, automated testing, and environment isolation.

---

## 2. Environment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                            │
│  Firebase Project: {project}-prod                        │
│  ├── Firebase Hosting (frontend)                         │
│  ├── Cloud Functions (backend)                           │
│  ├── Firestore (primary database)                        │
│  ├── Cloud Storage (file attachments)                    │
│  └── Firebase Auth (authentication)                      │
│  Region: us-central1 (or tenant-proximity optimized)     │
│  Custom Domain: app.platform.com                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    STAGING                               │
│  Firebase Project: {project}-staging                     │
│  ├── Mirror of production architecture                   │
│  ├── Seeded with anonymized production data              │
│  └── Custom Domain: staging.platform.com                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    DEVELOPMENT                            │
│  Firebase Project: {project}-dev                         │
│  ├── Local Firebase Emulator Suite                       │
│  ├── Hot-reloading via Vite dev server                   │
│  └── Demo data seeded via seeder.ts                      │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Build Pipeline

### 3.1 Build Process

```
Source Code (Git)
    │
    ├── 1. Install Dependencies
    │   └── npm ci (clean install from lock file)
    │
    ├── 2. Lint & Type Check
    │   ├── ESLint (code quality)
    │   └── TypeScript compiler (type checking)
    │
    ├── 3. Unit Tests
    │   └── Vitest (service layer, utilities)
    │
    ├── 4. Build Frontend
    │   └── vite build (production bundle)
    │       ├── Code splitting by module
    │       ├── Tree shaking
    │       ├── Asset optimization
    │       └── Source map generation
    │
    ├── 5. Build Cloud Functions
    │   └── tsc + webpack (function bundles)
    │
    ├── 6. Integration Tests
    │   └── Firebase Emulator Suite
    │
    └── 7. Deploy
        ├── firebase deploy --only hosting
        ├── firebase deploy --only functions
        ├── firebase deploy --only firestore:rules
        └── firebase deploy --only storage
```

### 3.2 Vite Build Configuration (`vite.config.ts`)

Key build optimizations:

- **Manual chunks:** Service modules split into separate chunks for optimal caching
- **Dynamic imports:** Industry-specific components loaded on demand
- **CSS code splitting:** Styles extracted per chunk
- **Asset inlining:** Small assets inlined as base64
- **Tree shaking:** Unused code eliminated in production

---

## 4. Deployment Strategies

### 4.1 Frontend Deployment (Firebase Hosting)

| Strategy | Use Case | Rollback |
|----------|----------|----------|
| **Standard** | Regular releases | `firebase hosting:channel:deploy preview` → rollback via channel |
| **Preview Channels** | Feature branches | Auto-expiring preview URLs for QA |
| **Canary** | High-risk changes | Deploy to 10% of traffic, monitor, then full rollout |

### 4.2 Backend Deployment (Cloud Functions)

| Strategy | Use Case | Rollback |
|----------|----------|----------|
| **Standard** | Most releases | Redeploy previous version |
| **Gradual** | Critical function changes | Traffic percentage migration |
| **Blue-Green** | Major function refactors | Two versions, switch traffic atomically |

### 4.3 Database Deployments

| Change Type | Strategy | Impact |
|-------------|----------|--------|
| **New collection** | Additive, non-breaking | Zero downtime |
| **New fields** | Additive, defaults provided | Zero downtime |
| **Field removal** | Deprecation period → removal | Two-phase deployment |
| **Security rule changes** | Deployed atomically | Immediate enforcement |
| **Index changes** | Firebase console deployment | Async index building |

---

## 5. CI/CD Pipeline

### 5.1 Pipeline Stages

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  COMMIT  │──→│  BUILD   │──→│  TEST    │──→│  STAGE   │──→│ DEPLOY   │
│          │   │          │   │          │   │          │   │          │
│ Lint     │   │ Bundle   │   │ Unit     │   │ Deploy   │   │ Prod     │
│ Format   │   │ Type     │   │ Integ.   │   │ Staging  │   │ Deploy   │
│ Commit   │   │ Build    │   │ E2E      │   │ Smoke    │   │ Monitor  │
│ checks   │   │ check    │   │ Security │   │ test     │   │ Verify   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
     │              │              │              │              │
   On push       On pass        On pass        On pass     Manual/Auto
   to feature    from prev      from prev      from prev   (tag-based)
```

<h3>5.2 Branch Strategy</h3>

| Branch | Purpose | Deploy Target |
|--------|---------|---------------|
| `main` | Production-ready code | Production (on tag) |
| `develop` | Integration branch | Staging (auto) |
| `feature/*` | Feature development | Preview channel (auto) |
| `hotfix/*` | Emergency fixes | Production (expedited) |
| `release/*` | Release preparation | Staging → Production |

---

## 6. Infrastructure Configuration

### 6.1 Firebase Configuration Files

| File | Purpose | Environment-Specific |
|------|---------|---------------------|
| `firebase-applet-config.json` | Client-side Firebase config | Yes (different project per env) |
| `firebase-blueprint.json` | Firestore schema & rules template | No (shared across envs) |
| `firestore.rules` | Security rules | No (shared, deployed per env) |
| `.firebaserc` | Project alias configuration | Yes (maps aliases to projects) |

### 6.2 Cloud Function Configuration

| Configuration | Method | Purpose |
|--------------|--------|---------|
| **Runtime** | Node.js 20 | Cloud Function runtime |
| **Memory** | 512MB - 2GB (per function) | Based on processing requirements |
| **Timeout** | 60s - 540s (per function) | Based on operation complexity |
| **Min Instances** | 0 (cold start) - 1 (warm) | Cost vs. latency tradeoff |
| **Max Instances** | 100 - 1000 | Concurrency limit |
| **Region** | us-central1 | Co-located with Firestore |

### 6.3 Hosting Configuration

| Setting | Value | Purpose |
|---------|-------|---------|
| **SPA Rewrites** | All routes → `index.html` | Client-side routing |
| **Caching: HTML** | No-cache | Always serve latest HTML |
| **Caching: JS/CSS** | 1 year (content-hashed) | Immutable assets |
| **Caching: Images** | 30 days | Semi-static assets |
| **Headers: CSP** | Strict CSP headers | XSS protection |
| **Headers: HSTS** | max-age=31536000 | Force HTTPS |

---

## 7. Monitoring & Observability

### 7.1 Monitoring Stack

| Tool | Purpose | Metrics |
|------|---------|---------|
| **Firebase Performance** | Frontend performance | FCP, LCP, FID, CLS |
| **Cloud Monitoring** | Backend health | Function leakage, latency, resource bounds |
| **Firestore Dashboard** | Database health | Read/write ops, connection count |
| **Custom Dashboards** | Business metrics | Active users, transaction volume, AI usage |
| **Uptime Checks** | Availability monitoring | 99.9% target, 1-min intervals |

### 7.2 Alerting Rules

| Alert | Condition | Severity |
|-------|-----------|----------|
| Frontend error rate > 1% | 5-min window | High |
| Cloud Function errors > 5% | 5-min window | High |
| Firestore read quota > 80% | Daily | Medium |
| Login failure rate > 10% | 15-min window | Critical |
| AI API latency > 10s | 5-min window | Medium |
| Hosting bandwidth > 90% quota | Daily | Medium |

---

## 8. Rollback Procedures

### 8.1 Frontend Rollback

```bash
# List deployment history
firebase hosting:sites:list

# Rollback to previous version
firebase hosting:channel:deploy preview-rollback --version PREVIOUS_VERSION

# Or redeploy a known-good build
git checkout v1.2.3
npm run build
firebase deploy --only hosting
```

### 8.2 Backend Rollback

```bash
# List function versions
gcloud functions describe FUNCTION_NAME

# Rollback to previous version
gcloud functions deploy FUNCTION_NAME \
  --source=gs://bucket/previous-version.zip

# Or use traffic splitting for gradual rollback
gcloud functions deploy FUNCTION_NAME \
  --traffic-split=0.9=PREVIOUS,0.1=CURRENT
```

### 8.3 Database Rollback

- **Security rules:** Redeploy previous rules version
- **Schema changes:** Run compensating migration (`migrations.ts rollback`)
- **Data corruption:** Restore from daily backup (Cloud Storage)

---

## 9. Release Process

### 9.1 Release Checklist

- [ ] All tests pass in CI pipeline
- [ ] Security audit completed (no new vulnerabilities)
- [ ] Performance benchmarks within acceptable range
- [ ] Database migration scripts tested in staging
- [ ] Release notes prepared
- [ ] Stakeholder sign-off obtained
- [ ] Rollback plan documented
- [ ] Monitoring dashboards reviewed

### 9.2 Versioning

- **Semantic Versioning:** `MAJOR.MINOR.PATCH`
- **MAJOR:** Breaking changes (migration required)
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes (no schema changes)
