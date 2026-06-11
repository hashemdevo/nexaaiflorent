
import React from 'react';
import { ViewState, ReportsProps } from '../types';
import { FinancialStatements } from './reports/FinancialStatements';
import { TrialBalance } from './reports/TrialBalance';
import { FixedAssets } from './reports/FixedAssets';
import { ThreeWayReconciliation } from './reports/ThreeWayReconciliation';

export const ReportsContainer: React.FC<ReportsProps> = ({ view, readOnly }) => {
  switch (view) {
    case ViewState.REPORTS_FINANCIAL: return <FinancialStatements readOnly={readOnly} />;
    case ViewState.REPORTS_TRIAL_BALANCE: return <TrialBalance />;
    case ViewState.REPORTS_RECONCILIATION: return <ThreeWayReconciliation />;
    case ViewState.REPORTS_FIXED_ASSETS: return <FixedAssets readOnly={readOnly} />;
    default: return null;
  }
};
