# PROJECT_ARCHITECTURE: Enterprise Supply Chain & Warehouse Network (إدارة المخازن الجردية وسلاسل التوريد) 📦

## 1. Description & Domain Model (نظرة عامة والنموذج الهيكلي)
Nexa Ledger decouples inventory listings into an **Aggregate Multi-Warehouse Network** spanning individual Legal Entities, Branches, and Zone Bins. Instead of treating inventory as simple isolated database rows, stock actions operate within a unified, double-entry transactional pipeline. 

```
                                  [ Operational Event Hub ]
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
           [ Procurement Cycle (PO/GRN) ]               [ Stock Transfer Request ]
                       │                                             │
                       ▼                                             ▼
            (Weighted-Average Cost Run)                  (Two-Phase Commitment Lock)
                       │                                             │
                       ▼                                             ▼
         [ PostgreSQL Immutable Core ]                [ Real-time Firestore Projections ]
         - Dr. Inventory Asset A/C                   - Stock Movement Stream
         - Cr. Accounts Payable                      - Location Bin Projected Units
```

---

## 2. Bounded Context Boundaries (حدود السياق المعماري المنفصلة)

### 2.1 Enterprise Warehouse Network Logistics (اللوجستيات عبر المستودعات والفروع)
Tracks physically isolated areas (`warehouseId`, `warehouseZoneId`, `binLocationId`). 
* **Dynamic Stock Transfers**: Handled under a Two-Phase Commit architecture using the `StockMovementService`. Stock is placed in a `TRANSIT` sub-ledger before getting accepted by the recipient warehouse custodian to prevent inventory leakages.
* **Separation of Duties (SoD)**: Employees locked to their personal purchase representative ID (`purchaseRepresentativeId`) can compile requisitions but holds zero authorization to sign off goods received notes (GRN).

### 2.2 Manufacturing Bill of Materials - BOM Formulas (معادلات التصنيع والإنتاج)
Declares structural recipes coupling raw inventory inputs to finished goods outputs (`billOfMaterialId` linked to multiple `inventoryItemId` records).
* **Cost Absorption Rollups**: Compiles weighted landing costs, overhead work-center utility rates, and payroll labor timesheets into the final finished asset value.
* **Waste & Scrap Control**: Automatic allocation to Scrap Expense Accounts (Loss adjustments).

### 2.3 Double-Entry Landed Cost Allocation Engine (محرك احتساب التكلفة المضافة وجرد الأصول الفرعية)
Ensures correct Balance Sheet capitalization in accordance with **IFRS IAS 2 (Inventory Valuation)**.
* **Weighted-Average Valuation (WAC)**: Computes real-time dynamic inventory valuation. Local purchase prices are adjusted on-the-fly when custom duties, sea/air container logistics fees, and clearing charges are cleared.
* **Ledger Posting Map**:
  - **Debit**: `Inventory Asset Account (1200)`
  - **Credit**: `Landed Cost Clearance Account (2135)` / `Accounts Payable (2110)`

---

## 3. Real-time Event Driven State & Projections (تكامل الأحداث ونوافذ العرض)

To accommodate peak throughput operations without locking the primary PostgreSQL transactional cores:
1. **The Write-Ahead Logging Core**: All physical stock alterations are logged as irreversible `stock_movements` rows, registering accurate UUIDv7 tokens.
2. **Projected Inventory Buffers**: A background process consumes PostgreSQL commits and aggregates quantities, writing directly to **Firestore `inventory_catalog`** for ultra-fast, offline-resilient cashier and sales team lookups.

---

## 4. Master Privilege & Authorization Control (صلاحيات موديول المخازن واللوجستيات)

| User Role (الدور الوظيفي) | Inventory Catalog | Multi-WH Logistics | BOM Formulas | Valuation Runs | Approval Authorization |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Chief Accountant** | Read-Only (Audit) | Read-Only (Audit) | Read-Only (Audit) | **Execute Allowed** | **Financial Posting Ledger Sign-off** |
| **Procurement Rep** | **CRUD (Own Org)** | Read-Only | **CRU (Own Org)** | Read-Only | Submit Requisitions only |
| **Warehouse Keeper** | **CRUD (Local WH)** | **CRU (Local WH)** | Read-Only | ❌ Forbidden | Sign-off Goods Received Slip (GRN) |
| **Sales & CRM Rep** | Read-Only | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden | ❌ Forbidden |

---

## 5. Implementation Verification Roadmap (حالة تفعيل المسار البرمجي)

- [x] Solid **Weighted-Average Cost (WAC)** valuation routines in `services/inventory/items.ts`.
- [x] Dual-stage Inter-branch Stock Transfer controls in `services/inventory/movements.ts`.
- [x] Fully responsive **Global Stock & Transfers (Multi-Warehouse Grid)** built and loaded in the client-side `/components/inventory/GlobalStock.tsx`.
- [x] Server-side cryptographic ZATCA signature authority integration proxying to `/api/zatca/sign-invoice` in `server.ts`.
