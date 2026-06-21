export interface Subscription {
  id?: string;
  ownerName: string;
  ownerEmail: string;
  companyName?: string;
  plan?: string;
  industry?: string;
  expiry: string;
  twoFaSecret?: string;
}

let subs: Subscription[] = [];

export const SubscriptionService = {
  getAll: async () => {
    return subs;
  },
  reset2FA: async (id: string) => {
    return true;
  },
  getDaysRemaining: (expiry: string) => {
    return 30;
  },
  updateSubscription: async (sub: Subscription) => {
    const idx = subs.findIndex(s => s.id === sub.id);
    if(idx >= 0) subs[idx] = sub;
    return true;
  },
  addSubscription: async (sub: Subscription) => {
    subs.push({ ...sub, id: Math.random().toString() });
    return true;
  }
};
