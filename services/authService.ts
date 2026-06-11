
import { AuthCore } from './auth/core';
import { AuthAdmin } from './auth/admin';

export const AuthService = {
    // Core Auth
    login: AuthCore.login,
    logout: AuthCore.logout,
    findUserByIdentity: AuthCore.findUserByIdentity,

    // Admin Management
    getAdmins: AuthAdmin.getAdmins,
    createAdmin: AuthAdmin.createAdmin,
    updateAdmin: AuthAdmin.updateAdmin,
    deleteAdmin: AuthAdmin.deleteAdmin,
    findAdminByEmail: AuthAdmin.findAdminByEmail,
    reset2FA: AuthAdmin.reset2FA,

    // Utils
    recordFailedAttempt(currentAttempts: number) {
        const newAttempts = currentAttempts + 1;
        localStorage.setItem('nexa_failed_login', newAttempts.toString());
        return newAttempts;
    },

    clearFailedAttempts() {
        localStorage.removeItem('nexa_failed_login');
    }
};
