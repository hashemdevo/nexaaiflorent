# PROJECT_ARCHITECTURE: Enterprise Authorization & Governance Model (RBAC / ABAC / PBAC) 🔑

## 1. Description
Nexa Ledger implements a **Hybrid Enterprise Authorization Engine** that goes far beyond simple RBAC roles. It is designed to emulate the security rigors of SAP and Odoo, enforcing organizational security boundaries, multi-tenant isolation, dynamic rule inheritance, Separation of Duties (SoD), and real-time permission calculation matrices.

```
                  [ User Context / Credentials / Session JWT ]
                                       │
                                       ▼
                  [ Dynamic Policy Calculation Loop (ABAC/PBAC) ]
                    ├── Tenant Isolation Rules (tenantId Match)
                    ├── Geofencing / Time-window validation
                    └── Branch & Warehouse Scope Boundaries
                                       │
                                       ▼
                  [ Permission Resolution Engine (Conflict Solver) ]
                    ├── Precedence Check (DENY takes Precedence)
                    └── Inheritance Calculation (Parent Org Hierarchy)
                                       │
                                       ▼
                  [ Effective Access Decision: ALLOW / DENY ] 
```

---

## 2. The Core Security Layers (مكونات الحوكمة والصلاحيات)

### 2.1 Permission Resolution Engine (محرك فك تعارض الصلاحيات)
When a user holds multiple composite roles or assignment overrides, Nexa resolves access rights dynamically using a multi-level priority pipeline:
1. **Explicit Deny Precedence (الحظر مقدّم على السماح)**: If any active role, temporary delegation, or regional policy contains an explicit `DENY` for an action, access is instantly short-circuited and blocked, regardless of other positive nested `ALLOW` records.
2. **Hierarchical Node Inheritance (توريث الصلاحيات الهيكلي)**: Permissions cascade along the corporate org structure. A Subsidiary Admin inherits Branch Admin scopes automatically, while custom narrow overrides can be placed at individual branch nodes.
3. **Universal Conflict Resolution Rules**:
   - Explicit Branch-level policy overrides User-level generic presets.
   - Temporary delegation rules decay instantly upon chronological expiration.

### 2.2 Effective Access Calculation (حساب الصلاحية الفعلية الفورية)
Every secured action evaluates a JSON security policy context block dynamically:
```ts
interface SecurityPolicyContext {
    currentUserId: string;
    currentUniversalRole: string;
    tenantId: string;
    companyId: string;
    allowedBranches: string[];
    allowedWarehouses: string[];
    assignedSalesAgentId?: string;
    deviceFingerprintMatched: boolean;
    temporaryDelegationExpiresAt?: string;
}
```
Effective permissions are evaluated on-the-fly (`calculateEffectivePermissions`) combining:
- **Direct Role Scopes (RBAC)**: Basic allowances associated with their general login.
- **Contextual Attribute Policies (ABAC)**: Request parameters such as current geolocation status and working hours bounds.
- **Relational Ownership Policies (PBAC)**: Verification matches (e.g., verifying if a CRM deal's `salesRepresentativeId` specifically matches the user's `employeeId`).

### 2.3 Strict Separation of Duties (SoD - فصل المهام ومنع الاحتيال المحاسبي)
To remain SOX-compliant and pass strict forensic audit controls, Nexa Ledger enforces hard system-level blocks preventing workflow collusion:
* **The Creator-Approver Wall**: An invoice or payment voucher card entered by cashier/accountant `userId_A` can never be certified or approved (transitioned from `DRAFT` to `POSTED`) by the same `userId_A`, regardless of their managerial role.
* **Procurement Splicing**: The purchasing requisition creator (`Procurement Representative`) cannot approve their own goods received slip (`Warehouse Keeper` step).
* **Audit Isolation**: Users holding active audit roles (`AUDITOR`) are statically restricted to read-only scopes. Any transactional write operations (`DbEngine.insert`, `DbEngine.update`) triggered under an Auditor state are immediately aborted at the DB boundary.

### 2.4 Dynamic Data Scope Isolation (عزل نطاق البيانات الجغرافي والوظيفي)
Data is strictly isolated and filtered using a zero-trust model:
- **Tenant Scope Isolation**: No generic multi-document queries can execute without binding an active `tenantId` matched index. Missing tenant tags trigger terminal rule failures.
- **Warehouse Scope Restrictions**: A warehouse custodian locked to `warehouseId_Riyadh_North` is physically blocked from listing stock logs or issuing stock adjustment slips for `warehouseId_Dammam_East`.
- **Sales Rep Enclave**: Standard sales team members observe only CRM pipelines matching their `salesRepresentativeId`. Only regional directors hold query bypass rights to run cross-representative aggregations.

---

## 3. The Enterprise Roles & Scopes Matrix

The following permissions are compiled dynamically inside client views to render UI controls:

| Enterprise Role | Primary Domain | Worksite Access Scope | Separation of Duties Wall | Audit Forensic Capability |
| :--- | :--- | :--- | :--- | :--- |
| **Owner / Executive** | All Domains | Complete Tenancy | Restricted from direct entries | Full read-model audit export |
| **Manager** | Operational / HR | Assigned Branch Units | Requisition entry only | View local logs & performance |
| **Accountant** | Accounting Core | Financial Headquarters | Creator-Approver Isolation (No self-auth) | Anomaly alerts & ledger history |
| **Staff / Employee** | Individual Ops | Assigned Biometric radius | Zero ledger access | Personal timesheets only |
| **POS Cashier** | Sales / Retail | Single Point of Sale POS | Blind-drop cash reconciliation (No system counts visible) | Register shift event signatures |
| **Warehouse Keeper** | Supply Chain / Inventory | Assigned Depots | Blocked from price adjustments | Stock valuation sheet read-only |

---

## 4. Implementation Verification Status

- [x] Strict tenant-level isolation hooks in Database Engine (`services/core/db.ts`).
- [x] Audit-mode locked states for POS Terminal views (`POS.tsx`).
- [x] Multi-tier approvals for Leave Requests based on simulated universal roles.
- [x] Immutable Double-Entry posting restrictions protecting posted ledgers.

