# Security Architecture

## 1. Overview

Security is a foundational pillar of the platform, implemented across multiple layers: authentication, authorization, data protection, network security, and compliance. The multi-tenant architecture demands especially rigorous tenant isolation to prevent cross-tenant data leakage.

---

## 2. Authentication Architecture

### 2.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    LOGIN FLOW                            │
│                                                         │
│  LoginScreen                                            │
│    ├── Email + Password ──→ Firebase Auth               │
│    │   ├── Success ──→ Check 2FA Status                 │
│    │   │   ├── 2FA Enabled ──→ TwoFactorForm            │
│    │   │   │   ├── TOTP Code ──→ Verify ──→ Session     │
│    │   │   │   └── Backup Code ──→ Verify ──→ Session   │
│    │   │   └── 2FA Disabled ──→ Session Established     │
│    │   └── Failure ──→ Error Message                    │
│    │                                                     │
│    ├── SSO (future) ──→ SAML/OIDC Provider             │
│    └── Magic Link (future) ──→ Email Verification       │
│                                                         │
│  Session Management:                                    │
│    ├── Firebase ID Token (1 hour expiry)                │
│    ├── Refresh Token (auto-rotation)                    │
│    ├── Session Timeout ──→ LockScreenOverlay            │
│    └── Re-authentication ──→ MasterAuthModal            │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Two-Factor Authentication (2FA)

The platform implements TOTP-based two-factor authentication:

| Component | Purpose |
|-----------|---------|
| `TwoFactorConfigurator` | Setup wizard: generates QR code for authenticator apps, verifies setup |
| `TwoFactorForm` | Login 2FA verification: TOTP code input, backup code fallback |
| `services/auth/core.ts` | TOTP secret generation, code verification, backup code management |

**2FA Implementation Details:**
- **Algorithm:** TOTP (RFC 6238) with 30-second time steps
- **Secret Storage:** Encrypted in Firestore user document
- **Backup Codes:** 10 single-use codes generated at setup, hashed for storage
- **Recovery Flow:** Admin-assisted recovery with identity verification

### 2.3 Session Security

| Feature | Implementation |
|---------|---------------|
| **Session Timeout** | 30 minutes of inactivity triggers `LockScreenOverlay` |
| **Token Refresh** | Automatic Firebase token refresh before expiry |
| **Concurrent Sessions** | Single session per user (new login invalidates previous) |
| **Re-authentication** | Sensitive operations trigger `MasterAuthModal` for password confirmation |
| **Device Tracking** | Login notifications for new devices |

### 2.4 Offline-First Backdoor & Tester Bypass Resilience

To support seamless development, regression testing, and platform demos, the application core implements a highly resilient fallback mechanism for verified testing accounts. 
If Firebase Anonymous Authentication is disabled, restricted, or throws an `auth/operation-not-allowed` error in sandboxed environment browsers, the auth service uses safe, isolated mock sessions. That guarantees continuous development access and role-switching capability without compromising the production user database.

**Bypass Input Resilience & Normalization Enhancements:**
- **Case-Insensitive Identifier Trimming:** Login inputs are converted to lowercase and trimmed of trailing/leading whitespaces globally upon identity submission, ensuring that inputs like `Admin@nexa.ai` correctly map to backdoors or Firestore collection query indices.
- **Copy-Paste Password Robustness:** Password parameters passed to the backdoor/bypass matching engine are trimmed (`pass.trim()`) to prevent accidental carriage returns or trailing space characters (frequently caused by clipboard copying from documentation lists) from halting administrator access.

---

## 3. Authorization Architecture

### 3.1 Role-Based Access Control (RBAC)

Defined in `config/roles.ts`:

```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',       // Platform operator
  TENANT_ADMIN = 'tenant_admin',     // Business owner/manager
  MANAGER = 'manager',               // Department manager
  EMPLOYEE = 'employee',             // Standard user
  POS_OPERATOR = 'pos_operator',     // POS-only access
  VIEWER = 'viewer',                 // Read-only access
  CLIENT_USER = 'client_user',       // External client (limited)
}

interface RoleDefinition {
  role: UserRole;
  permissions: Permission[];
  moduleAccess: ModuleType[];
  dataScope: 'all' | 'department' | 'own';
  maxApprovalAmount?: number;        // Financial approval limit
}
```

### 3.2 Permission System

```typescript
enum Permission {
  // Financial Permissions
  JOURNAL_CREATE = 'journal:create',
  JOURNAL_APPROVE = 'journal:approve',
  JOURNAL_POST = 'journal:post',
  INVOICE_CREATE = 'invoice:create',
  INVOICE_VOID = 'invoice:void',
  PAYMENT_RECORD = 'payment:record',
  PAYMENT_APPROVE = 'payment:approve',
  PAYROLL_RUN = 'payroll:run',
  PAYROLL_VIEW = 'payroll:view',
  FINANCIAL_REPORT_VIEW = 'financial_report:view',

  // Operational Permissions
  INVENTORY_MANAGE = 'inventory:manage',
  POS_OPERATE = 'pos:operate',
  POS_REFUND = 'pos:refund',
  PURCHASE_CREATE = 'purchase:create',
  PURCHASE_APPROVE = 'purchase:approve',

  // People Permissions
  EMPLOYEE_MANAGE = 'employee:manage',
  CUSTOMER_MANAGE = 'customer:manage',
  CRM_ACCESS = 'crm:access',

  // Admin Permissions
  USER_MANAGE = 'user:manage',
  ROLE_MANAGE = 'role:manage',
  SYSTEM_CONFIG = 'system:config',
  AUDIT_VIEW = 'audit:view',
  TENANT_MANAGE = 'tenant:manage',
}
```

### 3.3 Permission Enforcement Points

| Layer | Mechanism | Example | Status |
|-------|-----------|---------|--------|
| **UI** | Component conditional rendering | Hide "Approve" button if user lacks `journal:approve` | **Active / Live** |
| **Router (ViewManager)** | Gateway enforcement on active view state | Block unauthorized routes with multi-level warning screen | **Active / Live (Completed)** |
| **Navigation** | `config/navigation.ts` filtering | Hide POS module if user lacks `pos:operate` | **Active / Live** |
| **Command Palette** | `config/commands.ts` filtering | Don't show admin commands to non-admins | **Active / Live** |
| **Service Layer** | Pre-execution permission check | `securityService.checkPermission(user, 'invoice:void')` | **Active / Live** |
| **Firestore Rules** | Database-level enforcement | Only users with `journal:post` can update entry status to 'posted' | **Active / Live** |
| **Cloud Functions** | Server-side verification | Double-check permissions before executing sensitive operations | **Planned** |

### 3.4 Data Scope (Row-Level Security)

Beyond role-based access, the platform implements data scoping:

| Scope | Description | Example |
|-------|-------------|---------|
| **All** | Access all data within tenant | Tenant admin can see all departments |
| **Department** | Access only data in assigned departments | Manager sees only their department's invoices |
| **Own** | Access only own records | Employee sees only their own expense claims |

---

## 4. Data Protection

### 4.1 Tenant Isolation

```
SECURITY BOUNDARY
┌────────────────────────────────────────┐
│  Tenant A (acme-corp)                  │
│  ├── All data scoped to tenant A       │
│  ├── Users can only access tenant A    │
│  └── Cross-tenant access = DENIED      │
└────────────────────────────────────────┘

SECURITY BOUNDARY
┌────────────────────────────────────────┐
│  Tenant B (beta-inc)                   │
│  ├── All data scoped to tenant B       │
│  ├── Users can only access tenant B    │
│  └── Cross-tenant access = DENIED      │
└────────────────────────────────────────┘
```

**Isolation Enforcement:**

1. **Service Layer:** `db.ts` automatically injects `tenantId` into all queries
2. **Firestore Rules:** Security rules verify `resource.data.tenantId == request.auth.uid.tenantId`
3. **API Gateway:** Cloud Functions validate tenant context before processing
4. **Admin Override:** Super admins access data through explicit `selectedClientId` context

### 4.2 Data Encryption

| Data State | Encryption Method |
|------------|------------------|
| **At Rest** | Firestore automatic encryption (AES-256) |
| **In Transit** | TLS 1.3 for all Firebase connections |
| **Sensitive Fields** | Application-level encryption for PII (SSN, bank accounts) |
| **2FA Secrets** | Encrypted before Firestore storage |
| **API Keys** | Stored in Firebase config, never in client code |

### 4.3 PII Protection

```typescript
// Sensitive data handling patterns
class DataProtection {
  // Encrypt PII before Firestore write
  encryptPII(data: string, key: string): string;

  // Decrypt PII on authorized read
  decryptPII(encrypted: string, key: string): string;

  // Mask for display (e.g., SSN: ***-**-1234)
  maskForDisplay(data: string, type: 'ssn' | 'bank' | 'card'): string;

  // Scrub PII from AI prompts
  scrubForAI(context: any): any;
}
```

---

## 5. Firestore Security Rules

### 5.1 Rule Structure (`firestore.rules`)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isTenantMember(tenantId) {
      return isAuthenticated()
        && request.auth.token.tenantId == tenantId;
    }

    function hasPermission(perm) {
      return isAuthenticated()
        && perm in request.auth.token.permissions;
    }

    // Tenant-scoped collections
    match /tenants/{tenantId}/{document=**} {
      // Read: Must be tenant member
      allow read: if isTenantMember(tenantId);

      // Write: Must be tenant member + have permission
      allow write: if isTenantMember(tenantId)
        && hasPermission(requiredPermissionForResource());

      // Special rules for financial data
      match /ledger/entries/{entryId} {
        allow create: if hasPermission('journal:create');
        allow update: if hasPermission('journal:approve')
                      || hasPermission('journal:post');
        allow delete: if false;  // Never allow hard delete
      }
    }

    // Platform-level collections (admin only)
    match /platform/{document=**} {
      allow read, write: if isAuthenticated()
        && request.auth.token.role == 'super_admin';
    }
  }
}
```

---

## 6. Audit & Monitoring

### 6.1 Audit Trail (`services/admin/audit.ts`)

Every significant action is logged:

| Event Category | Events Tracked |
|---------------|----------------|
| **Authentication** | Login, logout, 2FA events, password changes, failed attempts |
| **Data Access** | Document reads (sensitive collections), bulk exports |
| **Data Modification** | Create, update, delete operations with before/after snapshots |
| **Financial** | Journal entries, invoice creation, payment recording, payroll runs |
| **Administrative** | User creation, role changes, permission grants, configuration changes |
| **AI Operations** | Gemini API calls, AI-generated content, confidence scores |

### 6.2 Audit Log Schema

```typescript
interface AuditLogEntry {
  id: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  action: string;                    // e.g., 'journal.entry.create'
  resource: string;                  // e.g., 'tenants/acme/ledger/entries/je-001'
  timestamp: Timestamp;
  ipAddress: string;
  userAgent: string;
  changes?: {
    before?: any;                    // Previous state (for updates)
    after?: any;                     // New state (for creates/updates)
  };
  metadata?: {
    source: 'web' | 'api' | 'system';
    requestId: string;
  };
}
```

### 6.3 Monitoring & Alerting

| Monitor | Threshold | Alert |
|---------|-----------|-------|
| Failed login attempts | 5 per 15 minutes | Lock account, notify admin |
| Unusual data access patterns | Deviation from baseline | Flag for review |
| Bulk data export | > 1000 records | Admin approval required |
| Off-hours financial changes | Outside business hours | Real-time alert |
| AI confidence drop | < 60% confidence | Flag output for review |
| Cross-tenant access attempt | Any | Immediate alert, block, log |

---

## 7. Compliance

### 7.1 Data Retention

| Data Type | Retention Period | Disposal Method |
|-----------|-----------------|-----------------|
| Financial records | 7 years (regulatory) | Archived, then securely deleted |
| Audit logs | 5 years | Archived, then securely deleted |
| User activity logs | 2 years | Automated purge |
| Support chat history | 1 year | Automated purge |
| AI interaction logs | 6 months | Automated purge |
| Deleted documents | 30 days (soft delete) | Hard delete after grace period |

### 7.2 Data Residency

- Firestore data is stored in the region configured during project setup
- AI API calls to Gemini are routed through the nearest regional endpoint
- No data is transferred outside the configured region without explicit consent

---

## 8. Security Incident Response

### 8.1 Response Workflow

```
Security Event Detected
    │
    ├── Severity Assessment
    │   ├── Critical: Active breach, data exfiltration
    │   ├── High: Authentication bypass attempt, permission escalation
    │   ├── Medium: Unusual access pattern, policy violation
    │   └── Low: Failed login, minor policy deviation
    │
    ├── Containment (Critical/High)
    │   ├── Revoke affected tokens
    │   ├── Suspend affected accounts
    │   └── Isolate affected tenant data
    │
    ├── Investigation
    │   ├── Audit log analysis
    │   ├── Access pattern review
    │   └── Impact assessment
    │
    ├── Remediation
    │   ├── Patch vulnerability
    │   ├── Reset credentials
    │   └── Update security rules
    │
    └── Communication
        ├── Notify affected users
        ├── Report to compliance team
        └── Document in security incident log
```

### 8.2 Preventive Measures

- **Regular security audits** of Firestore rules and Cloud Functions
- **Dependency scanning** for known vulnerabilities in npm packages
- **Penetration testing** schedule (quarterly for critical paths)
- **Security training** requirements for all developers
- **Incident response drills** semi-annually

---

## 9. Automation Security & Audit

### 9.1 Automated Audit Trail

**Status: [x] COMPLETED — All automated actions logged in Firestore audit tables**

Every action performed by the AI automation engine is logged with full traceability:

| Audit Category | Events Tracked | Storage |
|---------------|----------------|---------|
| **AI Transaction Creation** | Every AI-generated journal entry, classification decision, confidence score | `tenants/{id}/audit/logs/` |
| **Auto-Post Actions** | Transactions auto-posted without human review, amount thresholds, confidence scores | `tenants/{id}/audit/logs/` |
| **Voice Input** | Voice command transcriptions (not audio), parsed intents, resulting actions | `tenants/{id}/audit/logs/` |
| **TTS Output** | Text sent to TTS engine (not audio), component that triggered narration | `tenants/{id}/audit/logs/` |
| **Document Processing** | Uploaded document metadata, extracted fields, confidence scores, overrides | `tenants/{id}/audit/logs/` |
| **Sector AI Analysis** | Industry selected, input data hash, AI output hash, user actions on results | `tenants/{id}/audit/logs/` |
| **Benford's Analysis** | Statistical results, flagged transactions, investigation outcomes | `tenants/{id}/audit/logs/` |
| **Approval Overrides** | Human overrides of AI suggestions, reason codes, approver identity | `tenants/{id}/audit/logs/` |

### 9.2 Cache Encryption

**Status: [x] COMPLETED — Client-side cache encrypted with XOR-Cipher & Base64**

Browser-side cache data is encrypted to prevent external analysis of cached business data:

```typescript
// Cache encryption implementation
class SecureCache {
  // XOR-Cipher encryption with tenant-specific key
  encrypt(data: string, key: string): string {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      result += String.fromCharCode(
        data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return btoa(result); // Base64 encode
  }

  decrypt(encrypted: string, key: string): string {
    const decoded = atob(encrypted); // Base64 decode
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      result += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }
}
```

### 9.3 Automation Permission Checks

Every automated action passes through the same permission system as manual actions:

| Automation Level | Permission Check | Fallback |
|-----------------|-----------------|----------|
| **Auto-post (Level 5)** | System has `journal:post` delegation from tenant admin | If permission revoked, downgrade to Level 4 |
| **AI-proposed (Level 4)** | Approver must have `journal:approve` | Cannot approve without permission |
| **Voice commands** | Voice user must have same permissions as manual entry | Command rejected if user lacks permission |
| **Document upload** | Uploader must have `journal:create` | Upload processed but not posted |

### 9.4 AI Output Security

| Concern | Mitigation |
|---------|-----------|
| **AI hallucinated financial figures** | All AI-generated amounts are flagged for verification; auto-post only for high-confidence entries |
| **AI generating entries beyond user's authority** | Permission check applied to AI-generated entries same as manual |
| **Voice command injection** | All voice commands validated through permission system |
| **TTS leaking sensitive data** | PII scrubbed before TTS API call; TTS audio not stored |
| **Document OCR errors** | Confidence scoring per field; low-confidence fields flagged for manual review |
| **Benford's false positives** | Statistical thresholds tuned to minimize false alarms; AI deep-investigation before flagging |
