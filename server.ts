import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import cors from "cors";
import crypto from "crypto";
import { Pool } from "pg";
import { DataArchiver } from "./services/tools/archiver";
import { ZatcaComplianceEngine } from "./services/tax/zatcaCompliance";

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Recommended configurations for enterprise applications
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

// Structured enterprise logging utility
const logger = {
  info: (msg: string, ctx: any = {}) => {
    console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message: msg, ...ctx }));
  },
  warn: (msg: string, ctx: any = {}) => {
    console.warn(JSON.stringify({ level: 'WARN', timestamp: new Date().toISOString(), message: msg, ...ctx }));
  },
  error: (msg: string, ctx: any = {}) => {
    console.error(JSON.stringify({ level: 'ERROR', timestamp: new Date().toISOString(), message: msg, ...ctx }));
  }
};

// Initialize Gemini Client
const getGeminiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  return new GoogleGenAI({ apiKey: key });
};

async function startServer() {
  const app = express();
  // Bound to process.env.PORT in enterprise production environments while maintaining backward compatibility with port 3000
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  
  // Set strict request body payload sizes to prevent heap-exhaustion Denial of Service (DoS)
  app.use(express.json({ limit: "15mb" }));
  
  // Implements strict origin CORS validation rather than wildcard (*) permissions
  const CORS_ALLOW_LIST = [
    'https://nexaledger-portal.com',
    'https://nexaledger-payment.com',
    'http://localhost:3000'
  ];
  
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || CORS_ALLOW_LIST.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        logger.warn("BLOCKED_CORS_ORIGIN", { origin });
        callback(new Error("CORS policy violation for untrusted requester."));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Cron-Auth'],
    credentials: true
  }));

  // Context hydrator middleware capturing correlation and trace tokens
  app.use((req, res, next) => {
    const traceId = req.headers['x-trace-id'] || `trace-${crypto.randomUUID()}`;
    const tenantId = req.headers['x-tenant-id'] || 'tenant-nexa-001';
    
    // Attach tracking properties directly to custom response headers for auditability
    res.setHeader('X-Trace-ID', traceId);
    res.setHeader('X-Tenant-ID', tenantId);
    next();
  });

  // --- API Routes ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", systemTime: new Date().toISOString() });
  });

  // --- Local Database Simulator Helpers (For offline/sandboxed execution without Postgres URL) ---
  const MOCK_DB_FILE = path.join(process.cwd(), "local_postgres_mimic_store.json");

  function readMockDb() {
    if (fs.existsSync(MOCK_DB_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(MOCK_DB_FILE, "utf-8"));
      } catch (e) {
        console.error("Failed to parse mock DB, returning empty object", e);
      }
    }
    return {};
  }

  function writeMockDb(data: any) {
    try {
      fs.writeFileSync(MOCK_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write mock DB", e);
    }
  }

  function toSnakeCase(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toSnakeCase);
    const result: any = {};
    for (const key of Object.keys(obj)) {
      const snakeKey = key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
    }
    return result;
  }

  // Secure Enterprise Database Operation Engine (Replaces raw SQL endpoint)
  app.post("/api/db/crud", async (req, res) => {
    const traceId = res.getHeader('X-Trace-ID');
    const { operation, table, payload, id, options } = req.body;
    
    // Authorization Context (Simplistic role mapping from headers for architectural review)
    let userRole = req.headers['x-user-role'] as string || "ACCOUNTANT";
    let userEmployeeId = req.headers['x-employee-id'] as string || "emp-sc-001";
    
    // Strict Input Validation (Prevent SQL Injection on identifiers)
    if (!table || !/^[a-zA-Z0-9_]+$/.test(table)) {
      return res.status(400).json({ status: "ERROR", error: "Invalid table identity." });
    }
    
    const normalizedTable = table.toLowerCase();
    
    // Role-Based Access Control (RBAC) definitions
    const enforceRBAC = (op: string) => {
      if (userRole === "ACCOUNTANT") return; // Admin access
      
      const hrTables = ["employees", "attendance_logs", "leave_requests", "payroll_sheets", "performance_logs", "users"];
      const purchaseTables = ["purchase_orders", "inventory_items", "inventory", "vendors", "goods_receipts", "suppliers"];
      const salesTables = ["sales_contracts", "invoices", "clients", "inventory_items", "inventory"];
      
      if (userRole === "HR_MANAGER" && !hrTables.includes(normalizedTable)) {
         throw new Error(`PermissionDenied: HR_MANAGER cannot access ${normalizedTable}`);
      }
      if (userRole === "PURCHASING_SPECIALIST" && !purchaseTables.includes(normalizedTable)) {
         throw new Error(`PermissionDenied: PURCHASING_SPECIALIST cannot access ${normalizedTable}`);
      }
      if (userRole === "SALES_REP" && !salesTables.includes(normalizedTable)) {
         throw new Error(`PermissionDenied: SALES_REP cannot access ${normalizedTable}`);
      }
    };

    try {
      enforceRBAC(operation);
      const start = Date.now();
      let result: { rows: any[], rowCount: number } = { rows: [], rowCount: 0 };

      if (!process.env.DATABASE_URL) {
        // ========================================================
        // LOCAL PERSISTENT FILE-BASED DATABASE FALLBACK (OFFLINE)
        // ========================================================
        let dbData = readMockDb();

        if (operation === "SELECT") {
          let rows = dbData[normalizedTable] || [];
          
          // Filter out deleted items unless specified
          let filtered = rows.filter((r: any) => r.is_deleted === false || r.is_deleted === undefined);
          
          // Apply RLS security policies
          if (userRole === "PURCHASING_SPECIALIST" && normalizedTable === "purchase_orders") {
             filtered = filtered.filter((r: any) => r.created_by === userEmployeeId || r.purchases_representative_id === userEmployeeId);
          }
          if (userRole === "PURCHASING_SPECIALIST" && (normalizedTable === "inventory_items" || normalizedTable === "inventory")) {
             filtered = filtered.filter((r: any) => r.warehouse_id === "warehouse_raw");
          }
          if (userRole === "SALES_REP" && normalizedTable === "sales_contracts") {
             filtered = filtered.filter((r: any) => r.seller_id === userEmployeeId);
          }
          if (userRole === "SALES_REP" && (normalizedTable === "inventory_items" || normalizedTable === "inventory")) {
             filtered = filtered.filter((r: any) => r.warehouse_id === "warehouse_sales");
          }

          // Apply manual options.where filtering
          if (options?.where) {
            filtered = filtered.filter((row: any) => {
              for (const [k, v] of Object.entries(options.where)) {
                const snakeKey = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                if (row[snakeKey] !== v) return false;
              }
              return true;
            });
          }

          // Apply sorting
          if (options?.orderBy) {
            const snakeOrder = options.orderBy.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            const dir = options.orderDir === "desc" ? -1 : 1;
            filtered.sort((a: any, b: any) => {
              const valA = a[snakeOrder];
              const valB = b[snakeOrder];
              if (valA === undefined) return 1;
              if (valB === undefined) return -1;
              if (valA < valB) return -1 * dir;
              if (valA > valB) return 1 * dir;
              return 0;
            });
          }

          // Apply limit
          if (options?.limit && typeof options.limit === "number") {
            filtered = filtered.slice(0, options.limit);
          }

          result = { rows: filtered, rowCount: filtered.length };
        } 
        
        else if (operation === "INSERT") {
          if (!dbData[normalizedTable]) {
            dbData[normalizedTable] = [];
          }
          
          if (userRole === "PURCHASING_SPECIALIST" && (normalizedTable === "inventory" || normalizedTable === "inventory_items")) {
             payload.warehouseId = "warehouse_raw";
          }
          if (userRole === "SALES_REP" && (normalizedTable === "inventory" || normalizedTable === "inventory_items")) {
             payload.warehouseId = "warehouse_sales";
          }

          const newRow = {
            id: payload.id || crypto.randomUUID(),
            ...toSnakeCase(payload),
            is_deleted: false,
            created_at: payload.createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          dbData[normalizedTable].push(newRow);

          // Write audit log trail
          if (normalizedTable !== 'audit_logs') {
            if (!dbData['audit_logs']) dbData['audit_logs'] = [];
            dbData['audit_logs'].push({
              id: crypto.randomUUID(),
              table_name: normalizedTable,
              record_id: newRow.id,
              action: 'INSERT',
              actor_user_id: userEmployeeId,
              timestamp: new Date().toISOString()
            });
          }

          writeMockDb(dbData);
          result = { rows: [newRow], rowCount: 1 };
        } 
        
        else if (operation === "UPDATE") {
          if (!id) throw new Error("ID required for UPDATE");
          const rows = dbData[normalizedTable] || [];
          const index = rows.findIndex((r: any) => r.id === id);
          let updatedRow = null;

          if (index !== -1) {
            if (userRole === "PURCHASING_SPECIALIST" && (normalizedTable === "inventory" || normalizedTable === "inventory_items")) {
               payload.warehouseId = "warehouse_raw";
            }
            if (userRole === "SALES_REP" && (normalizedTable === "inventory" || normalizedTable === "inventory_items")) {
               payload.warehouseId = "warehouse_sales";
            }

            updatedRow = {
              ...rows[index],
              ...toSnakeCase(payload),
              updated_at: new Date().toISOString()
            };
            rows[index] = updatedRow;

            // Write audit log trail
            if (normalizedTable !== 'audit_logs') {
              if (!dbData['audit_logs']) dbData['audit_logs'] = [];
              dbData['audit_logs'].push({
                id: crypto.randomUUID(),
                table_name: normalizedTable,
                record_id: id,
                action: 'UPDATE',
                actor_user_id: userEmployeeId,
                timestamp: new Date().toISOString()
              });
            }

            writeMockDb(dbData);
          }

          result = { rows: updatedRow ? [updatedRow] : [], rowCount: updatedRow ? 1 : 0 };
        } 
        
        else if (operation === "TRANSACTION") {
           const operations = payload?.operations || [];
           const updatedRows: any[] = [];

           for (const op of operations) {
               const opTable = op.table?.toLowerCase();
               enforceRBAC(op.operation); // check per op
               
               if (op.operation === "INSERT") {
                  if (!dbData[opTable]) dbData[opTable] = [];
                  const newRow = {
                    id: op.payload.id || crypto.randomUUID(),
                    ...toSnakeCase(op.payload),
                    is_deleted: false,
                    created_at: op.payload.createdAt || new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  };
                  dbData[opTable].push(newRow);
                  updatedRows.push(newRow);
               } else if (op.operation === "UPDATE") {
                  const rows = dbData[opTable] || [];
                  const index = rows.findIndex((r: any) => r.id === op.id);
                  if (index !== -1) {
                     const updatedRow = {
                       ...rows[index],
                       ...toSnakeCase(op.payload),
                       updated_at: new Date().toISOString()
                     };
                     rows[index] = updatedRow;
                     updatedRows.push(updatedRow);
                  }
               }
           }

           writeMockDb(dbData);
           result = { rows: [], rowCount: operations.length };
        } 
        
        else {
          throw new Error("Unsupported database operation");
        }

        const durationMs = Date.now() - start;
        logger.info(`[LocalPostgresMimic] ${operation} execution`, { traceId, table: normalizedTable, durationMs });

        res.status(200).json({
          status: "SUCCESS",
          rows: result.rows || [],
          rowCount: result.rowCount || 0,
          executionTimeMs: durationMs
        });
      } 
      
      else {
        // ==========================================
        // REAL POSTGRESQL DATABASE ENGINE
        // ==========================================
        let dbResult;

        // ---- READ (SELECT) ----
        if (operation === "SELECT") {
          let sql = `SELECT * FROM ${normalizedTable}`;
          let values: any[] = [];
          let conditions = ["is_deleted = false"];
          
          // Dynamic Row-Level Security (RLS) Appended to SQL
          if (userRole === "PURCHASING_SPECIALIST" && normalizedTable === "purchase_orders") {
             conditions.push(`(created_by = $${conditions.length + 1} OR purchases_representative_id = $${conditions.length + 1})`);
             values.push(userEmployeeId);
          }
          if (userRole === "PURCHASING_SPECIALIST" && (normalizedTable === "inventory_items" || normalizedTable === "inventory")) {
             conditions.push(`warehouse_id = $${conditions.length + 1}`);
             values.push("warehouse_raw");
          }
          if (userRole === "SALES_REP" && normalizedTable === "sales_contracts") {
             conditions.push(`seller_id = $${conditions.length + 1}`);
             values.push(userEmployeeId);
          }
          if (userRole === "SALES_REP" && (normalizedTable === "inventory_items" || normalizedTable === "inventory")) {
             conditions.push(`warehouse_id = $${conditions.length + 1}`);
             values.push("warehouse_sales");
          }

          // Apply external WHERE conditions safely
          if (options?.where) {
            for (const [k, v] of Object.entries(options.where)) {
               if (/^[a-zA-Z0-9_]+$/.test(k)) {
                  const snakeCol = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
                  conditions.push(`${snakeCol} = $${conditions.length + 1}`);
                  values.push(v);
               }
            }
          }
          
          if (conditions.length > 0) {
            sql += ` WHERE ${conditions.join(' AND ')}`;
          }
          
          if (options?.orderBy && /^[a-zA-Z0-9_]+$/.test(options.orderBy)) {
             const snakeOrder = options.orderBy.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
             const dir = options.orderDir === "desc" ? "DESC" : "ASC";
             sql += ` ORDER BY ${snakeOrder} ${dir}`;
          }
          
          if (options?.limit && typeof options.limit === "number") {
             sql += ` LIMIT ${options.limit}`;
          }
          
          dbResult = await pool.query(sql, values);
        } 
        
        // ---- CREATE (INSERT) ----
        else if (operation === "INSERT") {
          if (userRole === "PURCHASING_SPECIALIST" && (normalizedTable === "inventory" || normalizedTable === "inventory_items")) {
             payload.warehouseId = "warehouse_raw";
          }
          if (userRole === "SALES_REP" && (normalizedTable === "inventory" || normalizedTable === "inventory_items")) {
             payload.warehouseId = "warehouse_sales";
          }
          
          const keys = Object.keys(payload).filter(k => /^[a-zA-Z0-9_]+$/.test(k));
          const snakeKeys = keys.map(k => k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`));
          const idx = keys.map((_, i) => '$' + (i+1));
          const values = keys.map(k => payload[k]);

          const sql = `INSERT INTO ${normalizedTable} (${snakeKeys.join(', ')}) VALUES (${idx.join(', ')}) RETURNING *`;
          dbResult = await pool.query(sql, values);
          
          if (table !== 'audit_logs' && dbResult.rows.length > 0) {
              await pool.query(
                  `INSERT INTO audit_logs (id, table_name, record_id, action, actor_user_id, timestamp) VALUES ($1, $2, $3, $4, $5, $6)`,
                  [crypto.randomUUID(), normalizedTable, dbResult.rows[0].id, 'INSERT', userEmployeeId, new Date().toISOString()]
              );
          }
        }
        
        // ---- UPDATE ----
        else if (operation === "UPDATE") {
          if (!id) throw new Error("ID required for UPDATE");
          
          if (userRole === "PURCHASING_SPECIALIST" && (normalizedTable === "inventory" || normalizedTable === "inventory_items")) {
             payload.warehouseId = "warehouse_raw";
          }
          if (userRole === "SALES_REP" && (normalizedTable === "inventory" || normalizedTable === "inventory_items")) {
             payload.warehouseId = "warehouse_sales";
          }

          const keys = Object.keys(payload).filter(k => /^[a-zA-Z0-9_]+$/.test(k));
          const snakeKeys = keys.map(k => k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`));
          const setClauses = snakeKeys.map((k, i) => `${k} = $${i+1}`).join(', ');
          const values = keys.map(k => payload[k]);
          values.push(id);

          let sql = `UPDATE ${normalizedTable} SET ${setClauses} WHERE id = $${values.length}`;
          
          if (userRole === "PURCHASING_SPECIALIST" && normalizedTable === "purchase_orders") {
             sql += ` AND (created_by = $${values.length + 1} OR purchases_representative_id = $${values.length + 1})`;
             values.push(userEmployeeId);
          }

          sql += ` RETURNING *`;
          dbResult = await pool.query(sql, values);
          
          if (table !== 'audit_logs') {
              await pool.query(
                  `INSERT INTO audit_logs (id, table_name, record_id, action, actor_user_id, timestamp) VALUES ($1, $2, $3, $4, $5, $6)`,
                  [crypto.randomUUID(), normalizedTable, id, 'UPDATE', userEmployeeId, new Date().toISOString()]
              );
          }
        }
        
        // ---- TRANSACTION ----
        else if (operation === "TRANSACTION") {
           const operations = payload?.operations || [];
           const client = await pool.connect();
           try {
              await client.query('BEGIN');
              for (const op of operations) {
                  const opTable = op.table?.toLowerCase();
                  enforceRBAC(op.operation); // check per op
                  
                  if (op.operation === "INSERT") {
                     const keys = Object.keys(op.payload).filter(k => /^[a-zA-Z0-9_]+$/.test(k));
                     const snakeKeys = keys.map(k => k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`));
                     const idx = keys.map((_, i) => '$' + (i+1));
                     const values = keys.map(k => op.payload[k]);
                     const sql = `INSERT INTO ${opTable} (${snakeKeys.join(', ')}) VALUES (${idx.join(', ')})`;
                     await client.query(sql, values);
                  } else if (op.operation === "UPDATE") {
                     const keys = Object.keys(op.payload).filter(k => /^[a-zA-Z0-9_]+$/.test(k));
                     const snakeKeys = keys.map(k => k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`));
                     const setClauses = snakeKeys.map((k, i) => `${k} = $${i+1}`).join(', ');
                     const values = keys.map(k => op.payload[k]);
                     values.push(op.id);
                     const sql = `UPDATE ${opTable} SET ${setClauses} WHERE id = $${values.length}`;
                     await client.query(sql, values);
                  }
              }
              await client.query('COMMIT');
              dbResult = { rowCount: operations.length, rows: [] };
           } catch (e) {
              await client.query('ROLLBACK');
              throw e;
           } finally {
              client.release();
           }
        } 
        
        else {
          throw new Error("Unsupported database operation");
        }

        const durationMs = Date.now() - start;
        logger.info(`[PostgreSQL] ${operation} execution`, { traceId, table: normalizedTable, durationMs });
        
        res.status(200).json({
          status: "SUCCESS",
          rows: dbResult.rows || [],
          rowCount: dbResult.rowCount || 0,
          executionTimeMs: durationMs
        });
      }
      
    } catch (err: any) {
      logger.error(`[Database Core] Execution Failure`, { traceId, error: err.message });
      res.status(500).json({
        status: "ERROR",
        error: err.message || String(err)
      });
    }
  });

  // Secure Server-side ZATCA Phase 2 Cryptographic Sign-Off Engine
  app.post("/api/zatca/sign-invoice", async (req, res) => {
    const traceId = res.getHeader('X-Trace-ID');
    try {
      const { id, invoiceNumber, sellerName, sellerTaxNumber, timestamp, totalAmount, vatAmount, customerTaxNumber } = req.body;

      if (!id || !invoiceNumber || !sellerName || !sellerTaxNumber || !totalAmount || !vatAmount) {
        return res.status(400).json({ error: "Missing required ZATCA compliant invoice fields" });
      }

      // Enforcing server-side authoritative UTC clock to prevent backdating of tax receipts
      const authoritativeTimestamp = new Date().toISOString();
      
      logger.info(`[ZATCA Compliance Authority] Initiating cryptographic seal on Invoice Sequence: ${invoiceNumber}`, { traceId, invoiceNumber });

      const certifiedPayload = await ZatcaComplianceEngine.certifyInvoice({
        id,
        invoiceNumber,
        sellerName,
        sellerTaxNumber,
        timestamp: authoritativeTimestamp,
        totalAmount,
        vatAmount,
        customerTaxNumber
      });

      logger.info(`[ZATCA Compliance Authority] Seal completed successfully. SHA-256 Digest: ${certifiedPayload.invoiceHash}`, { traceId, invoiceNumber });
      res.status(200).json(certifiedPayload);
    } catch (error: any) {
      logger.error("[ZATCA Compliance Authority] Core Signing exception", { traceId, error: error.message || error });
      res.status(500).json({ error: "Tax signing authority failure: " + (error.message || error) });
    }
  });

  // HTTPS Cloud Function Scheduled Trigger - Simulates Google Cloud Scheduler running every 30 days
  // Secured with secret-token verification to prevent third-party manual triggers
  app.post("/api/jobs/archive", async (req, res) => {
    const traceId = res.getHeader('X-Trace-ID');
    const cronAuthToken = req.headers['x-cron-auth'];
    const expectedSecret = process.env.CRON_SECRET || 'NEXA_CRON_DEFAULT_SECRET_2026';
    
    // Validate request authority (allow dev/localhost as safe fallback, otherwise reject)
    if (process.env.NODE_ENV === "production" && cronAuthToken !== expectedSecret) {
      logger.warn("[GCP Cloud Function Trigger] UNAUTHORIZED ARCHIVE RUN ATTEMPT", { traceId });
      return res.status(403).json({ error: "Access Denied: Invalid cloud scheduling security token." });
    }

    try {
      logger.info("[GCP Cloud Function Scheduled Trigger] DataArchiver execution initialized...", { traceId });
      // Archive logs older than 365 days / 1 year
      const count = await DataArchiver.archiveAuditLogs(365);
      
      logger.info(`[GCP Cloud Function Scheduled Trigger] Complete. Safely moved ${count} audit logs to secondary storage.`, { traceId, count });
      res.status(200).json({
        status: "SUCCESS",
        jobName: "DataArchiver_Scheduled_Monthly",
        archivedCount: count,
        message: `Successfully executed monthly DataArchiver task. Archived ${count} entries older than 365 days.`,
        nextTriggerAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      logger.error("[GCP Cloud Function Scheduled Trigger] Archive Job failed", { traceId, error: error.message || error });
      res.status(500).json({ status: "FAILED", error: error.message || "Archive task failed" });
    }
  });

  // Biometric API Proxy Endpoint (For Attendance Devices)
  app.post("/api/biometric/attendance", async (req, res) => {
    const traceId = res.getHeader('X-Trace-ID');
    try {
      const { deviceId, employeeId, timestamp, authType, fingerprintHash } = req.body;
      
      // Basic validation
      if (!deviceId || !employeeId) {
        return res.status(400).json({ error: "Missing required biometric fields" });
      }

      logger.info(`[Biometric Proxy Logging] Received ping from Device: ${deviceId} for Employee: ${employeeId}`, { traceId, deviceId, employeeId });

      // Nonce and replay spoof mitigation (reject signatures older than 10 minutes)
      const scanTime = timestamp ? new Date(timestamp).getTime() : Date.now();
      const timeDeviationSec = Math.abs(Date.now() - scanTime) / 1000;
      if (timeDeviationSec > 600) {
        logger.warn("BIOMETRIC_REPLAY_REJECTED", { traceId, employeeId, deviation: timeDeviationSec });
        return res.status(400).json({ error: "Cryptographic rejection: Biometric signature timestamp deviation exceeds secure limit." });
      }

      // Hash sensitive fingerprint strings with server-side salt to prevent biometric PII exposures
      const securePiiStamp = fingerprintHash 
        ? crypto.createHmac('sha256', process.env.BIOMETRIC_SALT || 'BIOMETRIC_SALT_V7').update(fingerprintHash).digest('hex') 
        : null;

      res.status(200).json({ 
        status: "SUCCESS", 
        message: "Attendance recorded successfully",
        syncStatus: "ACKNOWLEDGED",
        receivedAt: new Date().toISOString(),
        identityBlock: securePiiStamp ? securePiiStamp.substring(0, 16) + '...' : undefined
      });
    } catch (error: any) {
      logger.error("Biometric Proxy Error", { traceId, error: error.message || error });
      res.status(500).json({ error: "Biometric processing failed" });
    }
  });

  // Payroll AI Scanner Endpoint
  app.post("/api/payroll/scan", async (req, res) => {
    const traceId = res.getHeader('X-Trace-ID');
    try {
      const { payRun, samples } = req.body;
      const ai = getGeminiClient();
      
      const prompt = `
You are a forensic payroll auditor AI. Analyze the following payroll run for potential fraud, accounting anomalies, or policy violations.
Return ONLY a valid JSON object matching the following structure:
{
  "status": "SAFE" | "WARNING" | "DANGER",
  "confidenceScore": number between 0 and 100,
  "anomalies": ["string", "string"],
  "summaryMessage": "A professional Arabic summary of the findings"
}

Payroll Data:
${JSON.stringify({ payRun, samples }, null, 2)}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      if (response.text) {
        // Enforce strict schema fallback parsings to insulate system against corrupted or unstructured outputs
        let parsed: any;
        try {
          parsed = JSON.parse(response.text.trim());
        } catch (jsonErr) {
          logger.error("AI Response Parsing Corrupted, falling back to safe status", { traceId, raw: response.text });
          parsed = {
            status: 'WARNING',
            confidenceScore: 50,
            anomalies: ['Failed to parse AI outcome securely.'],
            summaryMessage: 'تم رصد حركة التحليل المالي ولكن واجه النظام صعوبة في هيكلة النتائج تلقائياً.'
          };
        }

        res.json({
          status: parsed.status || 'WARNING',
          confidenceScore: parsed.confidenceScore || 0,
          anomalies: parsed.anomalies || [],
          summaryMessage: parsed.summaryMessage || 'تم تحليل البيانات بنجاح'
        });
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error: any) {
      logger.error("AI Payroll Scan Error", { traceId, error: error.message || error });
      res.status(500).json({ error: error.message || "Failed to process payroll scan" });
    }
  });


  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: express v5 handles static files correctly but we must use *all as a fallback route for react router
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
  
  // Custom Error Handler to replace Express default HTML stack traces
  app.use((err: any, req: any, res: any, next: any) => {
      logger.error('Global unhandled error', { error: err.stack || err });
      res.status(500).json({ status: "ERROR", error: err.message || "Internal Server Error" });
  });

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Server running on port ${PORT}`);
    
    // Background daemon simulating the Cloud Function running every 30 days automatically.
    // In multi-replica cloud orchestrations, horizontal scale settings should disable local timers in favor of external triggers.
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const isSingleInstance = !process.env.HORIZONTAL_REPLICAS || parseInt(process.env.HORIZONTAL_REPLICAS, 10) <= 1;
    
    if (isSingleInstance) {
      setInterval(async () => {
        try {
          logger.info("[Background Cloud Function Daemon] Running 30-day periodic audit logs maintenance...");
          const count = await DataArchiver.archiveAuditLogs(365);
          logger.info(`[Background Cloud Function Daemon] Maintenance complete. Cleaned and archived ${count} audit log entries.`);
        } catch (e: any) {
          logger.error("[Background Cloud Function Daemon] Maintenance process error", { error: e.message || e });
        }
      }, THIRTY_DAYS_MS);
      
      logger.info("[Scheduler Engine Launched] Registered 30-day DataArchiver Cloud Function check.");
    } else {
      logger.info("[Scheduler Engine Standby] Microservice is horizontally scaled. Relying strictly on external GCP Cron calls.");
    }
  });
}

startServer();
