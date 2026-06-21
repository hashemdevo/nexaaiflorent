
import React from 'react';
import { ViewState, Cashier } from '../../types';
import { Documents } from '../Documents';
import { SalesInvoices } from '../SalesInvoices';
import { POSManagement } from '../POSManagement';
import { UniversalImport } from '../UniversalImport';
import { PurchasingManager } from '../tools/PurchasingManager';
import { CommunicationHub } from '../tools/CommunicationHub';
import { ZatcaEInvoicingUI } from '../sales/ZatcaEInvoicingUI';

interface OperationsViewsProps {
    view: ViewState;
    readOnly: boolean;
    cashiers: Cashier[];
    onUpdateCashiers: (c: Cashier[]) => void;
    onNavigate: (v: ViewState) => void;
}

export const OperationsViews: React.FC<OperationsViewsProps> = ({ 
    view, readOnly, cashiers, onUpdateCashiers, onNavigate 
}) => {
    switch(view) {
        case ViewState.TOOLS_DOCUMENTS:
            return <Documents readOnly={readOnly} />;
        case ViewState.TOOLS_SALES_INVOICE:
            return <SalesInvoices readOnly={readOnly} />;
        case ViewState.TOOLS_ZATCA:
            return <ZatcaEInvoicingUI />;
        case ViewState.TOOLS_POS_MANAGEMENT:
            return <POSManagement cashiers={cashiers} onUpdateCashiers={onUpdateCashiers} readOnly={readOnly} />;
        case ViewState.TOOLS_IMPORT:
            return <UniversalImport onBack={() => onNavigate(ViewState.DASHBOARD)} readOnly={readOnly} />;
        case ViewState.TOOLS_PURCHASING: 
            return <PurchasingManager />;
        case ViewState.TOOLS_COMMUNICATION: 
            return <CommunicationHub />;
        default: return null;
    }
};
