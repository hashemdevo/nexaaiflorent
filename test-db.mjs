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
            table: "employees"
        })
    });
    console.log(res.status, await res.text());
}
go();
