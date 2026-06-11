
import { CompanyRequest, IndustryType } from '../types';
import { DbEngine } from './core/db';
import { BaseEntity } from './core/types';

export interface Subscription extends BaseEntity {
    clientCode: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    company: string;
    industry: IndustryType;
    plan: string;
    license: string;
    expiry: string;
    users: number;
    username: string;
    password: string; // In production, this should be hashed or removed (Auth handles password)
    status: 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED';
    twoFaSecret?: string;
    isSetupComplete?: boolean;
}

interface EnterpriseSubscription extends Subscription, Omit<BaseEntity, 'id'> {}

export const SubscriptionService = {
    // --- DATA ACCESS ---
    async getAll(): Promise<Subscription[]> {
        return DbEngine.select<EnterpriseSubscription>('clients', { orderBy: 'company', orderDir: 'asc' });
    },

    async updateSubscription(updatedSub: Subscription): Promise<void> {
        await DbEngine.update<EnterpriseSubscription>('clients', updatedSub.id!, updatedSub);
    },

    // --- ACTIONS ---
    
    async addSubscription(data: Partial<Subscription>): Promise<Subscription> {
        const id = `SUB-${Date.now()}`;
        const clientCode = `CL-${Math.floor(Math.random() * 9000) + 1000}`;
        
        const newSub: EnterpriseSubscription = {
            id: id,
            tenantId: 'default',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
            clientCode: data.clientCode || clientCode,
            ownerName: data.ownerName || 'Unknown Owner',
            email: data.email || `user-${Date.now()}@nexa.ai`,
            phone: data.phone || '',
            address: data.address || '',
            company: data.company || 'New Company',
            industry: data.industry || 'GENERIC',
            plan: data.plan || 'Standard',
            license: data.license || `NEXA-${Math.random().toString(36).substr(2,4).toUpperCase()}`,
            expiry: data.expiry || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            users: data.users || 5,
            username: data.username || (data.email ? data.email.split('@')[0] : `user.${Date.now()}`),
            password: data.password || 'welcome123',
            status: data.status || 'ACTIVE',
            isSetupComplete: false,
            twoFaSecret: undefined
        };

        await DbEngine.insert('clients', newSub);
        return newSub;
    },

    async reset2FA(subId: string): Promise<void> {
        await DbEngine.update('clients', subId, {
            twoFaSecret: null, // Firestore allows null to clear
            isSetupComplete: false
        } as any);
    },

    async createFromRequest(req: CompanyRequest): Promise<Subscription> {
        return this.addSubscription({
            ownerName: req.clientName,
            email: req.clientEmail,
            phone: req.contactPhone,
            address: req.contactAddress,
            company: req.companyName,
            industry: req.industry as IndustryType || 'GENERIC',
            plan: req.plan,
            users: req.plan === 'Enterprise' ? 20 : 5,
            username: req.clientEmail.split('@')[0] + '.admin',
        });
    },

    // --- UTILS ---
    getCalculatedStatus(expiry: string, status?: string) {
        if (status === 'RESTRICTED') return 'Restricted';
        const today = new Date();
        const expDate = new Date(expiry);
        if (status === 'SUSPENDED' || expDate < today) return 'Suspended';
        return 'Active';
    },

    getDaysRemaining(expiry: string) {
        const today = new Date();
        const expDate = new Date(expiry);
        const diff = expDate.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
};
