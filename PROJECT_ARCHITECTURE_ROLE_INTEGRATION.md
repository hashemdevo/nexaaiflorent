# Component 18: Enterprise Role-Based Access Control (RBAC) & Data Isolation

## 1. Role Definitions & Permissions Matrix
We define specific visibility rules and operational boundaries for each system identity in the enterprise:

1. **المحاسب (Accountant)**
   - **Access**: Complete system financials and operational trace.
   - **Modules**:
     - Dashboard & Financial Reports
     - Financial Statements & Trial Balance
     - Fixed Assets & Bank Insights
     - Analytics & Forensic (Anomaly Detection, Benford's Law)
     - Management (Cost Control, Provisions, Automation Rules, Inventory)
     - Operations (ZATCA e-Invoicing, Sales Invoices)
     - CRM & Sales Pipeline, Purchasing, HR ledgers, Settings.

2. **مسؤول الموارد البشرية (HR Manager)**
   - **Access**: Isolated HR staff operational modules.
   - **Modules**:
     - Attendance & Geofencing
     - Leave Management
     - Payroll & Benefit sheets
     - Employee Performance
     - Settings (Profile & HR configuration)

3. **مسؤول المشتريات (Procurement Manager)**
   - **Access**: Global material procurement and raw stock.
   - **Modules**:
     - Procurement Dashboard
     - Purchasing & Vendor management
     - Inventory additions (Raw Materials Warehouse)

4. **موظف المشتريات (Procurement Representative)**
   - **Access**: Strictly scoped to *their own* transactions.
   - **Rules**: Filters stock additions and purchases where `createdBy` or `purchasesRepresentativeId` matches their unique `employeeId`.
   - **Warehouse restriction**: Only allowed to interact with the **Raw Materials Warehouse** (`warehouse_raw`).

5. **موظف المبيعات (Sales Representative)**
   - **Access**: Strictly scoped to *their own* sales records.
   - **Rules**: Filters contracts, quotations, invoices, and collection tracks where `sellerId` matches their unique `employeeId`.
   - **Warehouse restriction**: Only allowed to view the **Finished Selling Goods Warehouse** (`warehouse_sales`), preventing access to Raw Materials.

---

## 2. Relational Entity Mapping (Enterprise IDs)
Every operational entity in the system enforces standard UUID v7 keys:
- `tenantId`: Tenant Partition
- `companyId`: Operating Corporate Entity
- `employeeId`: Standard Employee reference
- `userId`: Associated identity username / credentials
- `warehouseId`: Warehouse ID (`warehouse_raw` vs. `warehouse_sales`)
- `sellerId`: Sales Agent Identifier
- `representativeId`: Procurement Agent Identifier
- `clientId`: Customer ID
- `vendorId`: Vendor Supplier ID
- `transactionId`: Journal & ledger execution trace
