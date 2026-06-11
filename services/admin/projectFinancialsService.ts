import { DbEngine } from '../core/db';
import { BaseEntity } from '../core/types';
import { SubscriptionService } from '../subscriptionService';
import { JournalService } from '../ledger/journal';

export interface SaaSRevenue extends BaseEntity {
    companyId: string;
    companyName: string;
    plan: string;
    amount: number;
    billingDate: string;
    status: 'PENDING' | 'PAID';
    paidAt?: string;
    paymentMethod?: 'CASH' | 'VISA' | 'BANK_TRANSFER';
    bankAccountNumber?: string;
    receiptUrl?: string; // Attachment/receipt simulator URL or code
    isPostedToGL?: boolean;
}

export interface SaaSExpense extends BaseEntity {
    category: 'HOSTING' | 'SALARIES' | 'MARKETING' | 'OFFICE' | 'LICENSES' | 'OTHER';
    title: string;
    amount: number;
    issuedAt: string;
    status: 'PENDING' | 'PAID';
    paymentMethod?: 'CASH' | 'VISA' | 'BANK_TRANSFER';
    notes?: string;
    attachmentUrl?: string;
    isPostedToGL?: boolean;
}

export const ProjectFinancialsService = {
    async fetchRevenues(): Promise<SaaSRevenue[]> {
        try {
            const dbRevs = await DbEngine.select<any>('saas_revenues', { orderBy: 'billingDate', orderDir: 'desc' });
            if (dbRevs && dbRevs.length > 0) {
                return dbRevs;
            }

            // Seed initial revenues dynamically based on the current clients
            const clients = await SubscriptionService.getAll();
            const initialRevenues: SaaSRevenue[] = [];

            if (clients && clients.length > 0) {
                clients.forEach((c, index) => {
                    const months = [1, 2, 3, 4, 5];
                    months.forEach(month => {
                        const amount = c.plan === 'Enterprise' ? 2500 : c.plan === 'Standard' ? 750 : 1200;
                        const isPaid = month < 5 || index % 2 === 0;
                        initialRevenues.push({
                            id: `rev-${c.id}-${month}-${Date.now()}`,
                            tenantId: 'default',
                            createdAt: new Date(2026, month - 1, 15).toISOString(),
                            updatedAt: new Date(2026, month - 1, 15).toISOString(),
                            version: 1,
                            companyId: c.id || `MOCK-${index}`,
                            companyName: c.company,
                            plan: c.plan,
                            amount: amount,
                            billingDate: `2026-0${month}-15`,
                            status: isPaid ? 'PAID' : 'PENDING',
                            paidAt: isPaid ? new Date(2026, month - 1, 16).toISOString().split('T')[0] : undefined,
                            paymentMethod: isPaid ? (index % 3 === 0 ? 'BANK_TRANSFER' : index % 3 === 1 ? 'VISA' : 'CASH') : undefined,
                            bankAccountNumber: isPaid && index % 3 === 0 ? 'SA-9012010203049581023' : undefined,
                            receiptUrl: isPaid ? '/mock_receipt_standard.png' : undefined
                        });
                    });
                });
            } else {
                // Flat fallback seeds if no clients are loaded
                const sampleCompanies = [
                    { id: 'SUB-101', name: 'مجموعة الفوزان للتجارة', plan: 'Enterprise', amount: 3500 },
                    { id: 'SUB-102', name: 'مطاعم هاف مليون', plan: 'Standard', amount: 800 },
                    { id: 'SUB-103', name: 'صيدليات الدواء الموحدة', plan: 'Premium', amount: 1400 },
                ];
                sampleCompanies.forEach((c, index) => {
                    [3, 4, 5].forEach(month => {
                        const isPaid = month < 5 || index === 0;
                        initialRevenues.push({
                            id: `rev-${c.id}-${month}`,
                            tenantId: 'default',
                            createdAt: new Date(2026, month - 1, 1).toISOString(),
                            updatedAt: new Date(2026, month - 1, 1).toISOString(),
                            version: 1,
                            companyId: c.id,
                            companyName: c.name,
                            plan: c.plan,
                            amount: c.amount,
                            billingDate: `2026-0${month}-01`,
                            status: isPaid ? 'PAID' : 'PENDING',
                            paidAt: isPaid ? `2026-0${month}-02` : undefined,
                            paymentMethod: isPaid ? (index === 0 ? 'BANK_TRANSFER' : 'VISA') : undefined,
                            bankAccountNumber: isPaid && index === 0 ? 'SA-4028000010928374944' : undefined,
                            receiptUrl: isPaid ? '/receipt.png' : undefined
                        });
                    });
                });
            }

            // Batch insert the seeded revenues
            for (const rev of initialRevenues) {
                await DbEngine.insert<any>('saas_revenues', rev);
            }

            return initialRevenues.sort((a, b) => b.billingDate.localeCompare(a.billingDate));
        } catch (e) {
            console.error('Failed fetching saas revenues: ', e);
            return [];
        }
    },

    async fetchExpenses(): Promise<SaaSExpense[]> {
        try {
            const dbExps = await DbEngine.select<any>('saas_expenses', { orderBy: 'issuedAt', orderDir: 'desc' });
            if (dbExps && dbExps.length > 0) {
                return dbExps;
            }

            // Seed initial project costs
            const initialExpenses: SaaSExpense[] = [
                {
                    id: 'exp-saas-1',
                    tenantId: 'default',
                    createdAt: new Date(2026, 3, 5).toISOString(),
                    updatedAt: new Date(2026, 3, 5).toISOString(),
                    version: 1,
                    category: 'HOSTING',
                    title: 'استضافة خوادم جوجل كلاود وقواعد بيانات Spanner',
                    amount: 1200,
                    issuedAt: '2026-04-05',
                    status: 'PAID',
                    paymentMethod: 'VISA',
                    notes: 'دورة فوترة ابريل 2026 الأساسية لاستضافة خوادم الفروع المشتركة',
                    attachmentUrl: '/hosting_bill.png'
                },
                {
                    id: 'exp-saas-2',
                    tenantId: 'default',
                    createdAt: new Date(2026, 3, 25).toISOString(),
                    updatedAt: new Date(2026, 3, 25).toISOString(),
                    version: 1,
                    category: 'SALARIES',
                    title: 'رواتب المهندسين ومطوري الواجهات والباك إند',
                    amount: 14500,
                    issuedAt: '2026-04-25',
                    status: 'PAID',
                    paymentMethod: 'BANK_TRANSFER',
                    notes: 'مسيرات رواتب طاقم التطوير التقني لنصف شهر أبريل',
                    attachmentUrl: '/salaries_receipt.png'
                },
                {
                    id: 'exp-saas-3',
                    tenantId: 'default',
                    createdAt: new Date(2026, 4, 1).toISOString(),
                    updatedAt: new Date(2026, 4, 1).toISOString(),
                    version: 1,
                    category: 'LICENSES',
                    title: 'رخص واجهات برمجة تطبيقات الخرائط ونظام الذكاء الاصطناعي Gemini API',
                    amount: 650,
                    issuedAt: '2026-05-01',
                    status: 'PAID',
                    paymentMethod: 'VISA',
                    notes: 'رخص تشغيل خدمات الجغرافي ونمذجة فحص الثغرات الحسابية بالذكاء الاصطناعي',
                    attachmentUrl: '/gemini_bill.png'
                },
                {
                    id: 'exp-saas-4',
                    tenantId: 'default',
                    createdAt: new Date(2026, 4, 10).toISOString(),
                    updatedAt: new Date(2026, 4, 10).toISOString(),
                    version: 1,
                    category: 'MARKETING',
                    title: 'حملات إعلانات جوجل ولينكد إن لجذب الشركات',
                    amount: 2300,
                    issuedAt: '2026-05-10',
                    status: 'PENDING',
                    notes: 'حملات ممولة مستهدفة لقطاع التجزئة والمقاولات في الرياض وجدة',
                    attachmentUrl: undefined
                },
                {
                    id: 'exp-saas-5',
                    tenantId: 'default',
                    createdAt: new Date(2026, 4, 12).toISOString(),
                    updatedAt: new Date(2026, 4, 12).toISOString(),
                    version: 1,
                    category: 'OFFICE',
                    title: 'إيجار مساحات العمل المشتركة ومستلزمات الضيافة مكتب الرياض',
                    amount: 4000,
                    issuedAt: '2026-05-12',
                    status: 'PAID',
                    paymentMethod: 'BANK_TRANSFER',
                    notes: 'الإيجار الشهري لمقر شركة نكسا ريزيدنس',
                    attachmentUrl: '/office_receipt.png'
                }
            ];

            for (const exp of initialExpenses) {
                await DbEngine.insert<any>('saas_expenses', exp);
            }

            return initialExpenses.sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
        } catch (e) {
            console.error('Failed fetching saas expenses: ', e);
            return [];
        }
    },

    async addRevenue(data: Partial<SaaSRevenue>): Promise<SaaSRevenue> {
        const id = `rev-${Date.now()}`;
        const newRev: SaaSRevenue = {
            id,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            companyId: data.companyId || 'UNKNOWN',
            companyName: data.companyName || 'Unknown Company',
            plan: data.plan || 'Standard',
            amount: Number(data.amount) || 0,
            billingDate: data.billingDate || new Date().toISOString().split('T')[0],
            status: data.status || 'PENDING',
            paidAt: data.status === 'PAID' ? (data.paidAt || new Date().toISOString().split('T')[0]) : undefined,
            paymentMethod: data.status === 'PAID' ? data.paymentMethod : undefined,
            bankAccountNumber: data.status === 'PAID' ? data.bankAccountNumber : undefined,
            receiptUrl: data.status === 'PAID' ? (data.receiptUrl || '/placeholder_receipt.png') : undefined
        };

        await DbEngine.insert<any>('saas_revenues', newRev);
        return newRev;
    },

    async updateRevenue(id: string, updates: Partial<SaaSRevenue>): Promise<SaaSRevenue> {
        const payload: Partial<SaaSRevenue> = {
            ...updates,
            updatedAt: new Date().toISOString()
        };
        if (updates.status === 'PAID') {
            payload.paidAt = updates.paidAt || new Date().toISOString().split('T')[0];
        } else if (updates.status === 'PENDING') {
            payload.paidAt = '';
            payload.paymentMethod = undefined;
            payload.bankAccountNumber = '';
            payload.receiptUrl = '';
        }

        return DbEngine.update<any>('saas_revenues', id, payload);
    },

    async addExpense(data: Partial<SaaSExpense>): Promise<SaaSExpense> {
        const id = `exp-saas-${Date.now()}`;
        const newExp: SaaSExpense = {
            id,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            category: data.category || 'OTHER',
            title: data.title || 'Other project expense',
            amount: Number(data.amount) || 0,
            issuedAt: data.issuedAt || new Date().toISOString().split('T')[0],
            status: data.status || 'PENDING',
            paymentMethod: data.status === 'PAID' ? data.paymentMethod : undefined,
            notes: data.notes || '',
            attachmentUrl: data.status === 'PAID' ? (data.attachmentUrl || '/placeholder_bill.png') : undefined
        };

        await DbEngine.insert<any>('saas_expenses', newExp);
        return newExp;
    },

    async updateExpense(id: string, updates: Partial<SaaSExpense>): Promise<SaaSExpense> {
        const payload: Partial<SaaSExpense> = {
            ...updates,
            updatedAt: new Date().toISOString()
        };
        return DbEngine.update<any>('saas_expenses', id, payload);
    },

    async deleteExpense(id: string): Promise<void> {
        await DbEngine.delete('saas_expenses', id);
    },

    async postRevenueToGL(revenueId: string): Promise<void> {
        const rev = await DbEngine.select<any>('saas_revenues', { where: { id: revenueId } });
        if (!rev || rev.length === 0) throw new Error("Revenue record not found");
        
        const record = rev[0];
        if (record.isPostedToGL) throw new Error("Already posted to ledger");

        // Prepare Double-Entry Journal Entry
        // Debit: Cash/Bank Account ('1010' or '1200' Account Receivable if PENDING)
        // Credit: Sales Revenue ('4000')
        const accountId = record.status === 'PAID' ? '1010' : '1200';
        
        await JournalService.postEntry({
            transactionDate: record.billingDate,
            postedDate: new Date().toISOString().split('T')[0],
            description: `[ترحيل تلقائي للمنشأة] إيرادات اشتراك برنامج نكسا: ${record.companyName} (${record.plan})`,
            reference: record.id,
            createdBy: 'SYSTEM_POSTING',
            totalAmount: record.amount,
            lines: [
                { accountId: accountId, description: `إيرادات محصلة من ${record.companyName}`, debit: record.amount, credit: 0 },
                { accountId: '4000', description: `إيرادات اشتراكات برمجيات السحاب نكسا`, debit: 0, credit: record.amount }
            ]
        });

        // Update database state
        await DbEngine.update<any>('saas_revenues', revenueId, { isPostedToGL: true });
    },

    async postExpenseToGL(expenseId: string): Promise<void> {
        const exp = await DbEngine.select<any>('saas_expenses', { where: { id: expenseId } });
        if (!exp || exp.length === 0) throw new Error("Expense record not found");
        
        const record = exp[0];
        if (record.isPostedToGL) throw new Error("Already posted to ledger");

        // Prepare Double-Entry Journal Entry
        // Debit: Cost Of Goods Sold / Rent Expense / Operations Expense (e.g., '5000' or '5100')
        // Credit: Cash/Bank Account ('1010') or Account Payable ('2000' if PENDING)
        const expenseAccount = record.category === 'HOSTING' || record.category === 'SALARIES' ? '3000' : '5100'; // Fallback to equity or Rent
        const offsetAccount = record.status === 'PAID' ? '1010' : '2000';

        await JournalService.postEntry({
            transactionDate: record.issuedAt,
            postedDate: new Date().toISOString().split('T')[0],
            description: `[ترحيل تلقائي للمنشأة] مصروف تشغيل نكسا: ${record.title}`,
            reference: record.id,
            createdBy: 'SYSTEM_POSTING',
            totalAmount: record.amount,
            lines: [
                { accountId: expenseAccount, description: `سداد مصروف لبيان: ${record.title}`, debit: record.amount, credit: 0 },
                { accountId: offsetAccount, description: `مقابل مصروف: ${record.title}`, debit: 0, credit: record.amount }
            ]
        });

        // Update database state
        await DbEngine.update<any>('saas_expenses', expenseId, { isPostedToGL: true });
    }
};
