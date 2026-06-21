import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { PortalAdmin } from '../../types';

export const AuthAdmin = {
    async getAdmins(): Promise<PortalAdmin[]> {
        const snapshot = await getDocs(collection(db, 'portal_admins'));
        const dbAdmins = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PortalAdmin));

        const allAdmins = new Map<string, PortalAdmin>();
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