@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul || (echo ต้องติดตั้ง Node.js 18.18+ ก่อน: https://nodejs.org & pause & exit /b 1)
call npm install || (pause & exit /b 1)
if not exist .env.local (
  copy .env.example .env.local >nul
  echo สร้าง .env.local แล้ว - เปิดไฟล์นี้แล้วใส่ค่า Supabase 3 ตัว จากนั้นรัน setup.bat อีกครั้ง
  pause & exit /b 0
)
node scripts\check-env.mjs || (pause & exit /b 1)
set /p A=สร้างข้อมูลตัวอย่าง (บัญชีทดลอง) เลยไหม? [y/N] 
if /i "%A%"=="y" call npm run seed
echo เริ่มรันที่ http://localhost:3000
call npm run dev
