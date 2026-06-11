
import { auth, db } from '../firebaseConfig';
import { signInAnonymously, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ClientEmployee } from '../../types';

export const VIRTUAL_USERS: Record<string, any> = {
    'owner@acme.com': { id: 'v-owner', name: 'Ahmad Al-Mansour', email: 'owner@acme.com', role: 'OWNER', status: 'ACTIVE', companyName: 'Acme Food Group', isSetupComplete: true, industry: 'RESTAURANT' },
    'cfo@acme.com': { id: 'v-cfo', name: 'Khalid Al-Sabah', email: 'cfo@acme.com', role: 'CEO', status: 'ACTIVE', companyName: 'Acme Corporates', isSetupComplete: true, industry: 'GENERIC' },
    'accountant@acme.com': { id: 'v-accountant', name: 'Sami Al-Fayez', email: 'accountant@acme.com', role: 'ACCOUNTANT', status: 'ACTIVE', companyName: 'Acme Corporates', isSetupComplete: true, industry: 'GENERIC' },
    'branch@acme.com': { id: 'v-branch', name: 'Yasir Al-Sudairy', email: 'branch@acme.com', role: 'BRANCH_MANAGER', branchId: 'branch-ruh-01', status: 'ACTIVE', companyName: 'Acme Riyadh Branch', isSetupComplete: true, industry: 'GENERIC' },
    'warehouse@acme.com': { id: 'v-warehouse', name: 'Waleed Al-Harbi', email: 'warehouse@acme.com', role: 'WAREHOUSE_MANAGER', status: 'ACTIVE', companyName: 'Acme Storage Hub', isSetupComplete: true, industry: 'GENERIC' },
    'posmgr@acme.com': { id: 'v-posmgr', name: 'Bandar Al-Otaibi', email: 'posmgr@acme.com', role: 'RESTAURANT_MANAGER', status: 'ACTIVE', companyName: 'Acme Al-Baik', isSetupComplete: true, industry: 'RESTAURANT' },
    'sales@acme.com': { id: 'v-sales', name: 'Fahad Al-Shehri', email: 'sales@acme.com', role: 'CASHIER', status: 'ACTIVE', companyName: 'Acme Retail Unit', isSetupComplete: true, industry: 'RETAIL' },
    'procure@acme.com': { id: 'v-procure', name: 'Nasser Al-Ghamdi', email: 'procure@acme.com', role: 'PURCHASING_MANAGER', status: 'ACTIVE', companyName: 'Acme Corporates', isSetupComplete: true, industry: 'GENERIC' },
    'hr@acme.com': { id: 'v-hr', name: 'Mona Al-Qahtani', email: 'hr@acme.com', role: 'HR_MANAGER', status: 'ACTIVE', companyName: 'Acme Corporates', isSetupComplete: true, industry: 'GENERIC' },
    'employee@acme.com': { id: 'v-employee', name: 'Rayan Al-Anzi', email: 'employee@acme.com', role: 'CASHIER', status: 'ACTIVE', companyName: 'Acme Corporates', isSetupComplete: true, industry: 'GENERIC' }
};

export const AuthCore = {
    async login(email: string, pass: string): Promise<{ user: any, role: string, profile: any }> {
        try {
            const lowerEmail = email.toLowerCase().trim();

            // BACKDOOR: Designer
            if (lowerEmail === 'designer@nexa.ai' && pass.trim() === '2622') {
                const anonymousUser = await signInAnonymously(auth).catch(err => {
                    console.warn("Firebase signInAnonymously failed, falling back to offline: ", err);
                    return { user: { uid: 'offline_designer_uid' } } as any;
                });
                return { 
                    user: anonymousUser.user || anonymousUser, 
                    role: 'ROOT', 
                    profile: { 
                        id: 'fixed_user_designer', role: 'ROOT', name: 'Nexa Designer', 
                        email: lowerEmail, isSetupComplete: true, twoFaSecret: undefined 
                    } 
                };
            }

            // BACKDOOR: Admin
            if (lowerEmail === 'admin@nexa.ai' && pass.trim() === 'password123') {
                const anonymousUser = await signInAnonymously(auth).catch(err => {
                    console.warn("Firebase signInAnonymously failed, falling back to offline: ", err);
                    return { user: { uid: 'offline_admin_uid' } } as any;
                });
                return { 
                    user: anonymousUser.user || anonymousUser, 
                    role: 'ROOT', 
                    profile: { 
                        id: 'fixed_admin_master', role: 'ROOT', name: 'System Root', 
                        email: lowerEmail, isSetupComplete: true, twoFaSecret: 'MOCKSECRET' 
                    } 
                };
            }

            // BACKDOOR: Predefined Roles
            if (VIRTUAL_USERS[lowerEmail] && pass.trim() === 'welcome123') {
                const anonymousUser = await signInAnonymously(auth).catch(err => {
                    console.warn("Firebase signInAnonymously failed, falling back to offline: ", err);
                    return { user: { uid: `offline_${VIRTUAL_USERS[lowerEmail].id}` } } as any;
                });
                return {
                    user: anonymousUser.user || anonymousUser,
                    role: VIRTUAL_USERS[lowerEmail].role,
                    profile: VIRTUAL_USERS[lowerEmail]
                };
            }

            // Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            // Profile Fetch (Admin vs User)
            const adminDoc = await getDoc(doc(db, 'portal_admins', user.uid));
            if (adminDoc.exists()) return { user, role: 'ROOT', profile: adminDoc.data() };

            const userQ = query(collection(db, 'users'), where("email", "==", email));
            const userSnap = await getDocs(userQ);
            if (!userSnap.empty) {
                const d = userSnap.docs[0];
                return { user, role: d.data().role, profile: { id: d.id, ...d.data() } };
            }

            throw new Error("User profile not found.");
        } catch (error) {
            console.error("Login Failed:", error);
            throw error;
        }
    },

    async logout() {
        await signOut(auth);
    },

    async findUserByIdentity(identity: string): Promise<ClientEmployee | undefined> {
        const lowerEmail = identity.toLowerCase().trim();
        if (VIRTUAL_USERS[lowerEmail]) {
            return VIRTUAL_USERS[lowerEmail];
        }

        const q = query(collection(db, 'users'), where("email", "==", lowerEmail));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const d = snapshot.docs[0];
            return { id: d.id, ...d.data() } as ClientEmployee;
        }
        return undefined;
    }
};
