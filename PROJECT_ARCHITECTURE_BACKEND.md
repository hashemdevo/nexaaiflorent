# PROJECT_ARCHITECTURE: Enterprise Backend & Cloud Services Core (البنية التحتية الخلفية والخدمات السحابية) 🌐

## 1. Microservice Service Boundaries & Domain Segregation
The core Express platform serves as the ingress orchestrator (API Gateway simulation), ensuring incoming requests are sanitized, validated, and routed to isolated operational context blocks. 

```
                                      [ Client Request Ingress ]
                                                  │
                                                  ▼
                                      [ Global Ingress Guard ]
                        - Rate Limitor, CORS Allowlist, CSRF, Body-Size Limit
                                                  │
                                                  ▼
                                    [ Global Context Middleware ]
                        - Extracts tenantId, companyId, actorId, traceId
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    ▼                             ▼                             ▼
       [ Tax Compliance Chamber ]     [ Biometric Trust Gateway ]   [ Auditable Event Ledger ]
       - ECDSA Private Key Enclave    - Replay-Prevention (Nonce)   - Merkle-Chained Append-Only
       - Authoritative UTC signing    - SHA-256 PII Template Vault  - WORM Cold Storage Sync
```

---

## 2. API Security Controls & Request Sanitization

### 2.1 Domain Origin Isolation (CORS Restrictions)
CORS is restricted to authorized production domains, company intranets, and official point-of-sale subnet gateways:
```typescript
const CORS_WHITELIST = [
    'https://nexa-ledger.com',
    'https://pos-terminal.nexa-ledger.com',
    'http://localhost:3000' // Development bypass channel
];
```

### 2.2 Global Request Context Mapping
Every incoming request is parsed by a **Context Hydration Middleware**, appending tracking metadata to standard Express Request states:
```typescript
interface GlobalRequestContext {
    requestId: string;         // UUIDv7 Request Identifier
    traceId: string;           // Distributed open-observability trace ID
    tenantId: string;          // Multi-Tenant Isolation Key
    companyId: string;         // Target corporate Legal Entity
    actorId?: string;          // UUID referencing authenticated user session
    ipAddress: string;         // Client Gateway Device IP
}
```

---

## 3. High-Integrity Endpoint Safeguards

### 3.1 Legally-Binding ZATCA Cryptographic Signatures
* **Module Isolation**: Tax signing operations operate strictly server-side inside `ZatcaComplianceEngine`. No private signing keys are allowed to touch cold browse repositories.
* **Timestamp Autonomy**: The engine overrides user-supplied timestamp fields with real-time authoritative server-side UTC counters to satisfy anti-backdating auditing regulations.

### 3.2 Secure Biometric PII Attendance Verification
* **Nonce/Replay Prevention**: Handled via dynamic device authentications requiring a cryptographic `nonce` generated in response to connection pings.
* **Salting of Sensitive Metrics**: Fingerprint templates or facial coordinates must be mapped to random integers and hashes (`fingerprintHash`) salted by a master enterprise HSM key before storage to guarantee absolute PII protection.

---

## 4. Operational Maintenance & Execution Engine

* [x] Express Application setup configured to adapt to dynamic Port overrides (`process.env.PORT || 3000`).
* [x] Integrated strict payload limits (`express.json({ limit: '10mb' })`) preventing Denial-of-Service heap exhaustion attacks.
* [x] Centralized, secure ZATCA Cryptographic sign-off APIs bound to `/api/zatca/sign-invoice`.
* [x] Biometric replay and template hashing architecture in `/api/biometric/attendance`.
