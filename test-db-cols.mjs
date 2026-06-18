async function go() {
    const res = await fetch("http://localhost:3000/api/db/crud", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-user-role": "ACCOUNTANT",
            "x-employee-id": "emp-sc-001",
            "x-tenant-id": "tenant-nexa-001"
        },
        body: JSON.stringify({
            operation: "SELECT",
            table: "information_schema.columns",
            options: {
                where: { table_name: "employees" }
            }
        })
    });
    const d = await res.json();
    console.log(d.rows?.map(r => r.column_name + ": " + r.data_type));
}
go();
