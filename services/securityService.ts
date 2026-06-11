
import { AuditLogEntry } from '../types';
import { AuditService } from './admin/audit';
import { cleanAndParseJSON } from './geminiService';

// --- CRYPTOGRAPHIC UTILITIES ---

export const SecurityService = {
  // 1. SHA-256 Hashing
  async sha256(message: string) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // 2. Generate Random Secret for 2FA
  generateRandomSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  },

  // 3. Generate Backup Codes
  generateBackupCodes() {
    return Array.from({ length: 6 }, () => 
      Math.random().toString(36).substr(2, 4).toUpperCase() + '-' + 
      Math.random().toString(36).substr(2, 4).toUpperCase()
    );
  },

  // 4. TOTP Generation (RFC 6238)
  async getTOTPToken(secret: string) {
    if (!secret) return '';
    
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (let i = 0; i < secret.length; i++) {
      const val = base32chars.indexOf(secret.charAt(i).toUpperCase());
      if (val === -1) continue; 
      bits += val.toString(2).padStart(5, '0');
    }
    const buffer = new Uint8Array(bits.length / 8);
    for (let i = 0; i < bits.length; i += 8) {
      buffer[i / 8] = parseInt(bits.substring(i, i + 8), 2);
    }

    const epoch = Math.round(new Date().getTime() / 1000.0);
    const time = Math.floor(epoch / 30);
    const timeBuffer = new ArrayBuffer(8);
    const timeArray = new DataView(timeBuffer);
    timeArray.setBigUint64(0, BigInt(time), false); 

    const key = await crypto.subtle.importKey('raw', buffer, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
    const signature = await crypto.subtle.sign('HMAC', key, timeBuffer);
    const hmac = new Uint8Array(signature);

    const offset = hmac[hmac.length - 1] & 0xf;
    const binary =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);
    
    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  },

  // --- AUDIT LOGGING ADAPTER ---

  getAuditLogs(): AuditLogEntry[] {
    try {
        const saved = localStorage.getItem('nexa_db_audit_logs');
        // Securely parse with sanitizer
        return cleanAndParseJSON(saved, []);
    } catch {
        return [];
    }
  },

  logAction(actorId: string, actorName: string, action: AuditLogEntry['action'], target: string, details?: string) {
    // Fire and forget async log
    AuditService.log(actorId, actorName, action, target, details).catch(console.error);
    
    // Return mock updated list for legacy state compatibility if needed
    return [];
  }
};
