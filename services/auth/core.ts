
import { auth, db } from '../firebaseConfig';
import { signInAnonymously, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ClientEmployee } from '../../types';

export const AuthCore = {
    async login(email: string, pass: string): Promise<{ user: any, role: string, profile: any }> {
        try {
            const lowerEmail = email.toLowerCase().trim();

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

        const q = query(collection(db, 'users'), where("email", "==", lowerEmail));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const d = snapshot.docs[0];
            return { id: d.id, ...d.data() } as ClientEmployee;
        }
        return undefined;
    }
};
