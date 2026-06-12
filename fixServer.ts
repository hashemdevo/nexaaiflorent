import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'server.ts');
let content = fs.readFileSync(file, 'utf8');

// 1. Remove mock database functions
content = content.replace(/\/\/ --- Local Database Simulator Helpers[\s\S]*?\/\/ Secure Enterprise Database Operation Engine/m, '// Secure Enterprise Database Operation Engine');

// 2. Remove the condition `if (!process.env.DATABASE_URL) {  ... } else {` 
// It's a large block, so let's find the boundaries.
content = content.replace(/if \(\!process\.env\.DATABASE_URL\) \{[\s\S]*?\/\/ REAL POSTGRESQL DATABASE ENGINE\s*\/\/\s*==========================================/m, 
`if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is required but not set.");
      }
      
      // ==========================================
      // REAL POSTGRESQL DATABASE ENGINE
      // ==========================================`);

// 3. Fix SQL Injection by double quoting the table name 
// e.g. FROM ${normalizedTable} -> FROM "${normalizedTable}"
content = content.replace(/FROM \$\{normalizedTable\}/g, 'FROM "${normalizedTable}"');
content = content.replace(/UPDATE \$\{normalizedTable\}/g, 'UPDATE "${normalizedTable}"');
content = content.replace(/INSERT INTO \$\{normalizedTable\}/g, 'INSERT INTO "${normalizedTable}"');

// 4. Update the uuid fallback to generateUUIDv7
content = content.replace(/crypto\.randomUUID\(\)/g, "generateUUIDv7()");
// also add import for generateUUIDv7 if not present
if (!content.includes('generateUUIDv7')) {
    content = content.replace(/import express from "express";/, 'import { generateUUIDv7 } from "./types/enterprise";\nimport express from "express";');
}

// 5. Hardcoded UUIDs for accounts fix
// Not here, but we will fix that in outboxConsumer.ts

// 6. Fix userRole header validation
content = content.replace(/let userRole = req\.headers\['x-user-role'\] as string \|\| "ACCOUNTANT";/, `let userRole = req.headers['x-user-role'] as string;
    if (!userRole) {
        return res.status(401).json({ status: "ERROR", error: "Missing x-user-role." });
    }`);

fs.writeFileSync(file, content);
console.log('Fixed server.ts');
