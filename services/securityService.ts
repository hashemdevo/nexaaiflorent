let auditLogs: any[] = [];

export const SecurityService = {
  logAction: (id: string, name: string, type: string, target: string, detail: string) => {
    auditLogs.push({ id, name, type, target, detail, timestamp: new Date().toISOString() });
  },
  getTOTPToken: (secret: string) => {
    return "000000"; // Mock valid token in preview
  },
  getAuditLogs: () => {
    return auditLogs;
  },
  generateRandomSecret: () => {
    return "MOCKSECRET123456";
  },
  generateBackupCodes: () => {
    return ["1234-5678", "8765-4321"];
  },
  checkPermission: (user: any, action: string) => {
    return true;
  }
};
