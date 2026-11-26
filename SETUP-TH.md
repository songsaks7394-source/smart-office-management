# คู่มือใช้งานด่วน (ภาษาไทย)

## สิ่งที่ต้องมี
- Node.js 18.18 ขึ้นไป (แนะนำ 20 LTS) — https://nodejs.org
- บัญชี Supabase ฟรี — https://supabase.com

## 5 ขั้นตอน
1. **สร้างโปรเจกต์ Supabase** (รอประมาณ 2 นาที)
2. **สร้างฐานข้อมูล**: Supabase → SQL Editor → New query → วางเนื้อหาไฟล์ `supabase/all-in-one.sql` ทั้งไฟล์ → Run
3. **ตั้งค่า Auth**: Authentication → URL Configuration
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback` และ `http://localhost:3000/reset-password`
   - (ถ้าไม่อยากต้องกดยืนยันอีเมลตอนทดลอง: Authentication → Providers → Email → ปิด Confirm email)
4. **รันสคริปต์ติดตั้ง**
   - Mac/Linux: `./setup.sh`   |   Windows: ดับเบิลคลิก `setup.bat`
   - ครั้งแรกจะสร้าง `.env.local` ให้ → ใส่ค่า 3 ตัวจาก Settings → API (URL, anon key, service_role key) แล้วรันสคริปต์อีกครั้ง
5. เปิด http://localhost:3000

## บัญชีทดลอง (หลังเลือกสร้างข้อมูลตัวอย่าง)
| บทบาท | อีเมล | รหัสผ่าน |
|---|---|---|
| Admin | admin@smartoffice.com | Admin123! |
| Employee | employee1@smartoffice.com | Employee123! |

## ทำให้ตัวเองเป็น Admin (บัญชีที่สมัครเอง)
SQL Editor: `update public.users set role = 'admin' where email = 'you@example.com';`

## ใช้งานจริงบนอินเทอร์เน็ต
ดู `DEPLOYMENT.md` (Vercel) — ใส่ตัวแปร env 4 ตัวเหมือน `.env.local` แล้วเพิ่ม URL จริงใน Supabase Auth

## ข้อควรระวัง
- `SUPABASE_SERVICE_ROLE_KEY` เป็นความลับ ห้ามอัปโหลดขึ้น GitHub หรือส่งให้ใคร
- ก่อนใช้งานจริง ให้เปลี่ยน/ลบบัญชีทดลองทั้งหมด
