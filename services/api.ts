
/**
 * NEXA ENTERPRISE SDK v4.3
 * 
 * Unified API Gateway. Consolidates all micro-services and AI capabilities.
 */

import { DbEngine } from './core/db';
import { CacheLayer } from './core/cache';
import { ListenerRegistry } from './listeners';
import { DatabaseSeeder } from './core/seeder';

// Modules
import * as FinancialDimensions from './financial_dimensions';
import * as Ledger from './ledger';
import * as Sales from './sales';
import * as Purchasing from './purchasing';
import * as Inventory from './inventory';
import * as Assets from './assets';
import * as Payroll from './payroll';
import * as Expenses from './expenses';
import * as Budgeting from './budgeting';
import * as Projects from './projects';
import * as Manufacturing from './manufacturing';
import * as CRM from './crm';
import * as HRM from './hrm';
import * as Quality from './quality';
import * as Support from './support';
import * as System from './system';
import * as Analytics from './analytics';
import * as Workflow from './workflow';
import * as POS from './pos';
import * as Forecasting from './forecasting';
import * as Tools from './tools';
import * as Communication from './communication';
import * as Search from './search';
import * as Reports from './reports';
import { TransactionDirector } from './transactions/director';
import { SimulationEngine } from './simulation/engine';
import { SimulationFeedbackService } from './simulation/feedback';
import { EnterpriseSimulator } from './simulation/EnterpriseSimulator';

// Gemini AI Service Integration
import { Gemini } from './geminiService';

// Security & Admin
import { AuditService } from './admin/audit';
import { EmployeeService } from './client/employees';

export const Nexa = {
    // Initialization & Setup
    init: async () => {
        console.log("🚀 Initializing Nexa Enterprise Engine with Authenticators...");
        
        // Dynamic import of Firebase Auth to monitor login transitions safely
        const { onAuthStateChanged } = await import('firebase/auth');
        const { auth } = await import('./firebaseConfig');

        onAuthStateChanged(auth, async (user) => {
            if (user) {
                console.log(`👤 Active authenticated session detected (${user.uid}). Initializing Database Seeder & Search Indexer...`);
                try {
                    await DatabaseSeeder.seed();
                    await Search.SearchIndexer.buildIndex();
                    console.log("🌱 Nexa Enterprise modules seeded & indexed successfully.");
                } catch (error) {
                    console.error("⚠️ Failed to seeding/indexing under authenticated session:", error);
                }
            } else {
                console.log("🛰️ No authenticated session detected. Seeding & Indexing deferred until login complete.");
            }
        });

        ListenerRegistry.init();
        console.log("✅ Custom Session Init Listeners Registered.");
    },

    // Artificial Intelligence Layer
    AI: Gemini,

    // Core Infrastructure
    Core: {
        Db: DbEngine,
        Cache: CacheLayer,
        Audit: AuditService,
        Search: Search.SearchEngine
    },

    // Communication Layer
    Comm: {
        Email: {
            send: Communication.CommunicationDispatcher.sendEmail,
            templates: Communication.EmailTemplates
        },
        SMS: {
            send: Communication.CommunicationDispatcher.sendSMS
        }
    },

    // Financial Core
    FinancialDimensions: FinancialDimensions,
    Ledger: {
        Journal: Ledger.JournalService,
        Accounts: Ledger.AccountService,
        Reporting: Ledger.ReportingService
    },
    Reports: {
        Financials: Reports.FinancialReportingService
    },
    Assets: Assets.AssetRegistryService,
    Depreciation: Assets.DepreciationService,
    Budgeting: Budgeting.BudgetService,
    Transactions: {
        Director: TransactionDirector
    },
    Simulation: {
        Engine: SimulationEngine,
        Learning: SimulationFeedbackService,
        Enterprise: EnterpriseSimulator
    },

    // Operational Modules
    Sales: {
        Customers: Sales.CustomerService,
        Orders: Sales.SalesOrderService,
        Invoices: Sales.InvoiceService,
        Payments: Sales.PaymentService,
        Recurring: Sales.RecurringSalesService
    },
    Purchasing: {
        Vendors: Purchasing.VendorService,
        Orders: Purchasing.PurchaseOrderService,
        Bills: {
            Create: Purchasing.BillCreateService,
            Read: Purchasing.BillReadService,
            Pay: Purchasing.BillPayService
        }
    },
    Inventory: {
        Items: Inventory.InventoryService,
        Warehouses: Inventory.WarehouseService,
        Movements: Inventory.StockMovementService
    },
    Manufacturing: {
        BOM: Manufacturing.BomService,
        WorkOrders: Manufacturing.WorkOrderService,
        QC: Quality.QCService
    },
    Projects: {
        Registry: Projects.ProjectRegistryService,
        Timesheets: Projects.TimesheetService
    },

    // Human Resources
    HRM: {
        Employees: EmployeeService, 
        Departments: HRM.DepartmentService,
        Leave: HRM.LeaveService,
        Reviews: HRM.PerformanceReviewService,
        Payroll: Payroll.PayRunService,
        Attendance: HRM.AttendanceService
    },
    Expenses: {
        Claims: Expenses.ExpenseClaimService,
        Reimbursement: Expenses.ReimbursementService
    },

    // Customer Relationship
    CRM: {
        Leads: CRM.LeadService,
        Opportunities: CRM.OpportunityService,
        Support: Support.SupportService
    },

    // System Administration & Tools
    System: {
        Settings: System.SystemSettingsService,
        Notifications: System.NotificationService,
        Currency: System.CurrencyService,
        Scheduler: System.JobScheduler
    },
    Workflow: {
        WorkflowEngine: Workflow.WorkflowEngine
    },
    Analytics: {
        Sales: Analytics.SalesAnalyticsService,
        Inventory: Analytics.InventoryAnalyticsService
    },
    Forecasting: {
        CashFlow: Forecasting.CashFlowForecaster,
        Demand: Forecasting.DemandForecaster
    },
    Tools: {
        Archiver: Tools.DataArchiver,
        Bulk: Tools.BulkOperationService
    },
    
    // Point of Sale
    POS: {
        Terminal: POS.POSTerminalService
    }
};
