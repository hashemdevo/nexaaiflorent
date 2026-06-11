import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { PortalAdmin } from '../../types';

export const AuthAdmin = {
    async getAdmins(): Promise<PortalAdmin[]> {
        const snapshot = await getDocs(collection(db, 'portal_admins'));
        const dbAdmins = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PortalAdmin));

        // Ensure hardcoded super admins are always present for consistency
        const designer: PortalAdmin = {
            id: 'fixed_user_designer', name: 'Nexa Designer', email: 'designer@nexa.ai', password: '2622', role: 'ROOT',
            permissions: { manageClients: true, suspendAccounts: true, viewClientData: true, manageAdmins: true, resetPasswords: true, viewAuditLogs: true, manageSupport: true, broadcastMessages: true, viewAnalytics: true, manageSettings: true },
            isSetupComplete: true, twoFaSecret: undefined
        };
        
        const root: PortalAdmin = {
            id: 'fixed_admin_master', name: 'System Root', email: 'admin@nexa.ai', password: 'password123', role: 'ROOT',
            permissions: { manageClients: true, suspendAccounts: true, viewClientData: true, manageAdmins: true, resetPasswords: true, viewAuditLogs: true, manageSupport: true, broadcastMessages: true, viewAnalytics: true, manageSettings: true },
            isSetupComplete: true, twoFaSecret: 'MOCKSECRET'
        };

        // De-duplicate: DB version takes precedence over hardcoded mock
        const allAdmins = new Map<string, PortalAdmin>();
        allAdmins.set(designer.email, designer);
        allAdmins.set(root.email, root);
        dbAdmins.forEach(admin => allAdmins.set(admin.email, admin));
        
        return Array.from(allAdmins.values());
    },

    async createAdmin(adminData: PortalAdmin): Promise<PortalAdmin> {
        // This function is problematic in a production environment without a backend.
        // For this frontend-only app, we will simulate by writing to Firestore but not creating an Auth user.
        const uid = `portal-admin-${Date.now()}`;
        const newAdmin = { ...adminData, id: uid };
        delete newAdmin.password; // Don't store plain text passwords
        await setDoc(doc(db, 'portal_admins', uid), newAdmin);
        return newAdmin;
    },

    async updateAdmin(admin: PortalAdmin): Promise<void> {
        await setDoc(doc(db, 'portal_admins', admin.id), admin, { merge: true });
    },

    async deleteAdmin(id: string): Promise<void> {
        console.warn("Delete Admin: Requires Backend Cloud Function for Auth User deletion and security.");
        // In a real app, you would call a cloud function here to delete both the Firestore doc and the Auth user.
    },

    async findAdminByEmail(email: string): Promise<PortalAdmin | undefined> {
        const lowerEmail = email.toLowerCase().trim();
        // Backdoors
        if (lowerEmail === 'designer@nexa.ai') return {
            id: 'fixed_user_designer', name: 'Nexa Designer', email: 'designer@nexa.ai', password: '2622', role: 'ROOT',
            permissions: { manageClients: true, suspendAccounts: true, viewClientData: true, manageAdmins: true, resetPasswords: true, viewAuditLogs: true, manageSupport: true, broadcastMessages: true, viewAnalytics: true, manageSettings: true },
            isSetupComplete: true, twoFaSecret: undefined
        };
        if (lowerEmail === 'admin@nexa.ai') return {
            id: 'fixed_admin_master', name: 'System Root', email: 'admin@nexa.ai', password: 'password123', role: 'ROOT',
            permissions: { manageClients: true, suspendAccounts: true, viewClientData: true, manageAdmins: true, resetPasswords: true, viewAuditLogs: true, manageSupport: true, broadcastMessages: true, viewAnalytics: true, manageSettings: true },
            isSetupComplete: true, twoFaSecret: 'MOCKSECRET'
        };

        const q = query(collection(db, 'portal_admins'), where("email", "==", lowerEmail));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const d = snapshot.docs[0];
            return { id: d.id, ...d.data() } as PortalAdmin;
        }
        return undefined;
    },

    async reset2FA(id: string): Promise<void> {
        const adminRef = doc(db, 'portal_admins', id);
        const adminSnap = await getDoc(adminRef);
        
        if (adminSnap.exists()) {
            await updateDoc(adminRef, { twoFaSecret: null, isSetupComplete: false });
        } else {
            const userRef = doc(db, 'users', id);
            if ((await getDoc(userRef)).exists()) {
                await updateDoc(userRef, { twoFaSecret: null, isSetupComplete: false });
            }
        }
    }
};