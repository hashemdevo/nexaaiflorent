
import { ApprovalRequest, ApprovalPolicy } from '../core/types';

export type { ApprovalRequest, ApprovalPolicy };

export interface CreatePolicyDTO {
    name: string;
    module: ApprovalPolicy['module'];
    triggerCondition: string;
    approverRoleId?: string;
    approverUserId?: string;
}

export interface ApprovalActionDTO {
    requestId: string;
    actorId: string;
    action: 'APPROVE' | 'REJECT';
    comments?: string;
}
