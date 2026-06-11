# PROJECT_ARCHITECTURE: Enterprise Audit trail Compliance & Data Immutability (سجل تدقيق الأمان وعصمة البيانات المرجعية) 🛡️

## 1. Compliance Core & Immutability Standard (معايير النزاهة وعصمة السجلات)
In high-grade sovereign financial frameworks, Audit Trails are not log files—they are legally recognized proof representing dynamic activities across the application. Nexa Ledger enforces an **Append-Only Immutable Ledger Policy**. 
* **Zero Physical Deletes**: Once written to the transactional database, audit logs contain a tamper-proof cryptographic sequence. Physical deletion or inline field mutation triggers a compliance tripwire, signaling an emergency database isolation event.
* **Non-Repudiation Model**: Every administrative or ledger action is signed and bound using a rolling SHA-256 integrity hash, forming a linear secure cryptographic chain.

---

## 2. Dynamic Archival Architecture & WORM Simulation (مسار الأرشفة المشفرة)

```
 [ Active Audit Core ] ─────► [ Verification Checkpoint ] ─────► [ Archival Ledger Chain ]
  - PostgreSQL (HOT)           - Check HMAC Checksum            - Cryptographic Partition
  - 100% Queryable             - Compare Anchor Hash            - Cold Storage Bucket WORM
```

### 2.1 The Two-Stage Migration Protocol
Archiving is managed strictly server-side by the `DataArchiver` service:
1. **The Integrity Verification Step**: Before pruning hot memory, the engine re-calculates the cumulative chain of previous SHA-256 logs to verify that the active partitions were not compromised.
2. **Cold Partition Seal**: Transferred objects are sealed as a serialized string containing both the payload and the calculated cryptographic signature before any rows are physically removed from the operational database.

---

## 3. The Secure Auditable Event Schema (مكونات السجل المالي والأمني)

Every record is fully identified and isolated to avoid cross-tenant pollution:

```ts
export interface SecureAuditEntry {
    id: string;             // UUIDv7 unique transaction block ID
    tenantId: string;       // Strict enterprise isolation bucket
    companyId: string;      // Organization corporate branch
    actorId: string;        // UUID referencing user or terminal device
    entityType: string;     // e.g. "JournalEntry", "Asset", "POSShift"
    entityId: string;       // Referenced record identifier
    action: 'CREATE' | 'UPDATE' | 'AUTHORIZE' | 'REVERSE' | 'ARCHIVE';
    beforeState?: string;   // JSON snapshot of stringified state pre-update
    afterState?: string;    // JSON representation of outcome state
    ipAddress: string;      // Gateway connection IP
    correlationId: string;  // Tracing ID connecting HTTP lifecycle with background queues
    timestamp: string;      // Secure UTC authoritative server clock timestamp
    checksum: string;       // HMAC-SHA256 signature calculated over the record contents
}
```

---

## 4. Verification Framework & Audits Testing (الفحص ومراقبة محاولات التلاعب)

1. **Alteration Resilience**: Any direct attempts to bypass the API gateway and manually edit row values in PostgreSQL are rejected. 
2. **Scheduled Integrity Guard**: Background processes run daily checksum sweeps, validating that:
   $$\text{Checksum}_n = \text{HMAC-SHA256}(\text{Payload}_n \parallel \text{Checksum}_{n-1})$$
   If any discrepancy is found, administrative dashboards flag an `INTRUSION_ALERT_AUDIT_BREACH` inside Firestore.
