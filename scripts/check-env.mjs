import fs from "node:fs";
const file = ".env.local";
if (!fs.existsSync(file)) {
  console.error("\n✗ ไม่พบไฟล์ .env.local — รัน setup.sh (Mac/Linux) หรือ setup.bat (Windows) ก่อน\n");
  process.exit(1);
}
const env = Object.fromEntries(
  fs.readFileSync(file, "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const need = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"];
const bad = need.filter((k) => !env[k] || env[k].startsWith("your-") || env[k].includes("your-project-ref"));
if (bad.length) {
  console.error("\n✗ ยังไม่ได้ใส่ค่าใน .env.local: " + bad.join(", ") + "\n  (หาได้ที่ Supabase → Settings → API)\n");
  process.exit(1);
}
console.log("✓ .env.local พร้อมใช้งาน");
