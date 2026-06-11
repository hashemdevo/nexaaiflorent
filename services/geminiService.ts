
import { cleanAndParseJSON as coreClean } from './gemini/core';
import { VisionService } from './gemini/vision';
import { AudioService } from './gemini/audio';
import { FinanceAnalysisService } from './gemini/finance';
import { AccountingService } from './gemini/accounting';
import { LegalService } from './gemini/legal';
import { MarketService } from './gemini/market';
import { CommunicationService } from './gemini/communication';
import { DataService } from './gemini/data';
import { ForecastingService } from './gemini/forecasting';
import { HrmService } from './gemini/hrm';
import { ReportingService as GeminiReportingService } from './gemini/reporting';
import { WorkflowService } from './gemini/workflow';
import { ProcurementService } from './gemini/procurement';
import { CrmService } from './gemini/crm';
import { SecurityAIService } from './gemini/security';
import { LogisticsService } from './gemini/logistics';
import { QualityService } from './gemini/quality';
import { TrainingService } from './gemini/training';
import { StrategyService } from './gemini/strategy';
import { MaintenanceService } from './gemini/maintenance';
import { ItService } from './gemini/it';
import { MarketingService } from './gemini/marketing';
import { ComplianceService } from './gemini/compliance';
import { UxService } from './gemini/ux';
import { TravelService } from './gemini/travel';
import { InsuranceService } from './gemini/insurance';
import { RealEstateService } from './gemini/realestate';
import { InvestmentService } from './gemini/investment';
import { SustainabilityService } from './gemini/sustainability';
import { PrService } from './gemini/pr';
import { GrantService } from './gemini/grants';
import { RiskService } from './gemini/risk';
import { EducationService } from './gemini/education';
import { EventService } from './gemini/event';
import { TranslationService } from './gemini/translation';
import { EthicsService } from './gemini/ethics';
import { HealthService } from './gemini/health';
import { RandDService } from './gemini/research';
import { CustomerSuccessService } from './gemini/customer_success';
import { FranchiseService } from './gemini/franchise';
import { AgricultureService } from './gemini/agriculture';
import { EnergyService } from './gemini/energy';
import { EntertainmentService } from './gemini/entertainment';
import { GovernmentService } from './gemini/government';
import { TelecomService } from './gemini/telecom';
import { HospitalityService } from './gemini/hospitality';
import { RetailService } from './gemini/retail';
import { ConstructionService } from './gemini/construction';

// --- RE-EXPORTS FOR BACKWARD COMPATIBILITY ---

export const cleanAndParseJSON = coreClean;

// Accounting & Finance
export const analyzeFinancialTransaction = AccountingService.analyzeTransaction;
export const automateEntrySuggestion = AccountingService.suggestDoubleEntry;
export const analyzeBankTransactions = FinanceAnalysisService.analyzeBankTransactions;
export const detectAnomalies = FinanceAnalysisService.detectAnomalies;
export const analyzeComplianceRisk = FinanceAnalysisService.analyzeComplianceRisk;
export const investigateBenfordAnomalies = FinanceAnalysisService.investigateBenfordAnomalies;

// Vision (OCR)
export const parseInvoiceDocument = VisionService.parseInvoice;
export const parseAssetDocument = VisionService.parseAssetDocument;
export const parsePaymentReceipt = VisionService.parseReceipt;

// Audio
export const transcribeAudio = AudioService.transcribe;
export const analyzeAudioFinancials = AudioService.analyzeFinancialCommand;
export const speakText = AudioService.speakText;

/**
 * Unified Namespace Export
 * Access via: Nexa.Gemini.Legal.analyzeContract(...)
 */
export const Gemini = {
    Core: { cleanAndParseJSON },
    Vision: VisionService,
    Audio: AudioService,
    Finance: FinanceAnalysisService,
    Accounting: AccountingService,
    Legal: LegalService,
    Market: MarketService,
    Comm: CommunicationService,
    Data: DataService,
    Forecasting: ForecastingService,
    HRM: HrmService,
    Reporting: GeminiReportingService,
    Workflow: WorkflowService,
    Procurement: ProcurementService,
    CRM: CrmService,
    Security: SecurityAIService,
    Logistics: LogisticsService,
    Quality: QualityService,
    Training: TrainingService,
    Strategy: StrategyService,
    Maintenance: MaintenanceService,
    IT: ItService,
    Marketing: MarketingService,
    Compliance: ComplianceService,
    UX: UxService,
    Travel: TravelService,
    Insurance: InsuranceService,
    RealEstate: RealEstateService,
    Investment: InvestmentService,
    Sustainability: SustainabilityService,
    PR: PrService,
    Grants: GrantService,
    Risk: RiskService,
    Education: EducationService,
    Event: EventService,
    Translation: TranslationService,
    Ethics: EthicsService,
    Health: HealthService,
    RandD: RandDService,
    CustomerSuccess: CustomerSuccessService,
    Franchise: FranchiseService,
    Agriculture: AgricultureService,
    Energy: EnergyService,
    Entertainment: EntertainmentService,
    Government: GovernmentService,
    Telecom: TelecomService,
    Hospitality: HospitalityService,
    Retail: RetailService,
    Construction: ConstructionService
};