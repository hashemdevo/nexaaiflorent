const { Pool } = require('pg');
const pool = new Pool();
async function go() {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employees'");
    console.log(res.rows);
    pool.end();
}
go();
