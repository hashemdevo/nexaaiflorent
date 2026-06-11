
import React from 'react';
import { ViewState, ManagementContainerProps } from '../types';
import { CostControl } from './management/CostControl';
import { AutomationTools } from './management/AutomationTools';
import { ProvisionsManager } from './management/ProvisionsManager';

export const ManagementContainer: React.FC<ManagementContainerProps> = ({ view, readOnly }) => {
  switch(view) {
    case ViewState.MANAGEMENT_COST_CONTROL: return <CostControl />;
    case ViewState.MANAGEMENT_AUTOMATION: return <AutomationTools />;
    case ViewState.MANAGEMENT_PROVISIONS: return <ProvisionsManager />;
    default: return null;
  }
};
