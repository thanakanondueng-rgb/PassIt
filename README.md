# PassIt! 2.0 — Smart Study Planner

เวอร์ชันนี้เป็นเว็บแอปที่ใช้งานได้จริงสำหรับ Demo/นำเสนอ โดยใช้ React + Vite และเก็บข้อมูลด้วย localStorage

## สิ่งที่ทำได้จริง
- เพิ่ม/ลบวิชา
- กำหนด Priority
- กำหนดจำนวนหน้า
- ติดตามความคืบหน้า
- เช็กงานในตารางวันนี้
- Countdown สอบ
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
