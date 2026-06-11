
import { EventBus } from '../core/events';
import { NotificationService } from '../system/notifications';
import { AuditService } from '../admin/audit';

export const SystemListeners = {
    register() {
        // 1. Invoice Created Handler
        EventBus.on('INVOICE_CREATED', async (payload: any) => {
            console.log(`[Listener] Processing INVOICE_CREATED: ${payload.invoiceId}`);
            
            // A. Send Notification to Sales Team
            // Mocking user ID 'admin'
            await NotificationService.send({
                userId: 'admin',
                title: 'New Invoice Generated',
                message: `Invoice for Customer ${payload.customerId} created. Amount: $${payload.totalAmount}`,
                type: 'SUCCESS',
                link: `/sales/invoices/${payload.invoiceId}`
            });

            // B. Audit Log (Already handled by service, but could add extra meta log)
        });

        // 2. Low Stock Handler (Example of future event)
        EventBus.on('LOW_STOCK_DETECTED', async (payload: any) => {
            await NotificationService.send({
                userId: 'admin',
                title: 'Low Stock Alert',
                message: `Item ${payload.itemName} is below minimum level. Current: ${payload.currentQty}`,
                type: 'WARNING',
                link: `/inventory`
            });
        });

        console.log("✅ System Listeners Registered");
    }
};
