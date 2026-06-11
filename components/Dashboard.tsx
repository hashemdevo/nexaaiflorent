
import React from 'react';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { useApp } from '../contexts/AppContext';
import { IndustryRouter } from './dashboard/IndustryRouter';
import { FinancialOverview } from './dashboard/FinancialOverview';
import { SectorAiAnalyst } from './dashboard/SectorAiAnalyst';
import { PartnerLedgerWidget } from './dashboard/PartnerLedgerWidget';
import { PartnerOversightWidget } from './dashboard/PartnerOversightWidget';

interface DashboardProps {
  currentTheme: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentTheme }) => {
  const { currentUserIndustry, currentUniversalRole } = useApp();

  // Logic to determine if Financials should be shown.
  const showFinancials = ['OWNER', 'CEO', 'CFO', 'ACCOUNTANT', 'CHIEF_ACCOUNTANT', 'GENERAL_MANAGER', 'RESTAURANT_MANAGER', 'ADMIN', 'SYSTEM_ADMIN', 'PLANT_MANAGER', 'PARTNER', 'PRINCIPAL', 'PROPERTY_MANAGER', 'PHARMACY_MANAGER', 'SALES_MANAGER'].includes(currentUniversalRole || '');
  const showLedger = ['OWNER', 'PARTNER'].includes(currentUniversalRole || '');
  const showOversight = ['CEO', 'CFO', 'ACCOUNTANT', 'CHIEF_ACCOUNTANT', 'ADMIN', 'SYSTEM_ADMIN'].includes(currentUniversalRole || '');

  return (
    <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto pb-12">
      <DashboardHeader />
      <IndustryRouter industry={currentUserIndustry} />
      <SectorAiAnalyst />
      {showLedger && <PartnerLedgerWidget />}
      {showOversight && <PartnerOversightWidget />}
      {showFinancials && <FinancialOverview />}
    </div>
  );
};
