import { DbEngine } from '../core/db';
import { ApprovalRequest, PurchaseOrder } from '../core/types';
import { NotificationService } from '../system/notifications';

export const WorkflowEngine = {
    
    async evaluate(entityId: string, entityType: ApprovalRequest['entityType'], amount: number, requesterId: string, trx?: any): Promise<boolean> {
        // Enforce Multi-stage policy when PO exceeds $5,000
        if (entityType === 'PURCHASE_ORDER' && amount > 5000) {
            // Create a Multi-Stage Approval Request starting at Stage 1 (of 2)
            const request: ApprovalRequest = {
                id: `req-${Date.now()}`,
                tenantId: 'default',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                version: 1,
                entityId,
                entityType,
                requesterId,
                policyId: 'policy-po-multistage-over-5k',
                status: 'PENDING',
                assignedToRoleId: 'PURCHASING_MANAGER', // Stage 1 requires Purchasing Manager
                stage: 1,
                maxStages: 2,
                comments: `Stage 1 of 2: Purchasing Manager review for procurement exceeding SAR 5,000 (Ordered: SAR ${amount.toLocaleString()})`
            };

            await DbEngine.insert('approval_requests', request, trx);

            // Notify Purchasing Manager
            await NotificationService.send({
                userId: 'v-procure', // Nasser Al-Ghamdi
                title: 'PO Stage 1 Approval Urgent',
                message: `Purchase Order ${entityId} exceeds SAR 5,000. Under compliance rules, you must execute Stage 1 approval.`,
                type: 'WARNING',
                link: `/approvals/${request.id}`
            }, trx);

            return false; // Requires approval pipeline, cannot auto-approve
        }

        // Standard Single-stage logic for other modules
        let moduleMap: Record<string, 'PURCHASING' | 'EXPENSES' | 'SALES'> = {
            'PURCHASE_ORDER': 'PURCHASING',
            'EXPENSE_CLAIM': 'EXPENSES',
            'SALES_ORDER': 'SALES'
        };
        
        const policies = await DbEngine.select<any>('approval_policies', { 
            where: { module: moduleMap[entityType] } 
        }).catch(() => []);

        // Retrieve matched threshold rule
        const matchingPolicy = policies.find(p => {
            const boundary = p.triggerCondition && p.triggerCondition.includes('>') 
                ? parseInt(p.triggerCondition.split('>')[1].trim()) 
                : 1000;
            return amount > boundary;
        });

        if (!matchingPolicy) return true; // Auto-approved if no policy trigger matches

        const request: ApprovalRequest = {
            id: `req-${Date.now()}`,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            entityId,
            entityType,
            requesterId,
            policyId: matchingPolicy.id,
            status: 'PENDING',
            assignedToRoleId: matchingPolicy.approverRoleId,
            assignedToUserId: matchingPolicy.approverUserId,
            stage: 1,
            maxStages: 1,
            comments: `Requires executive sign-off under general controls policy ${matchingPolicy.name}`
        };

        await DbEngine.insert('approval_requests', request, trx);

        const targetUser = matchingPolicy.approverUserId || 'v-cfo'; 
        await NotificationService.send({
            userId: targetUser,
            title: 'Action Required',
            message: `New ${entityType} requires manual validation. Amount: SAR ${amount.toLocaleString()}`,
            type: 'WARNING',
            link: `/approvals/${request.id}`
        }, trx);

        return false; 
    },

    async getPendingRequests(userId: string, role?: string): Promise<ApprovalRequest[]> {
        const allPending = await DbEngine.select<ApprovalRequest>('approval_requests', { where: { status: 'PENDING' } });
        
        return allPending.filter(req => 
            (req.assignedToUserId && req.assignedToUserId === userId) || 
            (req.assignedToRoleId && role && req.assignedToRoleId === role)
        );
    },

    async processAction(requestId: string, action: 'APPROVE' | 'REJECT', actorId: string): Promise<ApprovalRequest> {
        const trx = await DbEngine.startTransaction();
        
        try {
            const requests = await DbEngine.select<ApprovalRequest>('approval_requests', { where: { id: requestId } });
            const req = requests[0];
            if (!req) throw new Error("Approval Request not found");

            if (action === 'REJECT') {
                const updated = await DbEngine.update<ApprovalRequest>('approval_requests', requestId, {
                    status: 'REJECTED',
                    approvedBy: actorId,
                    approvalDate: new Date().toISOString(),
                    comments: `Rejected by ${actorId} at Stage ${req.stage || 1}`
                }, trx);

                // Update target entities
                if (req.entityType === 'PURCHASE_ORDER') {
                    await DbEngine.update('purchase_orders', req.entityId, {
                        status: 'REJECTED',
                        updatedAt: new Date().toISOString()
                    } as any, trx);
                }

                await trx.commit();
                return updated;
            }

            // In case of APPROVE action
            const isStageOneOfTwo = req.stage === 1 && req.maxStages === 2;

            if (isStageOneOfTwo) {
                // Advance to Stage 2 (assigned to CEO/CFO role)
                const updated = await DbEngine.update<ApprovalRequest>('approval_requests', requestId, {
                    stage: 2,
                    assignedToRoleId: 'CEO', // CFO/CEO Role for Stage 2 final approval
                    comments: `Stage 1 approved by ${actorId}. Automatically promoted to Stage 2: CFO Final Authorization.`
                }, trx);

                // Notify Stage 2 CFO
                await NotificationService.send({
                    userId: 'v-cfo', // Khalid Al-Sabah
                    title: 'PO Stage 2 CFO Approval Needed',
                    message: `Purchase order ${req.entityId} has passed Stage 1. CFO authorization is now required to release funding.`,
                    type: 'WARNING',
                    link: `/approvals/${req.id}`
                }, trx);

                await trx.commit();
                return updated;
            } else {
                // Final stage approval
                const updated = await DbEngine.update<ApprovalRequest>('approval_requests', requestId, {
                    status: 'APPROVED',
                    approvedBy: actorId,
                    approvalDate: new Date().toISOString(),
                    comments: `Multi-stage validation approved fully by ${actorId} at Stage ${req.stage || 1} of ${req.maxStages || 1}`
                }, trx);

                // Update target entities to APPROVED status
                if (req.entityType === 'PURCHASE_ORDER') {
                    await DbEngine.update('purchase_orders', req.entityId, {
                        status: 'APPROVED',
                        updatedAt: new Date().toISOString()
                    } as any, trx);
                }

                await trx.commit();
                return updated;
            }
        } catch (e) {
            await trx.rollback();
            throw e;
        }
    }
};
