import { generateUUIDv7, BaseEntity } from "../../types/enterprise";
import { TableName, DbTransaction } from "./types";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface QueryOptions {
  where?: Record<string, any>;
  orderBy?: string;
  orderDir?: "asc" | "desc";
  limit?: number;
}

export interface PostgresQueryLog {
  id: string;
  query: string;
  timestamp: string;
  durationMs: number;
  status: 'SUCCESS' | 'ERROR';
  error?: string;
}

export interface PostgreSQLQueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}

export const postgresQueryLogs: PostgresQueryLog[] = [];

// Helper to execute CRUD operations securely against our Express backend

class RequestQueue {
    private queue: (() => Promise<void>)[] = [];
    private active = 0;
    private maxConcurrent = 1;

    async enqueue<T>(task: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (e) {
                    reject(e);
                } finally {
                    this.active--;
                    setTimeout(() => this.dequeue(), 350); // 350ms delay to prevent 429 rate limit
                }
            });
            this.dequeue();
        });
    }

    private dequeue() {
        if (this.active >= this.maxConcurrent || this.queue.length === 0) return;
        this.active++;
        const next = this.queue.shift();
        if (next) next();
    }
}

const dbReqQueue = new RequestQueue();

async function execCrud(operation: string, table: string, payload?: any, id?: string, options?: any): Promise<PostgreSQLQueryResult> {
    return dbReqQueue.enqueue(async () => {
        let retries = 10;
        while (retries > 0) {
            const start = Date.now();
            try {
                let userRole = "ACCOUNTANT";
                let userEmployeeId = "emp-sc-001";
                let tenantId = "tenant-nexa-001";
                
                let baseUrl = "http://localhost:3000";
                if (typeof window !== "undefined") {
                    baseUrl = "";
                    if (typeof localStorage !== "undefined") {
                        userRole = localStorage.getItem("currentUserRole") || "ACCOUNTANT";
                        userEmployeeId = localStorage.getItem("currentUserEmployeeId") || "emp-sc-001";
                        tenantId = localStorage.getItem("currentUserTenantId") || "tenant-nexa-001";
                    }
                }

                const res = await fetch(`${baseUrl}/api/db/crud`, {
                    method: "POST",
                    headers: { 
                      "Content-Type": "application/json",
                      "X-User-Role": userRole,
                      "X-Employee-ID": userEmployeeId,
                      "X-Tenant-ID": tenantId
                    },
                    body: JSON.stringify({ operation, table, payload, id, options })
                });
                
                if (!res.ok) {
                   const errText = await res.text();
                   if (res.status === 429) {
                       throw new Error(`RateLimited: ${errText}`);
                   }
                   throw new Error(`HTTP ${res.status}: ${errText}`);
                }
                
                const data = await res.json();

                const durationMs = Date.now() - start;
                
                if (data.status === "ERROR") {
                    throw new Error(data.error);
                }
                
                postgresQueryLogs.unshift({
                    id: generateUUIDv7(),
                    query: `[${operation}] on ${table}`,
                    timestamp: new Date().toISOString(),
                    durationMs,
                    status: 'SUCCESS'
                });
                
                return data as PostgreSQLQueryResult;
            } catch(err: any) {
                if ((err.message.includes('RateLimited') || err.message.includes('429')) && retries > 1) {
                    retries--;
                    console.warn(`[DbEngine] Hit Rate Limit (429). Retrying... (${retries} attempts left)`);
                    const backoffMs = (10 - retries) * 2000; // 2s, 4s, 6s...
                    await new Promise(r => setTimeout(r, backoffMs));
                    continue;
                }
                postgresQueryLogs.unshift({
                    id: generateUUIDv7(),
                    query: `[${operation}] on ${table}`,
                    timestamp: new Date().toISOString(),
                    durationMs: Date.now() - start,
                    status: 'ERROR',
                    error: err.message
                });
                throw err;
            }
        }
        throw new Error("Maximum retries reached for DB operation");
    });
}

export const DbEngine = {
  async startTransaction(): Promise<DbTransaction> {
    const tx = {
      id: `tx-${generateUUIDv7()}`,
      operations: [] as any[],
      status: "PENDING" as any,
      commit: async () => {
        try {
            await execCrud("TRANSACTION", "bulk", { operations: tx.operations });
            tx.status = "COMMITTED";
        } catch (e) {
            tx.status = "ROLLED_BACK";
            throw e;
        }
      },
      rollback: async () => {
        console.log("Transaction Rolled Back (Local Discarded)");
        tx.status = "ROLLED_BACK";
      },
    } as any;
    return tx;
  },

  async getOneDoc<T extends BaseEntity>(table: TableName, id: string): Promise<T | null> {
      try {
          const res = await execCrud("SELECT", table, null, undefined, { limit: 1, where: { id } });
          if(res.rows && res.rows.length === 0) return null;
          return res.rows[0] as T;
      } catch(e) {
          return null; 
      }
  },

  async getOne<T extends BaseEntity>(table: TableName, id: string): Promise<T | null> {
      return this.getOneDoc(table, id);
  },

  async insert<T extends BaseEntity>(table: TableName, item: T, transaction?: DbTransaction): Promise<T> {
      let activeId = item.id || generateUUIDv7();
      item.id = activeId;
      item.createdAt = item.createdAt || new Date().toISOString();
      item.updatedAt = new Date().toISOString();
      item.version = 1;
      item.isDeleted = false;

      const safeItem = Object.fromEntries(Object.entries(item).filter(([_, v]) => v !== undefined));
      
      if(transaction) {
          (transaction as any).operations.push({ operation: "INSERT", table, payload: safeItem });
      } else {
          await execCrud("INSERT", table, safeItem);
      }
      return safeItem as T;
  },

  async update<T extends BaseEntity>(table: TableName, id: string, updates: Partial<T>, transaction?: DbTransaction): Promise<T> {
      const cleanUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
      const nextVersion = (cleanUpdates.version || 1) + 1;
      cleanUpdates.version = nextVersion;
      cleanUpdates.updatedAt = new Date().toISOString();

      if(transaction) {
          (transaction as any).operations.push({ operation: "UPDATE", table, payload: cleanUpdates, id });
      } else {
          await execCrud("UPDATE", table, cleanUpdates, id);
      }
      
      return cleanUpdates as unknown as T;
  },

  async delete(table: TableName, id: string): Promise<void> {
      const deletedAt = new Date().toISOString();
      await execCrud("UPDATE", table, { isDeleted: true, deletedAt }, id);
  },

  async select<T extends BaseEntity>(table: TableName, options: QueryOptions = {}): Promise<T[]> {
      try {
          const res = await execCrud("SELECT", table, null, undefined, options);
          if (!res || !res.rows) return [];
          const camelCaseRows = res.rows.map((row: any) => {
              const camelRow: any = {};
              for(const key of Object.keys(row)) {
                  const camelKey = key.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', ''));
                  camelRow[camelKey] = row[key];
              }
              return camelRow;
          });
          return camelCaseRows as T[];
      } catch(e) {
          console.error(e);
          return [];
      }
  },

  async getTable<T>(table: TableName): Promise<T[]> {
      return this.select(table);
  },

  async saveTable<T>(table: TableName, data: T[]): Promise<void> {
      const tx = await this.startTransaction();
      for(const item of data) {
          await this.insert(table, item as any, tx);
      }
      await tx.commit();
  },

  async runPostgresQuery(sqlQuery: string): Promise<PostgreSQLQueryResult> {
      return {
          columns: [],
          rows: [],
          rowCount: 0,
          executionTimeMs: 0,
          error: "Raw SQL query endpoint disabled. Please use standard ORM CRUD interfaces to interact with PostgreSQL."
      };
  }
};
