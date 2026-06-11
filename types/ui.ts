
import { ViewState } from './enums';
import { Cashier } from './operational';

export interface POSManagementProps {
    cashiers: Cashier[];
    onUpdateCashiers: (cashiers: Cashier[]) => void;
    readOnly?: boolean;
}

export interface ReportsProps {
  view: ViewState;
  readOnly?: boolean;
}

export interface ManagementContainerProps {
  view: ViewState;
  readOnly?: boolean;
}

export interface InventoryProps {
    readOnly?: boolean;
}

export interface SalesInvoicesProps {
    readOnly?: boolean;
}

export interface UniversalImportProps {
    onBack?: () => void;
    readOnly?: boolean;
}

export interface DocumentsProps {
    readOnly?: boolean;
}
