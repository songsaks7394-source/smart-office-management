#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
command -v node >/dev/null || { echo "ต้องติดตั้ง Node.js 18.18+ ก่อน: https://nodejs.org"; exit 1; }
echo "Node $(node -v)"
npm install
[ -f .env.local ] || { cp .env.example .env.local; echo "สร้าง .env.local แล้ว — เปิดไฟล์นี้แล้วใส่ค่า Supabase 3 ตัว จากนั้นรัน ./setup.sh อีกครั้ง"; exit 0; }
node scripts/check-env.mjs
read -r -p "สร้างข้อมูลตัวอย่าง (บัญชีทดลอง) เลยไหม? [y/N] " a
[[ "$a" =~ ^[Yy]$ ]] && npm run seed
echo "เริ่มรันที่ http://localhost:3000"
npm run dev
