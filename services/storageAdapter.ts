
import { cleanAndParseJSON } from './geminiService';

const CRYPTO_KEY = "NEXA_SECURE_VAULT_KEY_2026";
const ENCRYPTION_PREFIX = "nexa_enc__";

export const encryptData = (text: string): string => {
    let xor = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ CRYPTO_KEY.charCodeAt(i % CRYPTO_KEY.length);
        xor += String.fromCharCode(charCode);
    }
    return ENCRYPTION_PREFIX + btoa(unescape(encodeURIComponent(xor)));
};

export const decryptData = (cipherText: string): string => {
    if (!cipherText.startsWith(ENCRYPTION_PREFIX)) {
         return cipherText;
    }
    const cleanCipher = cipherText.substring(ENCRYPTION_PREFIX.length);
    let xor = '';
    try {
         xor = decodeURIComponent(escape(atob(cleanCipher)));
    } catch {
         xor = atob(cleanCipher);
    }
    let result = '';
    for (let i = 0; i < xor.length; i++) {
         const charCode = xor.charCodeAt(i) ^ CRYPTO_KEY.charCodeAt(i % CRYPTO_KEY.length);
         result += String.fromCharCode(charCode);
    }
    return result;
};

/**
 * StorageAdapter
 * 
 * This service abstracts the underlying data storage mechanism.
 * Currently uses localStorage, but designed to be swapped for IndexedDB (Dexie.js)
 * or a Remote API without breaking the application components.
 * 
 * All methods return Promises to simulate asynchronous DB operations.
 */

export const StorageAdapter = {
    async getItem<T>(key: string, defaultValue: T): Promise<T> {
        return new Promise((resolve) => {
            try {
                const item = localStorage.getItem(key);
                if (item === null) {
                    resolve(defaultValue);
                } else {
                    const decrypted = decryptData(item);
                    resolve(cleanAndParseJSON(decrypted, defaultValue));
                }
            } catch (e) {
                console.error(`Storage Read Error [${key}]:`, e);
                resolve(defaultValue);
            }
        });
    },

    async setItem<T>(key: string, value: T): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const serialized = JSON.stringify(value);
                const encrypted = encryptData(serialized);
                localStorage.setItem(key, encrypted);
                // Dispatch event for cross-tab/component sync
                window.dispatchEvent(new CustomEvent('nexa-storage-update', { detail: { key, value } }));
                resolve();
            } catch (e) {
                console.error(`Storage Write Error [${key}]:`, e);
                reject(e);
            }
        });
    },

    async removeItem(key: string): Promise<void> {
        return new Promise((resolve) => {
            localStorage.removeItem(key);
            window.dispatchEvent(new CustomEvent('nexa-storage-update', { detail: { key, value: null } }));
            resolve();
        });
    },

    // --- Specialized Enterprise Methods ---

    async appendToLog(key: string, entry: any, limit: number = 1000): Promise<void> {
        const logs = await this.getItem(key, [] as any[]);
        const newLogs = [entry, ...logs].slice(0, limit);
        await this.setItem(key, newLogs);
    },

    async backupData(): Promise<string> {
        // Dumps all local storage to a JSON string (for export)
        const data: Record<string, any> = {};
        for(let i=0; i<localStorage.length; i++) {
            const key = localStorage.key(i);
            if(key && key.startsWith('nexa_')) {
                data[key] = await this.getItem(key, null);
            }
        }
        return JSON.stringify(data);
    }
};
