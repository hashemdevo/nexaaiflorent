import { Pool } from 'pg';
const pool = new Pool();

async function fix() {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employees'");
    console.log(res.rows);
    
    // We can just drop the employees table so it recreates safely
    await pool.query("DROP TABLE IF EXISTS employees CASCADE");
    console.log("Employees table dropped.");
    process.exit(0);
}
fix();
