# PassIt! 2.0 — Smart Study Planner

เวอร์ชันนี้เป็นเว็บแอปที่ใช้งานได้จริงสำหรับ Demo/นำเสนอ โดยใช้ React + Vite และเก็บข้อมูลด้วย localStorage

## สิ่งที่ทำได้จริง
- เพิ่ม/ลบวิชา
- กำหนด Priority
- กำหนดจำนวนหน้า
- ติดตามความคืบหน้า
- เช็กงานในตารางวันนี้
- Countdown สอบแบบ realtime ตามวันและเวลาที่ตั้งในเครื่อง
- ตั้งเวลาอ่านหนังสือและเปิด Browser Notification
- ทดสอบ/เปิดสิทธิ์การแจ้งเตือนได้จากหน้า Dashboard และ Settings
- Exam Readiness Score คำนวณจากความคืบหน้า + งานค้าง + ความเร่งด่วน
- Emergency Mode
- Energy-Based Scheduling
- Study History
- Achievement
- Pomodoro Timer
- AI Study Assistant แบบ Smart Rule-based ที่ไม่ต้องใช้ API Key
- สำรองข้อมูลเป็น JSON
- Responsive สำหรับมือถือ

## วิธีรัน
```bash
npm install
npm run dev
```

## Build สำหรับ Deploy
```bash
npm run build
```
โฟลเดอร์ผลลัพธ์คือ `dist`

## GitHub
สร้าง repository เช่น `PassIt` แล้วอัปโหลดโปรเจกต์ทั้งหมด จากนั้นสามารถใช้ GitHub Pages/Vercel/Netlify ได้

## สำคัญสำหรับการนำเสนอ
AI ในเวอร์ชันนี้เป็น Rule-based Assistant เพื่อให้ Demo ทำงานทันทีโดยไม่ต้องฝัง API key ใน frontend
หากต้องการ AI LLM จริง ให้ต่อ backend/serverless function และเก็บ API key ใน Environment Variables

\n## หมายเหตุเรื่องการแจ้งเตือน\nระบบแจ้งเตือนใช้ Browser Notification และทำงานขณะหน้า PassIt! เปิดอยู่/เบื้องหลังในเบราว์เซอร์เดียวกัน หากต้องการแจ้งเตือนแม้ปิดเว็บหรือปิดเบราว์เซอร์ ต้องเพิ่ม Web Push backend (VAPID) ในอนาคต\n

## แจ้งเตือน
เว็บจะขอสิทธิ์ Notification และตรวจสอบเวลาที่ตั้งไว้ทุกวินาทีขณะที่หน้าเว็บยังทำงานอยู่หรืออยู่เบื้องหลังในแท็บเดียวกัน หากปิดเบราว์เซอร์ทั้งหมด GitHub Pages ไม่สามารถปลุก Service Worker ตามเวลาที่กำหนดได้เอง ต้องใช้ Web Push + backend สำหรับการแจ้งเตือนแบบแม้ปิดเว็บ

## AI
AI Study Assistant ในรุ่นนี้เป็น Smart Rule-based Assistant ไม่ใช่ LLM จริง หากต้องการ AI จริง ให้สร้าง backend/serverless endpoint แล้วเก็บ API key ไว้ใน Environment Variables ห้ามฝัง API key ใน React frontend
