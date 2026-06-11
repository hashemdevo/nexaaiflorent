import React, { useState, useEffect } from 'react';
import { DbEngine } from '../../services/core/db';
import { InventoryItem, BillOfMaterials } from '../../services/core/types';
import { Account, JournalEntry } from '../../types';
import { 
    Coins, 
    TrendingUp, 
    ArrowLeftRight, 
    Hammer, 
    PieChart, 
    Plus, 
    FileSpreadsheet, 
    Calculator, 
    Layers, 
    ArrowRight, 
    AlertCircle, 
    CheckCircle2, 
    ShieldAlert, 
    Scale,
    Activity,
    MapPin,
    DollarSign,
    Box,
    FileText
} from 'lucide-react';
import { AccountService } from '../../services/ledger/accounts';
import { JournalService } from '../../services/ledger/journal';
import { useApp } from '../../contexts/AppContext';

const formatNumber = (val: number): string => {
    return `$${val.toFixed(2)}`;
};

// Core interfaces locally supporting the module
interface CostCenter {
    id: string;
    code: string;
    name: string;
    manager: string;
    description: string;
}

interface LandedCostAllocation {
    id: string;
    itemId: string;
    itemName: string;
    baseCost: number;
    shippingFee: number;
    customsDuty: number;
    storageOverhead: number;
    totalLandedCost: number;
    unitPriceRecomputed: number;
    costCenterId: string;
    allocatedAt: string;
}

interface StockTransfer {
    id: string;
    itemId: string;
    itemName: string;
    quantity: number;
    fromCostCenterId: string;
    toCostCenterId: string;
    transferCostValue: number;
    transferredAt: string;
    status: 'COMPLETED' | 'PENDING';
}

interface ProductionRun {
    id: string;
    bomId: string;
    bomName: string;
    finishedGoodId: string;
    finishedGoodName: string;
    quantityProduced: number;
    materialCost: number;
    laborCost: number;
    overheadCost: number;
    totalCost: number;
    costCenterId: string;
    createdAt: string;
}

export const CostAllocation: React.FC = () => {
    const { currentUserIdentity } = useApp();
    
    // Core loaded states
    const [units, setUnits] = useState<InventoryItem[]>([]);
    const [boms, setBoms] = useState<BillOfMaterials[]>([]);
    const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
    const [glAccounts, setGlAccounts] = useState<Account[]>([]);
    
    // History logs
    const [landedLogs, setLandedLogs] = useState<LandedCostAllocation[]>([]);
    const [transferLogs, setTransferLogs] = useState<StockTransfer[]>([]);
    const [productionLogs, setProductionLogs] = useState<ProductionRun[]>([]);
    const [journalLogs, setJournalLogs] = useState<JournalEntry[]>([]);

    const [activeSection, setActiveSection] = useState<'landed' | 'transfers' | 'production' | 'analytics'>('landed');
    const [isLoading, setIsLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'danger' | 'info'; text: string } | null>(null);

    // --- ERP MULTI-ACTIVITY COSTING PROFILE STATES ---
    const [selectedVertical, setSelectedVertical] = useState<'REST' | 'MANU' | 'HLTH' | 'CONS' | 'GENR'>('REST');
    const [customMode, setCustomMode] = useState<'BOM' | 'DIRECT'>('BOM');

    // Discrete Manufacturing Options
    const [manuOverheadRate, setManuOverheadRate] = useState<string>('30');
    const [manuLaborRate, setManuLaborRate] = useState<string>('40');

    // Healthcare Ward Options
    const [hlthPatientId, setHlthPatientId] = useState<string>('');
    const [hlthDoctorName, setHlthDoctorName] = useState<string>('');
    const [hlthClinicalWastage, setHlthClinicalWastage] = useState<string>('5');

    // Construction Project Options
    const [consBoqLine, setConsBoqLine] = useState<string>('BOQ-CIVIL-FOUNDATION');
    const [consScrapVariance, setConsScrapVariance] = useState<string>('6');
    const [consSubcontractorFee, setConsSubcontractorFee] = useState<string>('150');

    // Generic / Custom Activity Options
    const [genrCustomName, setGenrCustomName] = useState<string>('Agriculture Nursery');
    const [genrWastageMargin, setGenrWastageMargin] = useState<string>('8');
    const [genrIndirectOverhead, setGenrIndirectOverhead] = useState<string>('12');
    const [genrLaborServiceRate, setGenrLaborServiceRate] = useState<string>('18');
    const [genrAssetCapitalizationLabel, setGenrAssetCapitalizationLabel] = useState<string>('Harvest crop index');

    // Direct Costing Options (Ad-hoc Assembly without a preset BOM)
    const [adhocRawItemId, setAdhocRawItemId] = useState<string>('');
    const [adhocFinishedItemId, setAdhocFinishedItemId] = useState<string>('');
    const [adhocRawQtyPerUnit, setAdhocRawQtyPerUnit] = useState<string>('1.5');

    // --- FORM STATES ---
    // 1. Cost Center Creator
    const [newCenterName, setNewCenterName] = useState('');
    const [newCenterCode, setNewCenterCode] = useState('');
    const [newCenterManager, setNewCenterManager] = useState('');
    const [newCenterDesc, setNewCenterDesc] = useState('');
    const [showCostCenterForm, setShowCostCenterForm] = useState(false);

    // 2. Landed Cost Form
    const [landedItemId, setLandedItemId] = useState('');
    const [landedBaseCost, setLandedBaseCost] = useState<string>('');
    const [landedQty, setLandedQty] = useState<string>('1');
    const [landedShipping, setLandedShipping] = useState<string>('0');
    const [landedCustoms, setLandedCustoms] = useState<string>('0');
    const [landedStorage, setLandedStorage] = useState<string>('0');
    const [landedCostCenter, setLandedCostCenter] = useState('');

    // 3. Stock Transfer Form
    const [transferItemId, setTransferItemId] = useState('');
    const [transferQty, setTransferQty] = useState<string>('1');
    const [transferFromCC, setTransferFromCC] = useState('');
    const [transferToCC, setTransferToCC] = useState('');

    // 4. Production Run Form
    const [productionBomId, setProductionBomId] = useState('');
    const [productionQty, setProductionQty] = useState<string>('10');
    const [productionCC, setProductionCC] = useState('');

    // Load static or Firestore database metrics
    const loadCoreData = async () => {
        setIsLoading(true);
        setStatusMsg(null);
        try {
            // Load inventory
            const items = await DbEngine.select<InventoryItem>('inventory');
            setUnits(items);

            // Load BOMs
            const loadedBoms = await DbEngine.select<BillOfMaterials>('boms');
            setBoms(loadedBoms);

            // Load Cost Centers, seed if empty
            const loadedCCs = await DbEngine.select<any>('cost_centers');
            if (loadedCCs.length === 0) {
                const standardCCs: CostCenter[] = [
                    { id: 'cc-001', code: 'CC-RIYADH', name: 'Riyadh Central Hub', manager: 'Sadiq Riyadh', description: 'Central warehouse and main supply hub' },
                    { id: 'cc-002', code: 'CC-JEDDAH', name: 'Jeddah Beach Outlet', manager: 'Sameer Jalli', description: 'Active beach side kitchen and dining outpost' },
                    { id: 'cc-003', code: 'CC-DAMMAM', name: 'Dammam Terminal B', manager: 'Youssef Dam', description: 'Express terminal counter' }
                ];
                for (const cc of standardCCs) {
                    await DbEngine.insert('cost_centers', {
                        ...cc,
                        tenantId: 'default',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        version: 1
                    } as any);
                }
                setCostCenters(standardCCs);
            } else {
                setCostCenters(loadedCCs);
            }

            // Load Accounts for general ledger bindings
            const loadedAccounts = await AccountService.getAll();
            setGlAccounts(loadedAccounts);

            // Load logged records
            const landeds = await DbEngine.select<any>('landed_costs', { orderBy: 'allocatedAt', orderDir: 'desc' });
            setLandedLogs(landeds);

            const transfers = await DbEngine.select<any>('stock_transfers', { orderBy: 'transferredAt', orderDir: 'desc' });
            setTransferLogs(transfers);

            const productionRuns = await DbEngine.select<any>('production_runs', { orderBy: 'createdAt', orderDir: 'desc' });
            setProductionLogs(productionRuns);

            const journals = await JournalService.getAll();
            setJournalLogs(journals.filter(j => j.costCenter)); // Limit to tagged entries
        } catch (e) {
            console.error("Failed loading cost accounting dataset:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadCoreData();
    }, []);

    // Get asset / expense accounts needed for automation
    const getAccountByCode = (code: string) => {
        return glAccounts.find(acc => acc.code === code) || glAccounts[0];
    };

    // --- WRITE ACTIONS ---
    // 1. Create a Cost Center
    const handleAddCostCenter = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const id = `cc-${Date.now()}`;
            const payload = {
                id,
                code: newCenterCode.toUpperCase(),
                name: newCenterName,
                manager: newCenterManager || 'UNASSIGNED',
                description: newCenterDesc,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
            };
            await DbEngine.insert('cost_centers', payload as any);
            setCostCenters([...costCenters, payload as any]);
            setStatusMsg({ type: 'success', text: `Cost center "${newCenterName}" initialized with ledger code ${payload.code}` });
            setNewCenterName('');
            setNewCenterCode('');
            setNewCenterManager('');
            setNewCenterDesc('');
            setShowCostCenterForm(false);
        } catch (err) {
            console.error(err);
            setStatusMsg({ type: 'danger', text: 'Failed to define cost center.' });
        }
    };

    // 2. Proportional Landed Cost Allocation Flow
    const handleAllocateLandedCost = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMsg(null);
        if (!landedItemId) {
            setStatusMsg({ type: 'danger', text: 'Select an inventory item to allocate.' });
            return;
        }

        const item = units.find(u => u.id === landedItemId);
        if (!item) return;

        const baseVal = parseFloat(landedBaseCost) || (item.unitPrice * (parseFloat(landedQty) || 1));
        const qty = parseFloat(landedQty) || 1;
        const shipping = parseFloat(landedShipping) || 0;
        const customs = parseFloat(landedCustoms) || 0;
        const storage = parseFloat(landedStorage) || 0;
        const totalAllocatedOverhead = shipping + customs + storage;
        const totalLandedCost = baseVal + totalAllocatedOverhead;
        const calculatedLandedUnitPrice = totalLandedCost / qty;

        const activeCC = costCenters.find(cc => cc.id === landedCostCenter) || costCenters[0];

        try {
            // Update inventory base calculations
            const averageUnitPrice = parseFloat(calculatedLandedUnitPrice.toFixed(5));
            const newQty = item.quantity + qty;
            
            await DbEngine.update('inventory', item.id, {
                quantity: newQty,
                unitPrice: parseFloat((( (item.unitPrice * item.quantity) + (calculatedLandedUnitPrice * qty) ) / newQty).toFixed(5)),
                lastUpdated: new Date().toISOString().split('T')[0]
            } as any);

            // Post Landed Audit log
            const landId = `lnd-${Date.now()}`;
            const landedPayload: LandedCostAllocation = {
                id: landId,
                itemId: item.id,
                itemName: item.name,
                baseCost: baseVal,
                shippingFee: shipping,
                customsDuty: customs,
                storageOverhead: storage,
                totalLandedCost,
                unitPriceRecomputed: averageUnitPrice,
                costCenterId: activeCC.code,
                allocatedAt: new Date().toISOString()
            };
            await DbEngine.insert('landed_costs', {
                ...landedPayload,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
            } as any);

            // Double Entry Ledger integration with cost center tagging
            const inventoryAccount = getAccountByCode('1200') || { id: 'inv', name: 'Inventory Asset' }; // 1200 - Inventory Asset
            const cashAccount = getAccountByCode('1010') || { id: 'cash', name: 'Cash' }; // 1010 - Cash

            await JournalService.postEntry({
                transactionDate: new Date().toISOString().split('T')[0],
                postedDate: new Date().toISOString(),
                reference: `LANDED-${landId}`,
                description: `Integrated Landed Cost Addition for: ${item.name} (${qty} items)`,
                createdBy: currentUserIdentity || 'Cost Accounting',
                costCenter: activeCC.code,
                totalAmount: parseFloat(totalLandedCost.toFixed(2)),
                lines: [
                    {
                        accountId: inventoryAccount.id,
                        accountName: inventoryAccount.name,
                        debit: parseFloat(totalLandedCost.toFixed(2)),
                        credit: 0,
                        description: `Capitalized raw material inventory item: ${item.name} via weighted average formula`
                    },
                    {
                        accountId: cashAccount.id,
                        accountName: cashAccount.name,
                        debit: 0,
                        credit: parseFloat(totalLandedCost.toFixed(2)),
                        description: `Outflow allocation (Base purchase + transport/customs customs)`
                    }
                ]
            });

            setStatusMsg({
                type: 'success',
                text: `Successfully capitalized Landed Costs of: ${formatNumber(totalLandedCost)} to Raw Materials. Average unit price for "${item.name}" updated with cost-center tag: ${activeCC.code}`
            });

            // Refresh view
            await loadCoreData();
            // Clear inputs
            setLandedBaseCost('');
            setLandedShipping('0');
            setLandedCustoms('0');
            setLandedStorage('0');
        } catch (err: any) {
            console.error(err);
            setStatusMsg({ type: 'danger', text: `Failed to capitalize costs: ${err.message}` });
        }
    };

    // 3. Stock Transfer & Custody Handover Flow
    const handleStockTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMsg(null);
        if (!transferItemId) {
            setStatusMsg({ type: 'danger', text: 'Please pick an item to relocate.' });
            return;
        }
        if (transferFromCC === transferToCC) {
            setStatusMsg({ type: 'danger', text: 'Transfer source and target cost centers must match different locations.' });
            return;
        }

        const item = units.find(u => u.id === transferItemId);
        if (!item) return;

        const qty = parseFloat(transferQty) || 0;
        if (qty <= 0) {
            setStatusMsg({ type: 'danger', text: 'Invalid volume transfer amount.' });
            return;
        }

        if (item.quantity < qty) {
            setStatusMsg({ type: 'danger', text: `Insufficient stock in main supply. Only ${item.quantity} available, requested: ${qty}` });
            return;
        }

        const sourceCC = costCenters.find(cc => cc.id === transferFromCC) || costCenters[0];
        const destCC = costCenters.find(cc => cc.id === transferToCC) || costCenters[1];

        try {
            const transferCostTotal = item.unitPrice * qty;

            // Reduct Main inventory
            await DbEngine.update('inventory', item.id, {
                quantity: item.quantity - qty,
                lastUpdated: new Date().toISOString().split('T')[0]
            } as any);

            // Log stock transfer
            const xferId = `xfr-${Date.now()}`;
            const transferPayload: StockTransfer = {
                id: xferId,
                itemId: item.id,
                itemName: item.name,
                quantity: qty,
                fromCostCenterId: sourceCC.code,
                toCostCenterId: destCC.code,
                transferCostValue: transferCostTotal,
                transferredAt: new Date().toISOString(),
                status: 'COMPLETED'
            };

            await DbEngine.insert('stock_transfers', {
                ...transferPayload,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
            } as any);

            // Create Transfer Journal Entry
            // Debit: Inventory (Outlet WIP Cost Center)
            // Credit: Inventory (Main Warehouse Cost Center)
            const inventoryAccount = getAccountByCode('1200') || { id: 'inv', name: 'Inventory Asset' };

            await JournalService.postEntry({
                transactionDate: new Date().toISOString().split('T')[0],
                postedDate: new Date().toISOString(),
                reference: `XFER-${xferId}`,
                description: `Custody Transfer: Relocated ${qty} units of ${item.name} from Main warehouse to outlet`,
                createdBy: currentUserIdentity || 'Supply Controller',
                costCenter: destCC.code,
                totalAmount: parseFloat(transferCostTotal.toFixed(2)),
                lines: [
                    {
                        accountId: inventoryAccount.id,
                        accountName: `${inventoryAccount.name} (${destCC.name})`,
                        debit: parseFloat(transferCostTotal.toFixed(2)),
                        credit: 0,
                        description: `Received physical stock custody for outlet production usage`
                    },
                    {
                        accountId: inventoryAccount.id,
                        accountName: `${inventoryAccount.name} (${sourceCC.name})`,
                        debit: 0,
                        credit: parseFloat(transferCostTotal.toFixed(2)),
                        description: `Released stock custody from primary dispatch hub`
                    }
                ]
            });

            setStatusMsg({
                type: 'success',
                text: `Transfer verified: Relocated ${qty} units of ${item.name}. General Ledger adjusted under center: ${destCC.code}`
            });

            await loadCoreData();
            setTransferQty('1');
        } catch (err: any) {
            console.error(err);
            setStatusMsg({ type: 'danger', text: `Transfer failed: ${err.message}` });
        }
    };

    // 4. Production Conversion WIP Run
    const handleProductionRun = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMsg(null);

        // Determine if we are utilizing a standard loaded BOM or ad-hoc custom materials
        let bom: BillOfMaterials | undefined;
        let finishedGood: InventoryItem | undefined;
        let aggregateMaterialCost = 0;
        const itemsUpdates: { item: InventoryItem; deduction: number }[] = [];
        const qtyToProduce = parseFloat(productionQty) || 0;

        if (qtyToProduce <= 0) {
            setStatusMsg({ type: 'danger', text: 'Specify valid units output.' });
            return;
        }

        const cc = costCenters.find(c => c.id === productionCC) || costCenters[0];

        try {
            if (customMode === 'BOM') {
                if (!productionBomId) {
                    setStatusMsg({ type: 'danger', text: 'Select standard Recipe (BOM) or toggle to Direct Custom Material mode.' });
                    return;
                }
                bom = boms.find(b => b.id === productionBomId);
                if (!bom) return;

                finishedGood = units.find(u => u.id === bom.finishedGoodId);
                if (!finishedGood) return;

                for (const bomItem of bom.items) {
                    const raw = units.find(u => u.id === bomItem.itemId);
                    if (!raw) {
                        throw new Error(`Composition error: Ingredient with ID ${bomItem.itemId} is missing from inventory registration.`);
                    }
                    // Apply dynamic wastage percent (e.g., standard + healthcare/construction/generic variance)
                    let varianceRate = 0;
                    if (selectedVertical === 'HLTH') {
                        varianceRate = parseFloat(hlthClinicalWastage) || 0;
                    } else if (selectedVertical === 'CONS') {
                        varianceRate = parseFloat(consScrapVariance) || 0;
                    } else if (selectedVertical === 'GENR') {
                        varianceRate = parseFloat(genrWastageMargin) || 0;
                    }
                    const totalWastage = (bomItem.wastagePercent || 0) + varianceRate;
                    const wastageMultiplier = 1 + (totalWastage / 100);
                    const deductionQty = bomItem.quantity * qtyToProduce * wastageMultiplier;

                    if (raw.quantity < deductionQty) {
                        throw new Error(`Insufficient Raw Material: ${raw.name} has only ${raw.quantity} left. Required: ${deductionQty.toFixed(1)}`);
                    }
                    aggregateMaterialCost += raw.unitPrice * deductionQty;
                    itemsUpdates.push({ item: raw, deduction: deductionQty });
                }
            } else {
                // Direct Custom Material costing (Ad-hoc Assembly)
                if (!adhocRawItemId) {
                    setStatusMsg({ type: 'danger', text: 'Please select a Raw component material.' });
                    return;
                }
                const raw = units.find(u => u.id === adhocRawItemId);
                if (!raw) return;

                const rawQtyRequired = (parseFloat(adhocRawQtyPerUnit) || 1) * qtyToProduce;
                // Add scrap rate based on vertical
                let scrapRate = 0;
                if (selectedVertical === 'REST') scrapRate = 4; // restaurant adhoc food prep shrinkage
                else if (selectedVertical === 'MANU') scrapRate = 2; // technical scrap
                else if (selectedVertical === 'HLTH') scrapRate = parseFloat(hlthClinicalWastage) || 5; 
                else if (selectedVertical === 'CONS') scrapRate = parseFloat(consScrapVariance) || 6;
                else if (selectedVertical === 'GENR') scrapRate = parseFloat(genrWastageMargin) || 8;

                const totalQtyRequiredWithScrap = rawQtyRequired * (1 + (scrapRate / 100));

                if (raw.quantity < totalQtyRequiredWithScrap) {
                    throw new Error(`Insufficient Raw Stock: ${raw.name} has only ${raw.quantity} available. Required with scrap: ${totalQtyRequiredWithScrap.toFixed(2)}`);
                }

                aggregateMaterialCost = raw.unitPrice * totalQtyRequiredWithScrap;
                itemsUpdates.push({ item: raw, deduction: totalQtyRequiredWithScrap });

                // Finished good either selected, or fallback to patient file/site expense
                if (selectedVertical === 'REST' || selectedVertical === 'MANU' || selectedVertical === 'GENR') {
                    if (!adhocFinishedItemId) {
                        setStatusMsg({ type: 'danger', text: 'Please select a Finished material/good to compound.' });
                        return;
                    }
                    finishedGood = units.find(u => u.id === adhocFinishedItemId);
                    if (!finishedGood) return;
                }
            }

            // Adjust labor & overheads depending on selected industrial vertical
            let laborCostTotal = 0;
            let overheadCostTotal = 0;

            if (selectedVertical === 'REST') {
                laborCostTotal = (bom ? (bom.laborCostPerUnit || 0) : 5) * qtyToProduce;
                overheadCostTotal = (bom ? (bom.overheadCostPerUnit || 0) : 3) * qtyToProduce;
            } else if (selectedVertical === 'MANU') {
                laborCostTotal = (parseFloat(manuLaborRate) || 40) * (qtyToProduce * 0.25); // 15 mins labor per unit
                overheadCostTotal = (parseFloat(manuOverheadRate) || 30) * (qtyToProduce * 0.1); // machine hours per unit
            } else if (selectedVertical === 'HLTH') {
                laborCostTotal = 15 * qtyToProduce; // standardized compound/prep hours
                overheadCostTotal = 10 * qtyToProduce; // clinical sterile overhead
            } else if (selectedVertical === 'CONS') {
                laborCostTotal = (parseFloat(consSubcontractorFee) || 150) * (qtyToProduce * 0.2); // site sub-fee
                overheadCostTotal = 35 * qtyToProduce; // excavation and equipment overhead
            } else if (selectedVertical === 'GENR') {
                laborCostTotal = (parseFloat(genrLaborServiceRate) || 18) * qtyToProduce; // Custom labor component per output
                overheadCostTotal = (parseFloat(genrIndirectOverhead) || 12) * qtyToProduce; // Custom overhead component per output
            }

            const totalManufactureCost = aggregateMaterialCost + laborCostTotal + overheadCostTotal;

            // Execute raw material deductions sequentially
            for (const change of itemsUpdates) {
                await DbEngine.update('inventory', change.item.id, {
                    quantity: parseFloat((change.item.quantity - change.deduction).toFixed(2)),
                    lastUpdated: new Date().toISOString().split('T')[0]
                } as any);
            }

            // Now, either add to finished good stock (capitalization) or cost out to healthcare/construction expenses
            if (finishedGood) {
                const finalFinishedGoodQty = finishedGood.quantity + qtyToProduce;
                const currentTotalValue = finishedGood.quantity * finishedGood.unitPrice;
                const computedAverageCost = (currentTotalValue + totalManufactureCost) / finalFinishedGoodQty;

                await DbEngine.update('inventory', finishedGood.id, {
                    quantity: parseFloat(finalFinishedGoodQty.toFixed(2)),
                    unitPrice: parseFloat(computedAverageCost.toFixed(5)),
                    lastUpdated: new Date().toISOString().split('T')[0]
                } as any);
            }

            // Log production conversion run
            const runId = `run-${Date.now()}`;
            const productionPayload = {
                id: runId,
                bomId: bom?.id || 'DIRECT-COSTING',
                bomName: bom?.name || `Direct ${selectedVertical} allocation`,
                finishedGoodId: finishedGood?.id || 'CLIENT-EXPENSE-CHARGE',
                finishedGoodName: finishedGood?.name || (
                    selectedVertical === 'HLTH' ? `Clinical Expensed Compound (Patient: ${hlthPatientId || 'Ad-Hoc'})` : 
                    selectedVertical === 'CONS' ? `Site Project Expensed Item (BOQ: ${consBoqLine})` :
                    selectedVertical === 'GENR' ? `Custom Capitalized: ${genrCustomName} (${genrAssetCapitalizationLabel})` :
                    `Direct Unit Allocation`
                ),
                quantityProduced: qtyToProduce,
                materialCost: aggregateMaterialCost,
                laborCost: laborCostTotal,
                overheadCost: overheadCostTotal,
                totalCost: totalManufactureCost,
                costCenterId: cc.code,
                selectedVertical,
                customMode,
                createdAt: new Date().toISOString()
            };

            await DbEngine.insert('production_runs', {
                ...productionPayload,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1
            } as any);

            // Double entry booking:
            // Debit: Finished Goods Inventory (or Healthcare ward expense, or Construction Site project WIP)
            // Credit: Raw Materials Expense, Accrued Labor, Machinery Depr liability
            const inventoryAssetAcc = getAccountByCode('1200') || { id: 'inv', name: 'Inventory Asset' };
            const directLaborLiability = getAccountByCode('2200') || { id: 'labor', name: 'Accrued Payroll Direct' };

            let debitAccountName = `${inventoryAssetAcc.name} (Finished Stock - ${cc.name})`;
            let debitDescription = `Capitalized ${qtyToProduce} completed finished products under center: ${cc.code}`;

            if (selectedVertical === 'HLTH') {
                debitAccountName = `Healthcare Ward Treatment Expense (Patient: ${hlthPatientId || 'Guest'})`;
                debitDescription = `Medical cost allocated to Patient File ${hlthPatientId || 'Guest'} - Prescribed by Dr. ${hlthDoctorName || 'Duty Staff'}`;
            } else if (selectedVertical === 'CONS') {
                debitAccountName = `Construction Site WIP Asset (BOQ: ${consBoqLine})`;
                debitDescription = `Structural material deployed on site Sector. Subcontractor tag: Fee $${consSubcontractorFee}`;
            } else if (selectedVertical === 'GENR') {
                debitAccountName = `Custom Activity Asset (${genrCustomName} / ${genrAssetCapitalizationLabel})`;
                debitDescription = `Direct custom cost capitalized under profile: ${genrCustomName}. Unified custom parameters applied.`;
            }

            await JournalService.postEntry({
                transactionDate: new Date().toISOString().split('T')[0],
                postedDate: new Date().toISOString(),
                reference: `${selectedVertical}-WIP-${runId}`,
                description: bom?.name 
                    ? `Manufacturing Conversion: Produced ${qtyToProduce} units of ${finishedGood?.name || 'materials'}`
                    : `Direct Cost allocation: Expensed materials in ${selectedVertical} (${genrCustomName || consBoqLine || hlthPatientId})`,
                createdBy: currentUserIdentity || 'Cost Controller',
                costCenter: cc.code,
                totalAmount: parseFloat(totalManufactureCost.toFixed(2)),
                lines: [
                    {
                        accountId: inventoryAssetAcc.id,
                        accountName: debitAccountName,
                        debit: parseFloat(totalManufactureCost.toFixed(2)),
                        credit: 0,
                        description: debitDescription
                    },
                    {
                        accountId: inventoryAssetAcc.id,
                        accountName: `${inventoryAssetAcc.name} (Consumed Materials - ${cc.name})`,
                        debit: 0,
                        credit: parseFloat(aggregateMaterialCost.toFixed(2)),
                        description: `Released materials from raw material storage`
                    },
                    {
                        accountId: directLaborLiability.id,
                        accountName: directLaborLiability.name,
                        debit: 0,
                        credit: parseFloat((laborCostTotal + overheadCostTotal).toFixed(2)),
                        description: `Allocated process conversion (Labor: $${laborCostTotal.toFixed(1)} / Overheads: $${overheadCostTotal.toFixed(1)})`
                    }
                ]
            });

            setStatusMsg({
                type: 'success',
                text: finishedGood 
                    ? `Costing Run complete: Capitalized ${qtyToProduce} units of "${finishedGood.name}" at average ${formatNumber(totalManufactureCost/qtyToProduce)}/unit. Double-entry ledger synchronized.`
                    : `${selectedVertical} Direct usage complete: Expensed ${formatNumber(totalManufactureCost)} directly to ${selectedVertical === 'HLTH' ? 'Patient Treatment Registry' : 'Project BOQ site ledger'}.`
            });

            await loadCoreData();
        } catch (err: any) {
            console.error(err);
            setStatusMsg({ type: 'danger', text: `Cost Run failed: ${err.message}` });
        }
    };

    // Calculate dynamic analytics cost breakdown
    const computeCostCenterMetrics = () => {
        return costCenters.map(cc => {
            // Filter all ledger entries tagged with this center code
            const taggedJournals = journalLogs.filter(j => j.costCenter === cc.code);
            const totalDebits = taggedJournals.reduce((acc, j) => {
                return acc + j.lines.reduce((sub, line) => sub + (line.debit || 0), 0);
            }, 0);

            // Fetch actual sales revenues from the invoices/checkout order system
            // (Simulated weighted from allocations under this center)
            const matchedProductionCost = productionLogs
                .filter(p => p.costCenterId === cc.code)
                .reduce((acc, p) => acc + p.totalCost, 0);

            const matchedLandedCosts = landedLogs
                .filter(l => l.costCenterId === cc.code)
                .reduce((acc, l) => acc + l.totalLandedCost, 0);

            const matchedTransfersValue = transferLogs
                .filter(t => t.toCostCenterId === cc.code)
                .reduce((acc, t) => acc + t.transferCostValue, 0);

            // Theoretical recipe cost deduction vs actual
            const estimatedSalesValue = (matchedProductionCost * 2.8) + (matchedTransfersValue * 3.1);

            return {
                ...cc,
                journalEntryCount: taggedJournals.length,
                totalDebits,
                materialsValue: matchedLandedCosts || (totalDebits * 0.45),
                productionValue: matchedProductionCost,
                transfersIn: matchedTransfersValue,
                estimatedRevenue: estimatedSalesValue || (totalDebits * 1.4)
            };
        });
    };

    const analyticsMetrics = computeCostCenterMetrics();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Cost Center Controller Card Card Header Widget */}
                {analyticsMetrics.map(cc => (
                    <div key={cc.id} className="bg-surface border border-border rounded-xl p-4 shadow flex flex-col justify-between space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="text-[10px] font-mono text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full uppercase">{cc.code}</span>
                                <h4 className="text-sm font-bold text-white mt-1.5 flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-primary" /> {cc.name}
                                </h4>
                            </div>
                            <span className="text-xs text-on-surface-muted italic font-medium">Mgmt: {cc.manager}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-border/50 pt-3 text-[10px] font-mono">
                            <div>
                                <span className="block text-on-surface-muted uppercase">Allocated Cost</span>
                                <span className="text-sm font-bold text-red-400">{formatNumber(cc.totalDebits || 0)}</span>
                            </div>
                            <div>
                                <span className="block text-on-surface-muted uppercase">Revenue Yield</span>
                                <span className="text-sm font-bold text-emerald-400">{formatNumber(cc.estimatedRevenue || 0)}</span>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => setShowCostCenterForm(!showCostCenterForm)}
                    className="border border-dashed border-border/80 bg-surface/30 hover:bg-surface/60 rounded-xl p-4 flex flex-col justify-center items-center text-center transition group h-full min-h-[110px]"
                >
                    <Plus className="h-6 w-6 text-primary group-hover:scale-110 transition shrink-0" />
                    <span className="text-xs font-bold text-white mt-2 uppercase">Define New Cost Center</span>
                    <span className="text-[9px] text-on-surface-muted mt-1">Bind outlet sub-ledger and budgets</span>
                </button>
            </div>

            {/* Cost Center Creation Modal Overlay */}
            {showCostCenterForm && (
                <div className="bg-surface border border-primary/20 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="text-md font-bold text-white flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" /> Setup Corporate Cost Center (Sub-Ledger Unit)
                        </h3>
                        <button onClick={() => setShowCostCenterForm(false)} className="text-on-surface-muted hover:text-white text-xs">Close [X]</button>
                    </div>

                    <form onSubmit={handleAddCostCenter} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-on-surface-muted">Cost Center Name</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Khobar Kitchen Depot"
                                value={newCenterName}
                                onChange={e => setNewCenterName(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-on-surface-muted">GL Subcode Identifier</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. CC-KHOBAR"
                                value={newCenterCode}
                                onChange={e => setNewCenterCode(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-on-surface-muted">Custodian Manager</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Faisal Khobar"
                                value={newCenterManager}
                                onChange={e => setNewCenterManager(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary"
                            />
                        </div>
                        <div className="space-y-1.5 flex flex-col justify-end">
                            <button
                                type="submit"
                                className="w-full py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition text-xs uppercase"
                            >
                                Register Unit
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {statusMsg && (
                <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs font-semibold ${
                    statusMsg.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                        : statusMsg.type === 'danger'
                        ? 'bg-red-500/10 border-red-500/25 text-red-400'
                        : 'bg-primary/10 border-primary/25 text-primary'
                }`}>
                    {statusMsg.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <ShieldAlert className="h-5 w-5 shrink-0" />}
                    <span>{statusMsg.text}</span>
                </div>
            )}

            {/* ERP MULTI-ACTIVITY REGIME MASTER SELECTOR */}
            <div className="bg-surface border border-border rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <Scale className="h-4 w-4 text-primary" /> Active Activity Costing Regime
                        </h3>
                        <p className="text-[11px] text-on-surface-muted">
                            Switch the ERP costing engine to match your specific industry vertical standards. This alters sub-ledgers, variance formulas, and journal tags automatically.
                        </p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase font-bold">
                        Unified Multi-Tenant Engine: ACTIVE
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
                    {/* REST */}
                    <button
                        onClick={() => {
                            setSelectedVertical('REST');
                            setStatusMsg({ type: 'info', text: 'Costing Template adjusted to: Food Service. Sub-journals will map recipe consumptions, kitchen waste, and outlet transfers.' });
                        }}
                        className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between h-24 ${
                            selectedVertical === 'REST'
                                ? 'bg-primary/10 border-primary text-white shadow-glow-primary'
                                : 'bg-background/40 border-border hover:bg-background/80 text-on-surface-muted hover:text-white'
                        }`}
                    >
                        <span className="flex items-center justify-between w-full">
                            <span className="text-sm font-bold flex items-center gap-1.5">🍽️ Food Service</span>
                            {selectedVertical === 'REST' && <div className="h-2 w-2 rounded-full bg-primary" />}
                        </span>
                        <span className="text-[10px] text-on-surface-muted leading-relaxed block mt-1">
                            Recipe (BOM) standard ingredients conversion, shrinkage variance, and dining cost centers.
                        </span>
                    </button>

                    {/* MANU */}
                    <button
                        onClick={() => {
                            setSelectedVertical('MANU');
                            setStatusMsg({ type: 'info', text: 'Costing Template adjusted to: Discrete Manufacturing. Overheads will map machine hours, labor, and WIP factory batch capitalization.' });
                        }}
                        className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between h-24 ${
                            selectedVertical === 'MANU'
                                ? 'bg-indigo-500/10 border-indigo-500 text-white'
                                : 'bg-background/40 border-border hover:bg-background/80 text-on-surface-muted hover:text-white'
                        }`}
                    >
                        <span className="flex items-center justify-between w-full">
                            <span className="text-sm font-bold flex items-center gap-1.5 font-sans">🏭 Manufacturing</span>
                            {selectedVertical === 'MANU' && <div className="h-2 w-2 rounded-full bg-indigo-500" />}
                        </span>
                        <span className="text-[10px] text-on-surface-muted leading-relaxed block mt-1">
                            Bill of Materials (BOM), machinery overhead hours, direct work wage, and sub-assembly batching.
                        </span>
                    </button>

                    {/* HLTH */}
                    <button
                        onClick={() => {
                            setSelectedVertical('HLTH');
                            setStatusMsg({ type: 'info', text: 'Costing Template adjusted to: Healthcare Dispensables. Depletion is booked straight into Clinical Treatment Ward Expenses against Patient files.' });
                        }}
                        className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between h-24 ${
                            selectedVertical === 'HLTH'
                                ? 'bg-rose-500/10 border-rose-500 text-white'
                                : 'bg-background/40 border-border hover:bg-background/80 text-on-surface-muted hover:text-white'
                        }`}
                    >
                        <span className="flex items-center justify-between w-full">
                            <span className="text-sm font-bold flex items-center gap-1.5">🏥 Healthcare</span>
                            {selectedVertical === 'HLTH' && <div className="h-2 w-2 rounded-full bg-rose-500" />}
                        </span>
                        <span className="text-[10px] text-on-surface-muted leading-relaxed block mt-1">
                            Patient file micro-dosing charges, clinical sterile prep overheads, and expiration safety.
                        </span>
                    </button>

                    {/* CONS */}
                    <button
                        onClick={() => {
                            setSelectedVertical('CONS');
                            setStatusMsg({ type: 'info', text: 'Costing Template adjusted to: Contracting / Construction. Sub-ledgers will map Site BOQ progress billing and bulk material relocations.' });
                        }}
                        className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between h-24 ${
                            selectedVertical === 'CONS'
                                ? 'bg-amber-500/10 border-amber-500 text-white'
                                : 'bg-background/40 border-border hover:bg-background/80 text-on-surface-muted hover:text-white'
                        }`}
                    >
                        <span className="flex items-center justify-between w-full">
                            <span className="text-sm font-bold flex items-center gap-1.5">🏗️ Construction</span>
                            {selectedVertical === 'CONS' && <div className="h-2 w-2 rounded-full bg-amber-500" />}
                        </span>
                        <span className="text-[10px] text-on-surface-muted leading-relaxed block mt-1">
                            Project site material depletion against Bill of Quantities (BOQ), scrap buffers, and contractor fees.
                        </span>
                    </button>

                    {/* GENR */}
                    <button
                        onClick={() => {
                            setSelectedVertical('GENR');
                            setStatusMsg({ type: 'info', text: 'Costing Template adjusted to: Custom/Generic Activity Profile. Enter dynamic parameters (loss, overhead, and direct labor) to govern costing.' });
                        }}
                        className={`text-left p-3.5 rounded-xl border transition flex flex-col justify-between h-24 ${
                            selectedVertical === 'GENR'
                                ? 'bg-emerald-500/10 border-emerald-500 text-white'
                                : 'bg-background/40 border-border hover:bg-background/80 text-on-surface-muted hover:text-white'
                        }`}
                    >
                        <span className="flex items-center justify-between w-full">
                            <span className="text-sm font-bold flex items-center gap-1.5">⚙️ Generic Activity</span>
                            {selectedVertical === 'GENR' && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                        </span>
                        <span className="text-[10px] text-on-surface-muted leading-relaxed block mt-1">
                            Fully customizable activity profile, generic wastage percentages, dynamic labor, and asset labeling.
                        </span>
                    </button>
                </div>
            </div>

            {/* Panel Selector Tabs */}
            <div className="flex gap-2 bg-background p-1.5 rounded-xl border border-border">
                <button
                    onClick={() => setActiveSection('landed')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeSection === 'landed' ? 'bg-primary text-white shadow-glow-primary' : 'text-on-surface-muted hover:text-white'}`}
                >
                    ⚓ Landed Costs (Capitalization)
                </button>
                <button
                    onClick={() => setActiveSection('transfers')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeSection === 'transfers' ? 'bg-primary text-white shadow-glow-primary' : 'text-on-surface-muted hover:text-white'}`}
                >
                    🔄 stock transfers (custody chain)
                </button>
                <button
                    onClick={() => setActiveSection('production')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeSection === 'production' ? 'bg-primary text-white shadow-glow-primary' : 'text-on-surface-muted hover:text-white'}`}
                >
                    🔨 production conversion (wip)
                </button>
                <button
                    onClick={() => setActiveSection('analytics')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${activeSection === 'analytics' ? 'bg-primary text-white shadow-glow-primary' : 'text-on-surface-muted hover:text-white'}`}
                >
                    📊 cost center sub-ledger reports
                </button>
            </div>

            {/* --- CORE SECTIONS --- */}
            {activeSection === 'landed' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                    {/* Landed Cost Form */}
                    <div className="lg:col-span-4 bg-surface border border-border p-6 rounded-2xl shadow-xl space-y-4">
                        <h3 className="text-md font-bold text-white flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-primary" /> Cost Capitalization Engine (Landed)
                        </h3>
                        <p className="text-[11px] text-on-surface-muted">
                            Landed costs are defined as supplementary transport, freight, clearance, and cooling fees. Capitalize these fees proportionally based on weight or items volume.
                        </p>

                        <form onSubmit={handleAllocateLandedCost} className="space-y-4 text-xs">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Target Raw Ingredient / Asset</label>
                                <select
                                    required
                                    value={landedItemId}
                                    onChange={e => setLandedItemId(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-bold"
                                >
                                    <option value="">-- Choose Raw Ingredient --</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>🥩 {u.name} (SKU: {u.sku} - Stock: {u.quantity})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-on-surface-muted uppercase">Base Material Cost ($)</label>
                                    <input
                                        type="number"
                                        placeholder="Leave blank to pull from model"
                                        value={landedBaseCost}
                                        onChange={e => setLandedBaseCost(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-mono font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-on-surface-muted uppercase">Received Qty</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={landedQty}
                                        onChange={e => setLandedQty(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-mono font-bold"
                                    />
                                </div>
                            </div>

                            <div className="p-3.5 bg-background rounded-xl border border-border/80 space-y-3">
                                <span className="text-[10px] font-bold uppercase text-primary block">Supplementary Expense Allocation (Prorated)</span>
                                
                                <div className="space-y-2 text-[10px] font-mono">
                                    <div className="flex justify-between items-center">
                                        <span>🚢 Freight & Shipping Fee:</span>
                                        <input
                                            type="number"
                                            value={landedShipping}
                                            onChange={e => setLandedShipping(e.target.value)}
                                            className="w-20 bg-surface border border-border rounded px-1.5 py-0.5 text-right font-bold text-white outline-none"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>🛃 Customs Duty Charges:</span>
                                        <input
                                            type="number"
                                            value={landedCustoms}
                                            onChange={e => setLandedCustoms(e.target.value)}
                                            className="w-20 bg-surface border border-border rounded px-1.5 py-0.5 text-right font-bold text-white outline-none"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>❄️ Cold Storage/Overhead:</span>
                                        <input
                                            type="number"
                                            value={landedStorage}
                                            onChange={e => setLandedStorage(e.target.value)}
                                            className="w-20 bg-surface border border-border rounded px-1.5 py-0.5 text-right font-bold text-white outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Charge Cost Center Hub</label>
                                <select
                                    required
                                    value={landedCostCenter}
                                    onChange={e => setLandedCostCenter(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-bold"
                                >
                                    <option value="">-- Choose Target Center --</option>
                                    {costCenters.map(cc => (
                                        <option key={cc.id} value={cc.id}>📍 {cc.name} ({cc.code})</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-glow-primary hover:bg-primary-hover transition text-xs uppercase flex justify-center items-center gap-1.5"
                            >
                                <Coins className="h-4 w-4" /> Capitalize & Update Cost
                            </button>
                        </form>
                    </div>

                    {/* Costing Log History Table */}
                    <div className="lg:col-span-8 bg-surface border border-border p-6 rounded-2xl shadow-xl space-y-4">
                        <h3 className="text-sm font-bold uppercase text-on-surface-muted flex items-center gap-1.5">
                            <FileSpreadsheet className="h-4 w-4 text-primary" /> Cost Ledger Capitalization History (Firestore Log)
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-background text-on-surface-muted uppercase text-[10px] font-bold">
                                    <tr>
                                        <th className="px-4 py-3">Timestamp</th>
                                        <th className="px-4 py-3">Ingredient Item</th>
                                        <th className="px-4 py-3">Direct Cost</th>
                                        <th className="px-4 py-3">Allocated Fees</th>
                                        <th className="px-4 py-3">Total Landed Cost</th>
                                        <th className="px-4 py-3">Dynamic Landed Unit Cost</th>
                                        <th className="px-4 py-3 text-right">Cost Center</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border text-[11px]">
                                    {landedLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-background/40 transition">
                                            <td className="px-4 py-3.5 text-on-surface-muted font-mono">{new Date(log.allocatedAt).toLocaleString()}</td>
                                            <td className="px-4 py-3.5 font-bold text-white">{log.itemName}</td>
                                            <td className="px-4 py-3.5 font-mono">{formatNumber(log.baseCost)}</td>
                                            <td className="px-4 py-3.5 text-red-400 font-mono">
                                                +{formatNumber(log.shippingFee + log.customsDuty + log.storageOverhead)}
                                            </td>
                                            <td className="px-4 py-3.5 font-bold text-emerald-400 font-mono">{formatNumber(log.totalLandedCost)}</td>
                                            <td className="px-4 py-3.5 text-primary font-bold font-mono">{formatNumber(log.unitPriceRecomputed)}/unit</td>
                                            <td className="px-4 py-3.5 text-right uppercase font-mono"><span className="bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[10px] font-bold">{log.costCenterId}</span></td>
                                        </tr>
                                    ))}
                                    {landedLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-on-surface-muted italic">
                                                No landed capitalization events recorded in system. Allocate above.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeSection === 'transfers' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                    {/* Transfer controls */}
                    <div className="lg:col-span-4 bg-surface border border-border p-6 rounded-2xl shadow-xl space-y-4">
                        <h3 className="text-md font-bold text-white flex items-center gap-2">
                            <ArrowLeftRight className="h-5 w-5 text-primary" /> Stock Custody Relocation Form
                        </h3>
                        <p className="text-[11px] text-on-surface-muted">
                            Move ingredients or goods in the custody index from a central hub to another branch cost center. This relocates value matching the Weighted Average Cost of items.
                        </p>

                        <form onSubmit={handleStockTransfer} className="space-y-4 text-xs font-sans">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Select Material/Good to transfer</label>
                                <select
                                    required
                                    value={transferItemId}
                                    onChange={e => setTransferItemId(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-bold"
                                >
                                    <option value="">-- Choose Stock --</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>📦 {u.name} (Value: {formatNumber(u.unitPrice)}/u - stock: {u.quantity})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Transfer Quantity</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={transferQty}
                                    onChange={e => setTransferQty(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-mono font-bold"
                                />
                            </div>

                            <div className="space-y-3 p-3 bg-background border border-border border-dashed rounded-xl">
                                <div className="space-y-1.5 font-sans">
                                    <label className="text-[10px] font-bold text-on-surface-muted uppercase">From Departure Cost Center</label>
                                    <select
                                        required
                                        value={transferFromCC}
                                        onChange={e => setTransferFromCC(e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-primary"
                                    >
                                        <option value="">-- Select Source --</option>
                                        {costCenters.map(cc => (
                                            <option key={cc.id} value={cc.id}>{cc.name} ({cc.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5 font-sans">
                                    <label className="text-[10px] font-bold text-on-surface-muted uppercase font-sans">To Destination Cost Center Outlet</label>
                                    <select
                                        required
                                        value={transferToCC}
                                        onChange={e => setTransferToCC(e.target.value)}
                                        className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-primary"
                                    >
                                        <option value="">-- Select Destination --</option>
                                        {costCenters.map(cc => (
                                            <option key={cc.id} value={cc.id}>{cc.name} ({cc.code})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-glow-primary hover:bg-primary-hover transition text-xs uppercase flex justify-center items-center gap-1.5 font-sans"
                            >
                                <ArrowRight className="h-4 w-4" /> Authorize Stock Relocation
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-8 bg-surface border border-border p-6 rounded-2xl shadow-xl space-y-4">
                        <h3 className="text-sm font-bold uppercase text-on-surface-muted flex items-center gap-1.5">
                            <ArrowLeftRight className="h-4 w-4 text-primary" /> Custody Transfers Registry (Sub-ledger verification)
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-background text-on-surface-muted uppercase text-[10px] font-bold">
                                    <tr>
                                        <th className="px-4 py-3">Timestamp</th>
                                        <th className="px-4 py-3">Material Good</th>
                                        <th className="px-4 py-3">Quantity</th>
                                        <th className="px-4 py-3 text-red-400">Departed From</th>
                                        <th className="px-4 py-3 text-emerald-400">Assigned To</th>
                                        <th className="px-4 py-3">Assigned Value</th>
                                        <th className="px-4 py-3 text-right">Verification Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border text-[11px] font-mono">
                                    {transferLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-background/40 transition">
                                            <td className="px-4 py-3.5 text-on-surface-muted">{new Date(log.transferredAt).toLocaleString()}</td>
                                            <td className="px-4 py-3.5 font-bold text-white font-sans">{log.itemName}</td>
                                            <td className="px-4 py-3.5 font-bold text-primary">{log.quantity} units</td>
                                            <td className="px-4 py-3.5 text-red-300 font-bold">{log.fromCostCenterId}</td>
                                            <td className="px-4 py-3.5 text-emerald-300 font-bold">{log.toCostCenterId}</td>
                                            <td className="px-4 py-3.5 font-bold text-white">{formatNumber(log.transferCostValue)}</td>
                                            <td className="px-4 py-3.5 text-right font-sans">
                                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded text-[9px] uppercase font-bold">TRANFERRED</span>
                                            </td>
                                        </tr>
                                    ))}
                                    {transferLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-on-surface-muted italic font-sans">
                                                No stock transfer transactions logged. Relocate materials using the form.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeSection === 'production' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in text-sans">
                    {/* WIP Production Runner */}
                    <div className="lg:col-span-4 bg-surface border border-border p-6 rounded-2xl shadow-xl space-y-5">
                        <div className="flex justify-between items-center pb-2 border-b border-border/60">
                            <h3 className="text-md font-bold text-white flex items-center gap-2">
                                <Hammer className="h-5 w-5 text-primary" /> 
                                {selectedVertical === 'REST' && '🍽️ Kitchen Food Prep Activity'}
                                {selectedVertical === 'MANU' && '🏭 Factory Batch Assembly WIP'}
                                {selectedVertical === 'HLTH' && '🏥 Clinical Ward Compounder'}
                                {selectedVertical === 'CONS' && '🏗️ Site Project BOQ Depletion'}
                            </h3>
                        </div>

                        {/* MODE SELECTOR TOGGLE (BOM PRESET VS DIRECT MATERIAL FLOW) */}
                        <div className="grid grid-cols-2 gap-2 bg-background p-1 rounded-xl border border-border text-[11px] font-bold">
                            <button
                                type="button"
                                onClick={() => setCustomMode('BOM')}
                                className={`py-1.5 rounded-lg text-center transition ${customMode === 'BOM' ? 'bg-primary text-white shadow' : 'text-on-surface-muted hover:text-white'}`}
                            >
                                📜 Recipe/BOM Presets
                            </button>
                            <button
                                type="button"
                                onClick={() => setCustomMode('DIRECT')}
                                className={`py-1.5 rounded-lg text-center transition ${customMode === 'DIRECT' ? 'bg-primary text-white shadow' : 'text-on-surface-muted hover:text-white'}`}
                            >
                                🧪 Ad-Hoc / Direct Costing
                            </button>
                        </div>

                        <p className="text-[11px] text-on-surface-muted leading-relaxed">
                            {selectedVertical === 'REST' && 'Converts inventory ingredients (raw portions) to finished ready meals. Reduces raw materials matching wastage bounds and increments final buffet storage.'}
                            {selectedVertical === 'MANU' && 'Manages factory sub-assembly cycles. Integrates material allocations, machinery rent factors, and operator clockings to capitalize finished inventory.'}
                            {selectedVertical === 'HLTH' && 'Dispenses or compounds medical formulas under sterile protocol. Allocates costs directly to specified patient files, creating clinic ward expense entries.'}
                            {selectedVertical === 'CONS' && 'Charges bulk raw physical building components (sand, concrete blocks, steel) directly to corporate BOQ line items at designated project sites.'}
                        </p>

                        <form onSubmit={handleProductionRun} className="space-y-4 text-xs font-sans">
                            {/* DYNAMIC FORM SEGMENTS */}
                            {customMode === 'BOM' ? (
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-on-surface-muted uppercase">Select Preset BOM / Recipe Template</label>
                                    <select
                                        required
                                        value={productionBomId}
                                        onChange={e => setProductionBomId(e.target.value)}
                                        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-bold"
                                    >
                                        <option value="">-- Choose Schema Recipe --</option>
                                        {boms.map(b => (
                                            <option key={b.id} value={b.id}>📜 {b.name} (Ver: {b.bomVersion} — Unit Labor: {formatNumber(b.laborCostPerUnit || 0)})</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-3.5 p-3.5 bg-background border border-border rounded-xl">
                                    <span className="text-[10px] font-bold text-primary uppercase block">Direct Ad-hoc Item Compounding API</span>
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-on-surface-muted uppercase">Deduct Raw Material Item</label>
                                        <select
                                            required
                                            value={adhocRawItemId}
                                            onChange={e => setAdhocRawItemId(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-primary"
                                        >
                                            <option value="">-- Choose Material Stock --</option>
                                            {units.map(u => (
                                                <option key={u.id} value={u.id}>📦 {u.name} (SKU: {u.sku} — Cost: {formatNumber(u.unitPrice)})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-on-surface-muted uppercase">Usage Proportion per Produced Unit</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={adhocRawQtyPerUnit}
                                            onChange={e => setAdhocRawQtyPerUnit(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-primary font-mono font-bold"
                                        />
                                    </div>

                                    {(selectedVertical === 'REST' || selectedVertical === 'MANU' || selectedVertical === 'GENR') && (
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-on-surface-muted uppercase">Increment Capitalized Finished Item</label>
                                            <select
                                                required
                                                value={adhocFinishedItemId}
                                                onChange={e => setAdhocFinishedItemId(e.target.value)}
                                                className="w-full bg-surface border border-border rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-primary"
                                            >
                                                <option value="">-- Select Capitalization Good --</option>
                                                {units.map(u => (
                                                    <option key={u.id} value={u.id}>👑 {u.name} (SKU: {u.sku} — stock: {u.quantity})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* VARIABLE CONFIGURATORS PER VERTICAL */}
                            {selectedVertical === 'MANU' && (
                                <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-indigo-400 uppercase">Operator Labor Wage ($/hr)</label>
                                        <input
                                            type="number"
                                            value={manuLaborRate}
                                            onChange={e => setManuLaborRate(e.target.value)}
                                            className="w-full bg-background border border-border rounded px-2 py-1 text-white font-mono font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-indigo-400 uppercase">Machine Overhead ($/hr)</label>
                                        <input
                                            type="number"
                                            value={manuOverheadRate}
                                            onChange={e => setManuOverheadRate(e.target.value)}
                                            className="w-full bg-background border border-border rounded px-2 py-1 text-white font-mono font-bold"
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedVertical === 'HLTH' && (
                                <div className="space-y-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[10px]">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-rose-400 uppercase">Patient file chart reference</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. PAT-9921-X"
                                                value={hlthPatientId}
                                                onChange={e => setHlthPatientId(e.target.value)}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-white font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-rose-400 uppercase">Prescribing Doctor</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. Dr. Al-Hamdan"
                                                value={hlthDoctorName}
                                                onChange={e => setHlthDoctorName(e.target.value)}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-white font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-rose-400 uppercase">Clinical Environment Wastage / Expiry Buffer (%)</label>
                                        <input
                                            type="number"
                                            value={hlthClinicalWastage}
                                            onChange={e => setHlthClinicalWastage(e.target.value)}
                                            className="w-full bg-background border border-border rounded px-2 py-1 text-white font-mono font-bold"
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedVertical === 'CONS' && (
                                <div className="space-y-3 p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[10px]">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-amber-400 uppercase">Project site BOQ line code</label>
                                            <select
                                                value={consBoqLine}
                                                onChange={e => setConsBoqLine(e.target.value)}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-white font-bold"
                                            >
                                                <option value="BOQ-CIVIL-FOUNDATION">Concrete foundations (CIVIL)</option>
                                                <option value="BOQ-MEP-HVAC-WIRING">HVAC & MEP Ductings</option>
                                                <option value="BOQ-FINISHING-TILES">Interior Tiles / Masonry</option>
                                                <option value="BOQ-STRUCTURAL-FRAMING">Structural Framing Rebar</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-amber-400 uppercase">Subcontractor Allocation Fee</label>
                                            <input
                                                type="number"
                                                value={consSubcontractorFee}
                                                onChange={e => setConsSubcontractorFee(e.target.value)}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-white font-mono font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-bold text-amber-400 uppercase">Sub-contract material scrap spillways (%)</label>
                                        <input
                                            type="number"
                                            value={consScrapVariance}
                                            onChange={e => setConsScrapVariance(e.target.value)}
                                            className="w-full bg-background border border-border rounded px-2 py-1 text-white font-mono font-bold"
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedVertical === 'GENR' && (
                                <div className="space-y-3 p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px]">
                                    <span className="text-[10px] font-bold text-emerald-400 uppercase block">Custom Activity Profile Settings</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-emerald-400 uppercase">Activity Standard Name</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. Agriculture / Consulting"
                                                value={genrCustomName}
                                                onChange={e => setGenrCustomName(e.target.value)}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-white font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-emerald-400 uppercase">Asset Cap Label</label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. Packaged crop"
                                                value={genrAssetCapitalizationLabel}
                                                onChange={e => setGenrAssetCapitalizationLabel(e.target.value)}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-white font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-emerald-400 uppercase">Process Loss (%)</label>
                                            <input
                                                type="number"
                                                value={genrWastageMargin}
                                                onChange={e => setGenrWastageMargin(e.target.value)}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-white font-mono font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-emerald-400 uppercase">Overhead ($/ea)</label>
                                            <input
                                                type="number"
                                                value={genrIndirectOverhead}
                                                onChange={e => setGenrIndirectOverhead(e.target.value)}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-white font-mono font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-emerald-400 uppercase">Process Labor ($/ea)</label>
                                            <input
                                                type="number"
                                                value={genrLaborServiceRate}
                                                onChange={e => setGenrLaborServiceRate(e.target.value)}
                                                className="w-full bg-background border border-border rounded px-2 py-1 text-white font-mono font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5 animate-pulse">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Target Output Quantity (Portions / Batches / Units)</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={productionQty}
                                    onChange={e => setProductionQty(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-mono font-bold text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-muted uppercase">Charge Cost Center / Branch Site Coordinator</label>
                                <select
                                    required
                                    value={productionCC}
                                    onChange={e => setProductionCC(e.target.value)}
                                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-white outline-none focus:border-primary font-bold"
                                >
                                    <option value="">-- Choose Target Center --</option>
                                    {costCenters.map(cc => (
                                        <option key={cc.id} value={cc.id}>📍 {cc.name} ({cc.code})</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-glow-primary hover:bg-primary-hover transition text-xs uppercase flex justify-center items-center gap-1.5"
                            >
                                <Hammer className="h-4 w-4" /> Relocate & Resolve Corporate Costs
                            </button>
                        </form>
                    </div>

                    {/* Manufacturing Run logs */}
                    <div className="lg:col-span-8 bg-surface border border-border p-6 rounded-2xl shadow-xl space-y-4">
                        <h3 className="text-sm font-bold uppercase text-on-surface-muted flex items-center gap-1.5">
                            <Activity className="h-4 w-4 text-primary" /> Active Production Conversion Sub-Ledger Logs
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-background text-on-surface-muted uppercase text-[10px] font-bold">
                                    <tr>
                                        <th className="px-4 py-3">Run Date</th>
                                        <th className="px-4 py-3">Vertical Scope</th>
                                        <th className="px-4 py-3">Conversion Output Good / Allocated Detail</th>
                                        <th className="px-4 py-3 text-right">Volume</th>
                                        <th className="px-4 py-3 text-right font-mono">Materials Cost</th>
                                        <th className="px-4 py-3 text-right font-mono">Overheads Added</th>
                                        <th className="px-4 py-3 text-right font-mono text-emerald-400">Total Booked</th>
                                        <th className="px-4 py-3 text-right">Cost Center ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border text-[11px] font-mono">
                                    {productionLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-background/40 transition">
                                            <td className="px-4 py-3.5 text-on-surface-muted text-[10px]">{new Date(log.createdAt).toLocaleString()}</td>
                                            <td className="px-4 py-3.5 italic font-bold">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono leading-none ${
                                                    (log as any).selectedVertical === 'REST' ? 'bg-indigo-500/10 text-indigo-400' :
                                                    (log as any).selectedVertical === 'MANU' ? 'bg-purple-500/10 text-purple-400' :
                                                    (log as any).selectedVertical === 'HLTH' ? 'bg-rose-500/10 text-rose-400' :
                                                    'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                    {(log as any).selectedVertical || 'REST'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 font-bold font-sans text-white">{log.finishedGoodName}</td>
                                            <td className="px-4 py-3.5 font-bold text-primary text-right">{log.quantityProduced} units</td>
                                            <td className="px-4 py-3.5 text-right">{formatNumber(log.materialCost)}</td>
                                            <td className="px-4 py-3.5 text-zinc-400 text-right">+{formatNumber(log.laborCost + log.overheadCost)}</td>
                                            <td className="px-4 py-3.5 font-bold text-emerald-400 text-right">{formatNumber(log.totalCost)}</td>
                                            <td className="px-4 py-3.5 text-right font-sans uppercase"><span className="bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded text-[10px] font-bold">{log.costCenterId}</span></td>
                                        </tr>
                                    ))}
                                    {productionLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-on-surface-muted italic font-sans animate-pulse">
                                                No conversion runs recorded. Run a production standard recipe above.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeSection === 'analytics' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
                    {/* Cost Center Sub Ledger Trail and Balanced Ledger Postings */}
                    <div className="lg:col-span-12 bg-surface border border-border p-6 rounded-2xl shadow-xl space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-md font-bold text-white flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" /> Cost Centers Balanced General Ledger Trails
                                </h3>
                                <p className="text-xs text-on-surface-muted mt-1">
                                    Double-entry journal entries generated automatically at the core of the ERP system matching corporate allocation and custody handovers.
                                </p>
                            </div>
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded text-xs uppercase font-bold flex items-center gap-1">
                                <Scale className="h-4 w-4" /> BALANCED TRIAL STATUS: OK
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-background text-on-surface-muted uppercase text-[9px] font-bold">
                                    <tr>
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3">Ledger Code Reference</th>
                                        <th className="px-5 py-3">Journal Narrative Description</th>
                                        <th className="px-5 py-3">Sub-ledger Accounts Affected</th>
                                        <th className="px-5 py-3 text-right">Debit ($)</th>
                                        <th className="px-5 py-3 text-right">Credit ($)</th>
                                        <th className="px-5 py-3 text-right">Cost Center</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border text-[11px] font-mono leading-relaxed">
                                    {journalLogs.map(journal => (
                                        <React.Fragment key={journal.id}>
                                            <tr className="bg-background/20 font-sans border-t-2 border-border/80">
                                                <td className="px-5 py-4 text-zinc-400 font-mono text-[10px]">{journal.transactionDate}</td>
                                                <td className="px-5 py-4 font-bold text-zinc-200 text-xs font-mono">{journal.reference}</td>
                                                <td colSpan={4} className="px-5 py-4 font-bold text-white text-xs">{journal.description}</td>
                                                <td className="px-5 py-4 text-right"><span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold">{journal.costCenter}</span></td>
                                            </tr>
                                            {journal.lines.map((line, idx) => (
                                                <tr key={`${journal.id}-line-${idx}`} className="hover:bg-background/10">
                                                    <td></td>
                                                    <td></td>
                                                    <td className="px-5 py-2.5 text-on-surface-muted text-[10px] italic">{line.description || 'General allocation'}</td>
                                                    <td className={`px-5 py-2.5 text-zinc-300 font-sans ${line.credit > 0 ? 'pl-8 text-on-surface-muted' : 'font-semibold text-white'}`}>
                                                        {line.credit > 0 ? '↳ ' : ''}{line.accountName} (Code: {line.accountId})
                                                    </td>
                                                    <td className="px-5 py-2.5 text-right font-bold text-emerald-400">{line.debit > 0 ? formatNumber(line.debit) : '-'}</td>
                                                    <td className="px-5 py-2.5 text-right font-bold text-red-400">{line.credit > 0 ? formatNumber(line.credit) : '-'}</td>
                                                    <td></td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                    {journalLogs.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-12 text-center text-on-surface-muted italic font-sans">
                                                No Cost Center tagged double-entry journals recorded. Capitalize or relocates stock above first.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
