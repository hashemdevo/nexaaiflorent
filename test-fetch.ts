async function run() {
  const res = await fetch("http://localhost:3000/api/db/crud", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ operation: "SELECT", table: "partner_ledger" })
  });
  console.log("Status:", res.status, res.headers.get("content-type"));
  const text = await res.text();
  console.log("Body:", text.substring(0, 150));
}
run();
