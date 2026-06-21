import fs from 'fs';
import path from 'path';

// Fix accounts.ts
const accountsFile = path.join(process.cwd(), 'services/ledger/accounts.ts');
let accountsContent = fs.readFileSync(accountsFile, 'utf8');

if (!accountsContent.includes('generateUUIDv7')) {
    accountsContent = accountsContent.replace(
        "import { BaseEntity } from '../core/types';",
        "import { BaseEntity } from '../core/types';\nimport { generateUUIDv7 } from '../../types/enterprise';"
    );
}

// Ensure `getByCode` is on AccountService
if (!accountsContent.includes('getByCode(code: string)')) {
    accountsContent = accountsContent.replace(
        "async getAll(): Promise<Account[]> {",
        "async getByCode(code: string): Promise<Account | undefined> {\n        const results = await DbEngine.select<EnterpriseAccount>('accounts', { where: { code } });\n        return results[0];\n    },\n\n    async getAll(): Promise<Account[]> {"
    );
}

// Change `id: '1010'` to `id: generateUUIDv7()`
accountsContent = accountsContent.replace(/id: '1010'/g, "id: generateUUIDv7()");
accountsContent = accountsContent.replace(/id: '1200'/g, "id: generateUUIDv7()");
accountsContent = accountsContent.replace(/id: '2000'/g, "id: generateUUIDv7()");
accountsContent = accountsContent.replace(/id: '3000'/g, "id: generateUUIDv7()");
accountsContent = accountsContent.replace(/id: '3100'/g, "id: generateUUIDv7()");
accountsContent = accountsContent.replace(/id: '4000'/g, "id: generateUUIDv7()");
accountsContent = accountsContent.replace(/id: '5000'/g, "id: generateUUIDv7()");
accountsContent = accountsContent.replace(/id: '5100'/g, "id: generateUUIDv7()");

fs.writeFileSync(accountsFile, accountsContent);


// Fix outboxConsumer.ts
const outboxFile = path.join(process.cwd(), 'services/ledger/outboxConsumer.ts');
let outboxContent = fs.readFileSync(outboxFile, 'utf8');

if (!outboxContent.includes('AccountService.getByCode')) {
    outboxContent = "import { AccountService } from './accounts';\n" + outboxContent;
    
    // Replace hardcoded strings
    outboxContent = outboxContent.replace(/accountId: '1200'/g, "accountId: (await AccountService.getByCode('1200'))?.id || '1200'");
    outboxContent = outboxContent.replace(/accountId: '4000'/g, "accountId: (await AccountService.getByCode('4000'))?.id || '4000'");
    outboxContent = outboxContent.replace(/accountId: '2000'/g, "accountId: (await AccountService.getByCode('2000'))?.id || '2000'");
    outboxContent = outboxContent.replace(/accountId: '1010'/g, "accountId: (await AccountService.getByCode('1010'))?.id || '1010'");
    outboxContent = outboxContent.replace(/accountId: '5000'/g, "accountId: (await AccountService.getByCode('5000'))?.id || '5000'");
    outboxContent = outboxContent.replace(/accountId: '3000'/g, "accountId: (await AccountService.getByCode('3000'))?.id || '3000'");
    outboxContent = outboxContent.replace(/accountId: payload\.paymentAccountId \|\| '1010'/g, "accountId: payload.paymentAccountId || (await AccountService.getByCode('1010'))?.id || '1010'");
    outboxContent = outboxContent.replace(/accountId: item\.expenseAccountId \|\| '5000'/g, "accountId: item.expenseAccountId || (await AccountService.getByCode('5000'))?.id || '5000'");

    // Add HR Events to outbox switch
    outboxContent = outboxContent.replace(
        "default:\n                throw new Error",
        "case 'ATTENDANCE_CLOCKED_IN':\n            case 'ATTENDANCE_CLOCKED_OUT':\n                // HR Events (No direct journal entry needed, just mark PROCESSED)\n                break;\n            default:\n                throw new Error"
    );

    fs.writeFileSync(outboxFile, outboxContent);
}

// Fix attendance.ts
const attendanceFile = path.join(process.cwd(), 'services/hrm/attendance.ts');
let attendanceContent = fs.readFileSync(attendanceFile, 'utf8');

// Remove hardcoded tenantId default
attendanceContent = attendanceContent.replace(/tenantId: string = 'tenant-nexa-001'/g, "tenantId: string");
fs.writeFileSync(attendanceFile, attendanceContent);


// Fix securityService.ts
const securityFile = path.join(process.cwd(), 'services/securityService.ts');
if (fs.existsSync(securityFile)) {
    let securityContent = fs.readFileSync(securityFile, 'utf8');
    // We shouldn't use localStorage. Let's see what it does.
    securityContent = securityContent.replace(/localStorage\.getItem\([^)]+\)/g, "null");
    securityContent = securityContent.replace(/localStorage\.setItem\([^)]+\)/g, "/* disabled frontend storage */");
    fs.writeFileSync(securityFile, securityContent);
}

// Finally, we need to remove firebase-applet-config.json
const firebaseConfig = path.join(process.cwd(), 'services/firebase-applet-config.json');
if (fs.existsSync(firebaseConfig)) {
    fs.unlinkSync(firebaseConfig);
}
const firebaseConfigRoot = path.join(process.cwd(), 'firebase-applet-config.json');
if (fs.existsSync(firebaseConfigRoot)) {
    fs.unlinkSync(firebaseConfigRoot);
}

console.log('Fixed related files');
