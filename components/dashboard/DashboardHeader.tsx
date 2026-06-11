import React, { useState } from 'react';
import { Calendar, Download, FileText, Plus, Loader2, Hammer, Plane, Wrench, ShoppingBag, Utensils, Stethoscope, Briefcase, Gavel, Truck, Building2, LayoutGrid, Settings, ClipboardList } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { GlobalSearch } from './GlobalSearch';
import { Nexa } from '../../services/api';
import { useApp } from '../../contexts/AppContext';
import { ViewState } from '../../types';

export const DashboardHeader: React.FC = () => {
  const { setIsTransactionModalOpen, currentUserIndustry, setCurrentView, isCustomizingLayout, setIsCustomizingLayout, currentUniversalRole } = useApp();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
      setIsExporting(true);
      try {
          const csv = await Nexa.Tools.Bulk.exportToCSV('journal_entries');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ledger_export_${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
      } catch (error) {
          console.error("Export failed", error);
          alert("Export failed. Please try again.");
      } finally {
          setIsExporting(false);
      }
  };

  // Check if role is executive/administrative-only
  const isExecutive = !currentUniversalRole || ['OWNER', 'PARTNER', 'CEO', 'CHIEF_ACCOUNTANT', 'ACCOUNTANT', 'AUDITOR', 'SYSTEM_ADMIN', 'ADMIN'].includes(currentUniversalRole);

  // Context-Aware Action Button Logic
  const renderPrimaryAction = () => {
      switch (currentUserIndustry) {
          case 'CONSTRUCTION':
              return (
                  <button 
                      onClick={() => setCurrentView(ViewState.INDUSTRY_CONSTRUCTION_SITES)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-yellow-500 text-black font-bold rounded-xl shadow-lg hover:bg-yellow-400 transition"
                  >
                      <Hammer className="h-4 w-4" /> New Project
                  </button>
              );
          case 'RESTAURANT':
              if (isExecutive) {
                  return (
                      <button 
                          onClick={() => setCurrentView(ViewState.INDUSTRY_RESTAURANT_TABLES)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition"
                      >
                          <LayoutGrid className="h-4 w-4" /> Table Map
                      </button>
                  );
              }
              return (
                  <button 
                      onClick={() => setCurrentView(ViewState.TOOLS_POS)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg hover:bg-orange-600 transition"
                  >
                      <Utensils className="h-4 w-4" /> New Order
                  </button>
              );
          case 'MEDICAL':
          case 'HOSPITAL':
              return (
                  <button 
                      onClick={() => setCurrentView(ViewState.INDUSTRY_MEDICAL_PATIENTS)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-cyan-500 text-white font-bold rounded-xl shadow-lg hover:bg-cyan-600 transition"
                  >
                      <Stethoscope className="h-4 w-4" /> Admit Patient
                  </button>
              );
          case 'RETAIL':
              if (isExecutive) {
                  return (
                      <button 
                          onClick={() => setCurrentView(ViewState.INDUSTRY_RETAIL_SHIFTS)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transition"
                      >
                          <ClipboardList className="h-4 w-4" /> Shift Manager
                      </button>
                  );
              }
              return (
                  <button 
                      onClick={() => setCurrentView(ViewState.TOOLS_POS)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-600 transition"
                  >
                      <ShoppingBag className="h-4 w-4" /> New Sale
                  </button>
              );
          case 'TRAVEL':
              return (
                  <button 
                      onClick={() => setCurrentView(ViewState.INDUSTRY_TRAVEL_BOOKINGS)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 text-white font-bold rounded-xl shadow-lg hover:bg-sky-600 transition"
                  >
                      <Plane className="h-4 w-4" /> New Booking
                  </button>
              );
          case 'MAINTENANCE':
              return (
                  <button 
                      onClick={() => setCurrentView(ViewState.INDUSTRY_MAINTENANCE_REQUESTS)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition"
                  >
                      <Wrench className="h-4 w-4" /> New Ticket
                  </button>
              );
          case 'REAL_ESTATE':
              return (
                  <button 
                      onClick={() => setCurrentView(ViewState.INDUSTRY_REAL_ESTATE_PROPERTIES)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition"
                  >
                      <Building2 className="h-4 w-4" /> Add Property
                  </button>
              );
          case 'LEGAL':
              return (
                  <button 
                      onClick={() => setCurrentView(ViewState.INDUSTRY_LEGAL_CASES)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white font-bold rounded-xl shadow-lg hover:bg-amber-700 transition"
                  >
                      <Gavel className="h-4 w-4" /> New Matter
                  </button>
              );
          case 'LOGISTICS':
              return (
                  <button 
                      onClick={() => setCurrentView(ViewState.INDUSTRY_LOGISTICS_FLEET)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition"
                  >
                      <Truck className="h-4 w-4" /> Dispatch
                  </button>
              );
          default:
              return (
                  <button 
                      onClick={() => setIsTransactionModalOpen(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-bold rounded-xl shadow-glow-primary hover:bg-primary-hover transition"
                  >
                      <Plus className="h-4 w-4" /> Add Transaction
                  </button>
              );
      }
  };

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 animate-fade-in">
      
      {/* Search & Date Controls */}
      <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-center">
        <GlobalSearch />
        
        <div className="flex items-center gap-2 glass-panel px-4 py-2.5 rounded-xl border border-border text-on-surface font-mono text-sm whitespace-nowrap h-[44px]">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
        <NotificationCenter />
        
        <div className="h-8 w-px bg-border hidden xl:block mx-1"></div>

        <button 
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-on-surface hover:bg-surface-highlight transition disabled:opacity-50"
        >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
            Export CSV
        </button>
        
        <button 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition border ${
                isCustomizingLayout 
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 ring-1 ring-amber-500/20 shadow-lg shadow-amber-500/5' 
                : 'bg-surface border-border text-on-surface hover:bg-surface-highlight'
            }`}
            onClick={() => setIsCustomizingLayout(!isCustomizingLayout)}
        >
            <LayoutGrid className={`h-4 w-4 ${isCustomizingLayout ? 'animate-pulse text-amber-500' : ''}`} />
            {isCustomizingLayout ? 'Finish Customizing' : 'Customize Layout'}
        </button>

        <button 
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border rounded-xl text-sm font-bold text-on-surface hover:bg-surface-highlight transition"
            onClick={() => window.print()}
        >
            <Download className="h-4 w-4" /> Print Report
        </button>

        {renderPrimaryAction()}
      </div>
    </div>
  );
};