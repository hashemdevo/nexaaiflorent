
import { DbEngine } from '../core/db';
import { Invoice, InvoiceItem, Customer } from '../core/types';
import { JournalService } from '../ledger/journal';
import { JournalEntryLine } from '../../types';
import { EventBus } from '../core/events';

export const InvoiceService = {
    async getAll(): Promise<Invoice[]> {
        return DbEngine.select<Invoice>('invoices', { orderBy: 'date', orderDir: 'desc' });
    },

    async createInvoice(
        customerId: string, 
        items: InvoiceItem[], 
        date: string, 
        dueDate: string
    ): Promise<Invoice> {
        const trx = await DbEngine.startTransaction();

        try {
            // 1. Calculate Totals
            let subtotal = 0;
            let taxTotal = 0;
            
            items.forEach(item => {
                subtotal += item.total;
                taxTotal += item.taxAmount;
            });
            
            const totalAmount = subtotal + taxTotal;

            // 2. Create Invoice Record
            const invoice: Invoice = {
                id: `inv-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                customerId,
                date,
                dueDate,
                status: 'POSTED', // Auto-post for this workflow
                subtotal,
                taxTotal,
                totalAmount,
                balanceDue: totalAmount,
                items
            };

            // 3. Prepare GL Lines
            const glLines: JournalEntryLine[] = [];

            // Debit: Accounts Receivable (Asset)
            glLines.push({
                accountId: '1200', // AR Account ID from seeds
                accountName: 'Accounts Receivable',
                debit: totalAmount,
                credit: 0
            });

            // Credit: Revenue (Income)
            if (subtotal > 0) {
                glLines.push({
                    accountId: '4000', // Revenue Account ID from seeds
                    accountName: 'Sales Revenue',
                    debit: 0,
                    credit: subtotal
                });
            }

            // Credit: Tax Payable (Liability)
            if (taxTotal > 0) {
                glLines.push({
                    accountId: '2000', // Using AP/Liability for Tax momentarily as placeholder
                    accountName: 'Tax Payable',
                    debit: 0,
                    credit: taxTotal
                });
            }

            // 4. Create Journal Entry (Linked to Invoice)
            const journalEntry = await JournalService.postEntry({
                transactionDate: date,
                postedDate: new Date().toISOString(),
                reference: invoice.invoiceNumber,
                description: `Invoice generated for Customer #${customerId}`,
                lines: glLines,
                totalAmount: totalAmount,
                createdBy: 'SYSTEM'
            }, trx);

            invoice.journalEntryId = journalEntry.id;

            // 5. Save Invoice
            await DbEngine.insert('invoices', invoice, trx);

            // 6. Update Customer Balance (AR Impact)
            const customerRows = await DbEngine.select<any>('customers', { where: { id: customerId } });
            if (customerRows.length > 0) {
                const customer = customerRows[0];
                await DbEngine.update<Customer>('customers', customerId, { balance: (customer.balance || 0) + totalAmount }, trx);
            }

            await trx.commit();

            // 7. Emit Event (Post-Commit)
            EventBus.emit('INVOICE_CREATED', { invoiceId: invoice.id, customerId, totalAmount });

            return invoice;

        } catch (error) {
            await trx.rollback();
            console.error("Invoice Creation Failed", error);
            throw error;
        }
    }
};
