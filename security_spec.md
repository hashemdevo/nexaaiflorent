# Security Specification

## 1. Scope and Objective

This document defines the comprehensive security specifications and controls for the Nexa platform. The objective is to design, implement, and maintain a highly secure multi-tenant cloud-native application, protecting sensitive financial, operational, and customer data from unauthorized access, disclosure, or manipulation.

---

## 2. Security Principles

### 2.1 Least Privilege

- Users are granted only the minimum permissions required to perform their job functions.
- Default deny: access is denied unless explicitly permitted.
- Permissions are role-based and department-scoped where applicable.

### 2.2 Deep Defense (Multi-Layer Security)

```
┌────────────────────────────────────────────────────────┐
│  LAYER 1: Network & Boundary Security (TLS, CDN)        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  LAYER 2: Authentications Security (Firebase Auth) │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │  LAYER 3: Permissions Security (RBAC/ABAC)  │  │  │
│  │  │  ┌──────────────────────────────────────┐  │  │  │
│  │  │  │  LAYER 4: Application Logic          │  │  │  │
│  │  │  │  ┌────────────────────────────────┐  │  │  │  │
│  │  │  │  │  LAYER 5: Database Security   │  │  │  │  │
│  │  │  │  │  (Firestore Rules, Encryption) │  │  │  │  │
│  │  │  │  └────────────────────────────────┘  │  │  │  │
│  │  │  └──────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### 2.3 Zero Trust Architecture

- Direct client-to-database requests must be fully authenticated, authorized, and validated.
- Cross-tenant requests are impossible; tenant isolation is strictly enforced at every boundary.
- All input data is parsed, validated, and sanitized.
- All activities are fully audited and logged with tamper-proof mechanisms.

---

## 3. Network and Boundary Security

### 3.1 Content Delivery Network (CDN) & Web Application Firewall (WAF)

| Control | Implementation | Purpose |
|---------|---------------|---------|
| **DDoS Protection** | Cloudflare / Firebase CDN | Mitigate volumetric attacks |
| **WAF Rules** | Cloudflare Custom WAF Rules | Block SQL injection, XSS, and common threats |
| **IP Whitelisting** | Configurable per tenant | Custom security rules for enterprise tenants |
| **Rate Limiting** | 100 requests/minute per IP | Prevent brute-force and API abuse |

### 3.2 Transport Layer Security (TLS)

- TLS 1.3 mandated for all connections.
- HTTP Strict Transport Security (HSTS) with `max-age=31536000` (1 year).
- Only secure cryptographic suites allowed; legacy ciphers (such as RC4, 3DES, or MD5 strings) are rejected.
- Direct SSH/unencrypted communication to database or function host is disabled.

---

## 4. Host and Container Security

### 4.1 Serverless Runtime Isolation

- Cloud Functions run in secure gVisor-based sandbox environments.
- Each execution instance is isolated with no shared state or memory.
- Minimalist runtime image with no unnecessary system packages.
- Functions execute with service accounts that follow least privilege principles.

### 4.2 Code and Dependency Auditing

- Automated npm package scanning for vulnerability alerts.
- Source code analysis during compile phases.
- Secret prevention rules in Git to block hardcoded API keys.
- Container image scanning for system package patches.

---

## 5. Application and Data Security

### 5.1 Input Validation & Sanitization

All input data must pass through schema validation before processing:

```typescript
// Validation and Sanitization Strategy
class InputValidator {
  // 1. Schema Validation (Types, Ranges, Required Fields)
  validateSchema<T>(schema: Schema, data: any): T;

  // 2. HTML Sanitization (XSS Prevention)
  sanitizeHTML(input: string): string;

  // 3. Command Injection Prevention (Characters escaping)
  sanitizeCommandLine(input: string): string;

  // 4. NoSQL Injection Prevention (Properties validation)
  sanitizeNoSQLQuery(filters: QueryFilters): QueryFilters;
}
```

### 5.2 Dynamic Client-Side Cache Isolation

To prevent reading sensitive business data from browser sessions:

- In-memory cache variables are strictly isolated in module scope.
- `LocalStorage` and `SessionStorage` items are encrypted using a tenant-specific XOR key.
- Sensitive state variables are cleared on logout or session timeout.

### 5.3 Firestore Security Rules Enforcement

```
Firestore Request
    │
    ├── 1. Context Resolution
    │   ├── Check `request.auth` object
    │   ├── Read custom claims (role, permissions, tenantId)
    │   └── Check IP matching (if geofencing active)
    │
    ├── 2. Operation Evaluation
    │   ├── Read: Is tenantId match and has read permission?
    │   ├── Create: Is data payload structured and has write permission?
    │   └── Update: Is current status allows edits?
    │
    └── 3. Action Enforcement
        ├── Rule passes → execute query/update
        └── Rule fails → throw "Missing or insufficient permissions"
```

---

## 6. Access Control and Identity Management

### 6.1 Authentication Hardening

- Minimum password complexity: 8+ characters, mixed case, numbers, special characters.
- Account lockout policy: 5 failed attempts locks account for 15 minutes.
- No password sharing; unique accounts required for all employees.
- Automatic session termination on user password reset.

### 6.2 Multi-Factor Authentication (MFA)

- Mandatory MFA setup for SUPER_ADMIN and TENANT_ADMIN roles.
- OTP verification enforced on actions exceeding $50,000.
- Optional SMS-based fallback (with additional subscription controls).
- Recovery keys generated only once during initial setup.

### 6.3 Admin Access Audit

Actions on any administrative route require:
1. Re-authentication confirmation (MasterAuthModal).
2. Explicit reason logging for audit tracking.
3. Elevated role check in the authenticated claims token.

---

## 7. Audit, Monitoring, and Compliance

### 7.1 Security Audit Requirements

| Attribute | Requirements |
|-----------|--------------|
| **Audit Coverage** | Login, login failures, 2FA setup, record deletion, role modification, PII reads, database migrations |
| **Audit Storage** | Isolated `audit/logs/` collection, read-only for tenant users, non-deletable |
| **Log Format** | Structured JSON with IP, Browser, Time, User, Action, Affected Resource |
| **Alerting** | Real-time Slack/Email alerts for critical administrative operations |

### 7.2 Data Destruction & Retention

- Hard delete commands physically delete the underlying Firestore document.
- Associated bucket objects in Cloud Storage are deleted along with document links.
- Soft-deleted items are automatically purged after 30 days.
- Deleting an entire tenant triggers an export of all data, followed by sweeping deletion of all matching subcollections.
