
import React, { useState, useRef } from 'react';
import { Asset, ExtractedPaymentDetails } from '../../types';
import { Landmark, Scan, Plus } from 'lucide-react';
import { parseAssetDocument, parsePaymentReceipt } from '../../services/geminiService';
import { AssetRegistry } from './assets/AssetRegistry';
import { AssetScanner } from './assets/AssetScanner';
import { NewAssetForm } from './assets/NewAssetForm';

const INITIAL_ASSETS: Asset[] = [
  { id: '1', name: 'Office Building A', purchaseDate: '2020-01-15', cost: 1200000, usefulLife: 30, salvageValue: 200000, currentValue: 1066666, depreciationMethod: 'Straight Line', serialNumber: 'BLD-001' },
  { id: '2', name: 'MacBook Fleet', purchaseDate: '2023-03-10', cost: 45000, usefulLife: 4, salvageValue: 5000, currentValue: 37500, depreciationMethod: 'Straight Line', serialNumber: 'MBP-BATCH-23' },
];

const PAYMENT_ACCOUNTS = [
    { id: '1010', name: '1010 - Main Bank Account' },
    { id: '1020', name: '1020 - Petty Cash' },
    { id: '2010', name: '2010 - Corporate Credit Card' },
];

export const FixedAssets: React.FC<{ readOnly?: boolean }> = ({ readOnly }) => {
  const [activeTab, setActiveTab] = useState<'registry' | 'scan' | 'add'>('registry');
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [stagedAssets, setStagedAssets] = useState<any[]>([]);
  const [invoiceInfo, setInvoiceInfo] = useState({ 
      vendor: '', date: new Date().toISOString().split('T')[0], invoiceNumber: '',
      paymentAccount: '1010', tax: 0, totalAmount: 0, paymentStatus: 'Paid' as 'Paid' | 'Unpaid',
      liabilityAccount: '2000 - Accounts Payable', receiptFile: null as any
  });
  const [paymentDetails, setPaymentDetails] = useState<ExtractedPaymentDetails | null>(null);
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string, type: string, data: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const calculateBookValue = (cost: number, salvage: number, life: number, purchaseDate: string) => {
      const start = new Date(purchaseDate);
      const now = new Date();
      const yearsPassed = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (yearsPassed < 0) return cost;
      if (yearsPassed >= life) return salvage;
      return Math.max(salvage, cost - ((cost - salvage) / life) * yearsPassed);
  };

  const getDepreciationSchedule = (asset: Asset) => {
      const schedule = [];
      const { cost, salvageValue, usefulLife, purchaseDate } = asset;
      const annualDepreciation = (cost - salvageValue) / usefulLife;
      const startYear = new Date(purchaseDate).getFullYear();
      let accumulated = 0;
      for (let i = 1; i <= usefulLife; i++) {
          accumulated += annualDepreciation;
          const bookValue = cost - accumulated;
          schedule.push({ year: startYear + i - 1, expense: annualDepreciation, accumulated, bookValue });
      }
      return schedule;
  };

  const handleScanAsset = async (fileToScan?: { name: string, type: string, data: string }) => {
      if (readOnly) return;
      const fileForAnalysis = fileToScan || selectedFile;
      if (!fileForAnalysis) return;
      setIsScanning(true);
      try {
          const data = await parseAssetDocument(fileForAnalysis.data.split(',')[1], fileForAnalysis.data.split(';')[0].split(':')[1]);
          if (data) {
              setInvoiceInfo({ ...invoiceInfo, ...data, paymentStatus: 'Paid' });
              const newStaged = (data.assets || []).map((item: any, idx: number) => ({
                  tempId: `temp-${Date.now()}-${idx}`, ...item, 
                  purchaseDate: data.invoiceDate || invoiceInfo.date, 
                  quantity: item.quantity || 1, depreciationMethod: 'Straight Line'
              }));
              setStagedAssets(newStaged);
              setActiveTab('add');
          }
      } catch (error) { alert("Scan failed."); } finally { setIsScanning(false); }
  };

  const handleReceiptSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) return;
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = async (ev) => {
              setInvoiceInfo(prev => ({ ...prev, receiptFile: { name: file.name, data: ev.target?.result } }));
              setIsScanningReceipt(true);
              try {
                  const details = await parsePaymentReceipt((ev.target?.result as string).split(',')[1], file.type);
                  if (details) setPaymentDetails(details);
              } finally { setIsScanningReceipt(false); }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveAllAssets = () => {
      const newAssets: Asset[] = [];
      stagedAssets.forEach(staged => {
          for(let i = 0; i < (staged.quantity || 1); i++) {
              newAssets.push({
                  id: `ast-${Math.random()}`,
                  name: staged.name + ((staged.quantity || 1) > 1 ? ` (${i+1})` : ''),
                  purchaseDate: staged.purchaseDate,
                  cost: staged.cost,
                  usefulLife: staged.usefulLife,
                  salvageValue: staged.salvageValue,
                  currentValue: calculateBookValue(staged.cost, staged.salvageValue, staged.usefulLife, staged.purchaseDate),
                  depreciationMethod: 'Straight Line',
                  serialNumber: staged.serialNumber
              });
          }
      });
      setAssets([...assets, ...newAssets]);
      setStagedAssets([]);
      setSelectedFile(null);
      setActiveTab('registry');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
              <h2 className="text-3xl font-bold text-on-surface">Fixed Assets Register</h2>
              <p className="text-on-surface-muted text-sm mt-1">Manage capital assets, depreciation, and lifecycle.</p>
          </div>
          {!readOnly && (
              <div className="flex gap-2 bg-surface p-1 rounded-xl border border-border">
                  <button onClick={() => setActiveTab('registry')} className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'registry' ? 'bg-surface-highlight text-on-surface shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`}>
                      <Landmark className="h-4 w-4" /> Registry
                  </button>
                  <button onClick={() => setActiveTab('add')} className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'add' ? 'bg-surface-highlight text-on-surface shadow-sm' : 'text-on-surface-muted hover:text-on-surface'}`}>
                      <Plus className="h-4 w-4" /> Add / Review
                  </button>
                  <button onClick={() => setActiveTab('scan')} className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${activeTab === 'scan' ? 'bg-primary text-white shadow-glow-primary' : 'text-on-surface-muted hover:text-on-surface'}`}>
                      <Scan className="h-4 w-4" /> Smart Scan
                  </button>
              </div>
          )}
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-border min-h-[500px]">
        {activeTab === 'registry' && <AssetRegistry assets={assets} onCalculateSchedule={getDepreciationSchedule} />}
        {activeTab === 'scan' && !readOnly && <AssetScanner 
            fileInputRef={fileInputRef} selectedFile={selectedFile} isScanning={isScanning}
            onFileSelect={(e) => {
                const file = e.target.files?.[0];
                if(file) {
                    const r = new FileReader();
                    r.onload = (ev) => {
                        const f = {name: file.name, type: file.type, data: ev.target?.result as string};
                        setSelectedFile(f);
                        handleScanAsset(f);
                    };
                    r.readAsDataURL(file);
                }
            }} 
            onScan={() => handleScanAsset()} onClearFile={() => setSelectedFile(null)} 
        />}
        {activeTab === 'add' && !readOnly && <NewAssetForm 
            invoiceInfo={invoiceInfo} setInvoiceInfo={setInvoiceInfo}
            stagedAssets={stagedAssets} setStagedAssets={setStagedAssets}
            paymentDetails={paymentDetails} isScanningReceipt={isScanningReceipt}
            handleReceiptSelect={handleReceiptSelect} receiptInputRef={receiptInputRef}
            onSave={handleSaveAllAssets} onCancel={() => { setStagedAssets([]); setActiveTab('registry'); }}
            PAYMENT_ACCOUNTS={PAYMENT_ACCOUNTS}
        />}
      </div>
    </div>
  );
};
