import fetch from "node-fetch";

async function test() {
  const p = [];
  for(let i = 0; i < 20; i++) {
    p.push(fetch("http://localhost:3000/api/db/crud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation: "SELECT", table: "users" })
    }).then(async r => `${r.status} ${await r.text()}`));
  }
  const results = await Promise.all(p);
  console.log(results);
}
test();
