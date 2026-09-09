 import React,{useEffect,useMemo,useState} from "react";
import {
 Home,CalendarDays,ListChecks,BookOpen,RotateCcw,BarChart3,Sparkles,Clock3,
 Target,Trophy,Settings,Menu,X,Bell,Check,Plus,Trash2,Pencil,Flame,Gauge,
 Brain,AlarmClock,ChevronRight,Play,Pause,RotateCw,Download,Upload,ShieldCheck
} from "lucide-react";

const SUBJECTS=[
 {id:"phy",name:"ฟิสิกส์",icon:"✿",color:"#7650df",progress:70,priority:"สูง",totalPages:120,readPages:84},
 {id:"chem",name:"เคมี",icon:"⚗",color:"#35a97c",progress:60,priority:"สูง",totalPages:100,readPages:60},
 {id:"bio",name:"ชีววิทยา",icon:"▤",color:"#e4a72c",progress:50,priority:"กลาง",totalPages:100,readPages:50},
 {id:"math",name:"คณิตศาสตร์",icon:"∑",color:"#8c63e8",progress:80,priority:"น้อย",totalPages:150,readPages:120}
];
const TASKS=[
 {id:1,subjectId:"phy",title:"การเคลื่อนที่แนวตรง",pages:"45–60",minutes:90,time:"09:00–10:30",done:false},
 {id:2,subjectId:"chem",title:"พันธะเคมี",pages:"20–35",minutes:60,time:"11:00–12:00",done:false},
 {id:3,subjectId:"bio",title:"การหายใจของพืช",pages:"10–20",minutes:90,time:"13:00–14:30",done:true},
 {id:4,subjectId:"math",title:"สมการกำลังสอง",pages:"25–40",minutes:90,time:"15:00–16:30",done:false}
];
const HISTORY=[
 {id:1,date:"5 ก.ย. 2569",subjectId:"phy",minutes:90,pages:16},
 {id:2,date:"4 ก.ย. 2569",subjectId:"chem",minutes:60,pages:14},
 {id:3,date:"3 ก.ย. 2569",subjectId:"bio",minutes:75,pages:12},
 {id:4,date:"2 ก.ย. 2569",subjectId:"math",minutes:90,pages:18}
];

function get(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function save(key,value){localStorage.setItem(key,JSON.stringify(value))}
function today(){
 return new Date().toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"numeric"});
}
function parseLocalDateTime(dateStr,timeStr="23:59:59"){
 const safeTime=(timeStr||"23:59:59").length===5?(timeStr+":00"):timeStr;
 return new Date(`${dateStr}T${safeTime}`);
}
function daysTo(dateStr,timeStr="23:59:59"){
 const d=parseLocalDateTime(dateStr,timeStr), n=new Date();
 return Math.max(0,Math.ceil((d-n)/86400000));
}
function formatThaiLong(dateStr){
 const d=new Date(`${dateStr}T12:00:00`);
 return d.toLocaleDateString("th-TH",{day:"numeric",month:"long",year:"numeric"});
}
function readiness(subjects,tasks,examDate){
 const base=subjects.reduce((a,s)=>a+s.progress,0)/subjects.length;
 const pending=tasks.filter(t=>!t.done).length;
 const penalty=Math.min(12,pending*2);
 const days=daysTo(examDate);
 const urgency=days<=3?4:days<=7?2:0;
 return Math.max(0,Math.min(100,Math.round(base-penalty+urgency)));
}

export default function App(){
 const [page,setPage]=useState("home");
 const [subjects,setSubjects]=useState(()=>get("passit_subjects",SUBJECTS));
 const [tasks,setTasks]=useState(()=>get("passit_tasks",TASKS));
 const [history,setHistory]=useState(()=>get("passit_history",HISTORY));
 const [examDate,setExamDate]=useState(()=>localStorage.getItem("passit_exam")||"2026-09-20");
 const [examTime,setExamTime]=useState(()=>localStorage.getItem("passit_exam_time")||"00:00");
 const [emergency,setEmergency]=useState(()=>get("passit_emergency",false));
 const [reminders,setReminders]=useState(()=>get("passit_reminders",[
   {id:1,time:"09:00",label:"เริ่มเรียนฟิสิกส์",enabled:true,lastFired:""},
   {id:2,time:"11:00",label:"พักและทบทวน 10 นาที",enabled:true,lastFired:""},
   {id:3,time:"15:00",label:"เริ่มเรียนคณิตศาสตร์",enabled:true,lastFired:""}
 ]));
 const [notifyReady,setNotifyReady]=useState(()=>typeof Notification!=="undefined"&&Notification.permission==="granted");
 const [ai,setAi]=useState(false);
 const [menu,setMenu]=useState(false);
 const [pomodoro,setPomodoro]=useState(false);

 useEffect(()=>save("passit_subjects",subjects),[subjects]);
 useEffect(()=>save("passit_tasks",tasks),[tasks]);
 useEffect(()=>save("passit_history",history),[history]);
 useEffect(()=>save("passit_emergency",emergency),[emergency]);
 useEffect(()=>localStorage.setItem("passit_exam",examDate),[examDate]);
 useEffect(()=>localStorage.setItem("passit_exam_time",examTime),[examTime]);
 useEffect(()=>save("passit_reminders",reminders),[reminders]);

 useEffect(()=>{
   if(!("serviceWorker" in navigator)) return;
   navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(()=>{});
 },[]);

 useEffect(() => {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        setNotifyReady(true);
      }
    });
  }
 }, []);

 const enableNotifications=async()=>{
   if(!("Notification" in window)){
     alert("เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน");
     return false;
   }
   const permission=await Notification.requestPermission();
   const ok=permission==="granted";
   setNotifyReady(ok);
   if(ok) new Notification("PassIt! 🔔",{body:"เปิดการแจ้งเตือนเรียบร้อยแล้ว"});
   return ok;
 };

 useEffect(()=>{
   const tick=async()=>{
     const now=new Date();
     const hm=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
     const dateKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
     for(const r of reminders){
       if(!r.enabled || r.time!==hm || r.lastFired===dateKey || !notifyReady) continue;
       try{
         if("serviceWorker" in navigator){
           const reg=await navigator.serviceWorker.ready;
           await reg.showNotification("PassIt! 📚",{body:`${r.label} (${r.time})`,tag:`passit-${r.id}-${dateKey}`,icon:`${import.meta.env.BASE_URL}icon-192.png`});
         }else{
           new Notification("PassIt! 📚",{body:`${r.label} (${r.time})`});
         }
       }catch(e){ console.warn("Notification failed",e); }
       setReminders(rs=>rs.map(x=>x.id===r.id?{...x,lastFired:dateKey}:x));
     }
   };
   const id=setInterval(tick,1000);
   tick();
   return()=>clearInterval(id);
 },[reminders,notifyReady]);

 const score=readiness(subjects,tasks,examDate);
 const completed=tasks.filter(t=>t.done).length;
 const totalMinutes=history.reduce((a,x)=>a+x.minutes,0);
 const totalPages=history.reduce((a,x)=>a+x.pages,0);

 const toggleTask=id=>setTasks(ts=>ts.map(t=>t.id===id?{...t,done:!t.done}:t));
 const addSession=(subjectId,minutes=25,pages=5)=>{
   setHistory(h=>[{id:Date.now(),date:today(),subjectId,minutes,pages},...h]);
   setSubjects(ss=>ss.map(s=>s.id===subjectId?{...s,readPages:Math.min(s.totalPages,s.readPages+pages),progress:Math.min(100,Math.round((s.readPages+pages)/s.totalPages*100))}:s));
 };
 const addSubject=(data)=>{
   const id="s"+Date.now();
   setSubjects(s=>[...s,{...data,id,progress:0,readPages:0}]);
 };
 const deleteSubject=id=>{
   setSubjects(s=>s.filter(x=>x.id!==id));
   setTasks(t=>t.filter(x=>x.subjectId!==id));
 };
 const exportData=()=>{
   const blob=new Blob([JSON.stringify({subjects,tasks,history,examDate,examTime,emergency,reminders},null,2)],{type:"application/json"});
   const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="passit-backup.json";a.click();URL.revokeObjectURL(a.href);
 };

 const nav=[
  ["home","หน้าหลัก",Home],["calendar","ตารางเรียนวันนี้",CalendarDays],["plan","แผนการเรียน",ListChecks],
  ["subjects","เนื้อหาทั้งหมด",BookOpen],["review","ทบทวน (Review)",RotateCw],["stats","สถิติ & ความคืบหน้า",BarChart3],
  ["ai","AI Study Assistant",Sparkles],["pomodoro","Pomodoro จับเวลา",Clock3],["goals","เป้าหมาย & รางวัล",Target],
  ["achievements","ความสำเร็จ",Trophy],["settings","ตั้งค่า",Settings]
 ];
 return <div className="app">
  <aside className={"sidebar "+(menu?"open":"")}>
   <div className="brand"><b>PassIt!</b><small>Plan smarter, pass easier</small></div>
   <button className="close" onClick={()=>setMenu(false)}><X/></button>
   <nav>{nav.map(([id,label,Icon])=><button className={page===id?"nav active":"nav"} key={id} onClick={()=>{setPage(id);setMenu(false)}}><Icon size={18}/>{label}{id==="ai"&&<em>NEW</em>}</button>)}</nav>
   <div className="tip"><b>ทุกความพยายามในวันนี้<br/>คือบันไดสู่ความสำเร็จ</b><span>♥</span></div>
   <div className="logout">↪ ออกจากระบบ</div>
  </aside>
  <main>
   <header><div className="hamb" onClick={()=>setMenu(true)}><Menu/></div><div><h1>สวัสดี, ธนัชพร! 👋</h1><p>ตั้งใจวันนี้ เพื่ออนาคตที่ดีที่สุดของคุณ</p></div><div className="profile"><Bell/><i>3</i><span>T</span></div></header>
   {page==="home"&&<Dashboard score={score} days={daysTo(examDate,examTime)} examDate={examDate} examTime={examTime} subjects={subjects} tasks={tasks} completed={completed} totalMinutes={totalMinutes} totalPages={totalPages} emergency={emergency} setEmergency={setEmergency} toggleTask={toggleTask} reminders={reminders} setReminders={setReminders} notifyReady={notifyReady} enableNotifications={enableNotifications} onAI={()=>setAi(true)} onPomodoro={()=>setPomodoro(true)}/>}
   {page==="calendar"&&<CalendarPage tasks={tasks} subjects={subjects} toggleTask={toggleTask}/>}
   {page==="plan"&&<PlanPage subjects={subjects} emergency={emergency} setEmergency={setEmergency}/>}
   {page==="subjects"&&<SubjectsPage subjects={subjects} addSubject={addSubject} deleteSubject={deleteSubject}/>}
   {page==="review"&&<ReviewPage subjects={subjects} addSession={addSession}/>}
   {page==="stats"&&<StatsPage subjects={subjects} history={history} score={score} totalMinutes={totalMinutes} totalPages={totalPages}/>}
   {page==="ai"&&<AIPage subjects={subjects} tasks={tasks}/>}
   {page==="pomodoro"&&<Pomodoro addSession={addSession} subjects={subjects}/>}
   {page==="goals"&&<GoalsPage subjects={subjects} score={score}/>}
   {page==="achievements"&&<Achievements subjects={subjects} history={history} tasks={tasks}/>}
   {page==="settings"&&<SettingsPage examDate={examDate} setExamDate={setExamDate} examTime={examTime} setExamTime={setExamTime} emergency={emergency} setEmergency={setEmergency} exportData={exportData} reminders={reminders} setReminders={setReminders} notifyReady={notifyReady} enableNotifications={enableNotifications}/>}
   <footer>© 2026 PassIt! — Smart Study Planner</footer>
  </main>
  {ai&&<AIModal subjects={subjects} tasks={tasks} close={()=>setAi(false)}/>}
  {pomodoro&&<div className="modal-bg"><div className="modal"><button className="x" onClick={()=>setPomodoro(false)}><X/></button><Pomodoro addSession={addSession} subjects={subjects}/></div></div>}
 </div>
}

function Countdown({examDate,examTime,score,emergency,setEmergency}){
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{const x=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(x)},[]);
 const target=parseLocalDateTime(examDate,examTime).getTime(),diff=Math.max(0,target-now);
 const d=Math.floor(diff/86400000),h=Math.floor(diff%86400000/3600000),m=Math.floor(diff%3600000/60000),s=Math.floor(diff%60000/1000);
 return <section className="card countdown"><div className="count-copy"><h2>Countdown to Exam</h2><b>สอบปลายภาค ภาคเรียนที่ 1/2569</b><p>{formatThaiLong(examDate)} · {examTime} น.</p><div className="timer">{[[d,"วัน"],[h,"ชั่วโมง"],[m,"นาที"],[s,"วินาที"]].map(([v,label])=><div key={label}><strong>{String(v).padStart(2,"0")}</strong><small>{label}</small></div>)}</div><div className="read-head"><span>ความพร้อมสอบ <b>{score}%</b></span><span>Exam Readiness Score</span></div><div className="track"><i style={{width:score+"%"}}/></div>{emergency&&<div className="warning">⚡ Emergency Mode เปิดอยู่ — เน้นวิชาสำคัญก่อน</div>}<button className="outline" onClick={()=>setEmergency(!emergency)}>{emergency?"ปิด Emergency Mode":"เปิด Emergency Mode"}</button></div><div className="alarm-big">⏰</div></section>
}

function Dashboard({score,days,examDate,examTime,subjects,tasks,completed,totalMinutes,totalPages,emergency,setEmergency,toggleTask,reminders,setReminders,notifyReady,enableNotifications,onAI,onPomodoro}){
 return <div className="content"><div className="grid"><div className="left">
  <Countdown examDate={examDate} examTime={examTime} score={score} emergency={emergency} setEmergency={setEmergency}/>
  <section className="card"><Title text="📅 แผนการเรียนวันนี้" right={today()}/><div className="table"><div className="row head"><span>วิชา</span><span>หัวข้อ</span><span>หน้า</span><span>เวลา</span><span></span></div>{tasks.map(t=><div className="row" key={t.id}><span><b className="dot">{subjects.find(s=>s.id===t.subjectId)?.icon}</b>{subjects.find(s=>s.id===t.subjectId)?.name}</span><span>{t.title}</span><span>{t.pages}</span><span>{t.time}</span><button className={"check "+(t.done?"on":"")} onClick={()=>toggleTask(t.id)}>{t.done&&<Check size={14}/>}</button></div>)}</div><button className="purple" onClick={onPomodoro}>เริ่มอ่าน 25 นาที <Play size={14}/></button></section>
  <div className="two"><ProgressCard subjects={subjects} score={score}/><Upcoming/></div>
 </div><div className="right">
  <Widget examDate={examDate} examTime={examTime} subjects={subjects}/><Reminders reminders={reminders} setReminders={setReminders} notifyReady={notifyReady} enableNotifications={enableNotifications}/><section className="card ai"><Sparkles/><div><b>AI Study Assistant</b><p>มีเวลาแค่ 1 ชั่วโมง? ให้ AI ช่วยจัดลำดับสิ่งที่ควรอ่าน</p><button onClick={onAI}>ถาม AI Assistant <ChevronRight size={14}/></button></div></section>
 </div></div>
 <section className="stats"><Metric icon={<Clock3/>} label="เวลาเรียนรวม" value={(totalMinutes/60).toFixed(1)+" ชม."}/><Metric icon={<BookOpen/>} label="อ่านไปแล้ว" value={totalPages+" หน้า"}/><Metric icon={<Target/>} label="งานวันนี้" value={`${completed}/${tasks.length}`}/><Metric icon={<Flame/>} label="Streak" value="7 วัน"/><Chart/><Tips/></section>
 </div>
}

function Title({text,right}){return <div className="title"><h2>{text}</h2>{right&&<span>{right}</span>}</div>}
function Metric({icon,label,value}){return <div className="metric">{icon}<small>{label}</small><b>{value}</b></div>}
function ProgressCard({subjects,score}){return <section className="card"><Title text="ความคืบหน้ารายวิชา" right="ดูรายละเอียด"/><div className="donut" style={{background:`conic-gradient(#7650df 0 ${score}%,#e9e4f6 ${score}% 100%)`}}><div><b>{score}%</b><small>โดยรวม</small></div></div><div className="legend">{subjects.map(s=><div key={s.id}><i style={{background:s.color}}/>{s.name}<b>{s.progress}%</b></div>)}</div></section>}
function Upcoming(){return <section className="card"><Title text="การสอบที่ใกล้ที่สุด"/>{["ฟิสิกส์","เคมี","ชีววิทยา"].map((x,i)=><div className="exam" key={x}><span>{["✿","⚗","▤"][i]}</span><div><b>{x}</b><small>{20+i} ก.ย. 2569</small></div><strong>{14+i}<small>วัน</small></strong></div>)}</section>}
function Widget({examDate,examTime,subjects}){
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id)},[]);
 const diff=Math.max(0,parseLocalDateTime(examDate,examTime).getTime()-now);
 const d=Math.floor(diff/86400000),h=Math.floor(diff%86400000/3600000),m=Math.floor(diff%3600000/60000);
 return <section className="card widget"><Title text="Countdown Widget" right="ใช้งานจริง"/><div className="phone"><div className="screen"><b>สอบปลายภาค</b><small>{formatThaiLong(examDate)}</small><strong>{d}</strong><span>วัน</span><p>{String(h).padStart(2,"0")} : {String(m).padStart(2,"0")}</p><div className="mini">{subjects.slice(0,3).map(s=><div key={s.id}><b>{s.icon} {s.name}</b><div><i style={{width:s.progress+"%"}}/></div><small>{s.progress}%</small></div>)}</div></div></div><small className="widget-note">อัปเดตตามเวลาจริงของเครื่อง</small></section>
}
function Reminders({reminders,setReminders,notifyReady,enableNotifications}){
 return <section className="card"><Title text="นาฬิกาปลุกเตือน" right="+ เพิ่ม"/>{reminders.map(r=><div className="rem" key={r.id}><AlarmClock/><div><b>{r.time}</b><small>{r.label}</small></div><input type="checkbox" checked={r.enabled} onChange={e=>setReminders(rs=>rs.map(x=>x.id===r.id?{...x,enabled:e.target.checked}:x))}/></div>)}<button className="outline full" onClick={enableNotifications}>{notifyReady?"🔔 การแจ้งเตือนเปิดอยู่":"🔔 เปิดการแจ้งเตือน"}</button></section>
}
function Chart(){return <div className="chart"><div>{[50,70,85,60,76,55,30].map((h,i)=><i style={{height:h+"%"}} key={i}/>)}</div><small>เป้าหมาย 3 ชม./วัน</small></div>}
function Tips(){return <div className="tips"><b>เคล็ดลับการเรียน</b><p>🍎 Pomodoro 25 นาทีเรียน 5 นาทีพัก</p><p>📝 สรุปด้วยภาษาของตัวเองหลังอ่านจบ</p><p>✎ ฝึกทำโจทย์เพื่อเตรียมพร้อมสอบ</p></div>}

function Page({title,sub,children}){return <div className="content"><div className="page-head"><h2>{title}</h2><p>{sub}</p></div>{children}</div>}
function CalendarPage({tasks,subjects,toggleTask}){return <Page title="ตารางเรียนวันนี้" sub="เช็กงานและติดตามสิ่งที่ต้องทำ"><div className="card list">{tasks.map(t=><div className="big-row"><strong>{t.time.split("–")[0]}</strong><div><b>{subjects.find(s=>s.id===t.subjectId)?.name} — {t.title}</b><small>หน้า {t.pages} · {t.minutes} นาที</small></div><button className={"check "+(t.done?"on":"")} onClick={()=>toggleTask(t.id)}>{t.done&&<Check size={14}/>}</button></div>)}</div></Page>}
function PlanPage({subjects,emergency,setEmergency}){return <Page title="แผนการเรียน" sub="จัดเวลาโดยดู Priority และ Energy"><div className="card"><div className="mode"><div><b>{emergency?"⚡ Emergency Mode":"🧠 Smart Schedule"}</b><small>{emergency?"เน้นบทสำคัญ ลดงานรอง และเพิ่มเวลาให้ Priority สูง":"ระบบกระจายเวลาให้เหมาะกับความสำคัญของแต่ละวิชา"}</small></div><button className="purple" onClick={()=>setEmergency(!emergency)}>{emergency?"ปิดโหมดเร่งด่วน":"เปิดโหมดเร่งด่วน"}</button></div>{subjects.map(s=><div className="plan"><span>{s.icon}</span><div><b>{s.name}</b><small>Priority: {s.priority}</small></div><div className="grow"><div className="track"><i style={{width:s.progress+"%"}}/></div></div><b>{emergency&&s.priority==="สูง"?"+30% เวลา":s.progress+"%"}</b></div>)}</div><div className="card energy"><h2>⚡ Energy-Based Scheduling</h2><p>วิชายากจะถูกวางไว้ในช่วงที่คุณมีสมาธิสูง</p><div className="energy-grid"><div>🌅 เช้า<b>สมาธิดี</b></div><div>☀️ บ่าย<b>ปานกลาง</b></div><div>🌙 กลางคืน<b>สมาธิดี</b></div></div></div></Page>}

function SubjectsPage({subjects,addSubject,deleteSubject}){
 const [form,setForm]=useState({name:"",priority:"กลาง",totalPages:100,icon:"📘",color:"#7650df"});
 return <Page title="เนื้อหาทั้งหมด" sub="เพิ่มวิชา กำหนด Priority และติดตามจำนวนหน้า"><div className="card add"><h3>+ เพิ่มวิชา</h3><div className="formgrid"><input placeholder="ชื่อวิชา" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>สูง</option><option>กลาง</option><option>น้อย</option></select><input type="number" min="1" value={form.totalPages} onChange={e=>setForm({...form,totalPages:+e.target.value})}/><button className="purple" disabled={!form.name.trim()} onClick={()=>{addSubject(form);setForm({...form,name:""})}}>เพิ่มวิชา</button></div></div><div className="cards">{subjects.map(s=><div className="card subject"><span className="subject-icon">{s.icon}</span><button className="trash" onClick={()=>deleteSubject(s.id)}><Trash2 size={15}/></button><h2>{s.name}</h2><em>Priority: {s.priority}</em><div className="track"><i style={{width:s.progress+"%"}}/></div><b>{s.progress}%</b><small>{s.readPages}/{s.totalPages} หน้า</small></div>)}</div></Page>
}

function ReviewPage({subjects,addSession}){return <Page title="ทบทวน (Review)" sub="ทบทวนหัวข้อที่อ่านแล้วด้วย Active Recall"><div className="card review"><Brain size={45}/><h2>รอบทบทวนวันนี้</h2><p>เลือกวิชาที่ต้องการทบทวน แล้วบันทึกเวลาได้ทันที</p>{subjects.map(s=><div className="review-row"><span>{s.icon}</span><div><b>{s.name}</b><small>ทบทวนบทล่าสุด · 10 นาที</small></div><button className="purple" onClick={()=>addSession(s.id,10,2)}>เริ่มทบทวน</button></div>)}</div></Page>}
function StatsPage({subjects,history,score,totalMinutes,totalPages}){return <Page title="สถิติ & ความคืบหน้า" sub="ข้อมูลจาก Study History ของคุณ"><div className="metrics"><Metric icon={<Gauge/>} label="Exam Readiness" value={score+"%"}/><Metric icon={<Clock3/>} label="เวลาอ่านสะสม" value={(totalMinutes/60).toFixed(1)+" ชม."}/><Metric icon={<BookOpen/>} label="จำนวนหน้า" value={totalPages+" หน้า"}/><Metric icon={<Flame/>} label="Streak" value="7 วัน"/></div><div className="card"><Title text="Study History"/>{history.map(h=><div className="history"><b>{h.date}</b><span>{subjects.find(s=>s.id===h.subjectId)?.name||"ลบวิชาแล้ว"}</span><span>{h.minutes} นาที</span><span>{h.pages} หน้า</span></div>)}</div></Page>}
function AIPage({subjects,tasks}){return <Page title="AI Study Assistant" sub="ผู้ช่วยจัดลำดับการอ่านจากเวลาที่คุณมี"><AIBox subjects={subjects} tasks={tasks}/></Page>}

function AIBox({subjects,tasks}){
 const [q,setQ]=useState("");
 const [ans,setAns]=useState("");
 const [loading,setLoading]=useState(false);

 const ask = async (text = q) => {
  const query = text.trim(); 
  if(!query) return;

  setLoading(true);
  setAns("กำลังคิดคำตอบ...");

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }]
      })
    });
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "ไม่สามารถดึงคำตอบได้";
    setAns(reply);
  } catch (error) {
    console.error("AI Error:", error);
    setAns("เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI");
  } finally {
    setLoading(false);
  }
 };

 return <div className="card ai-box"><Sparkles size={45}/><h2>ถาม PassIt! AI</h2><p>ผู้ช่วยวิเคราะห์จากวิชา Priority, งานค้าง และเวลาที่คุณมี</p><div className="quick"><button onClick={()=>ask("วันนี้มีเวลาอ่านแค่ 1 ชั่วโมง")}>มีเวลา 1 ชั่วโมง</button><button onClick={()=>ask("ช่วยจัดแผนเร่งด่วน")}>ใกล้สอบมาก</button><button onClick={()=>ask("ควรอ่านฟิสิกส์อะไร")}>ฟิสิกส์</button></div><div className="input"><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="พิมพ์คำถาม..."/><button onClick={()=>ask()} disabled={loading}>{loading ? "กำลังถาม..." : "ถาม"}</button></div>{ans&&<div className="answer"><b>✨ PassIt! AI</b><p>{ans}</p></div>}</div>
}

function Pomodoro({addSession,subjects}){
 const [sec,setSec]=useState(1500),[run,setRun]=useState(false),[subject,setSubject]=useState(subjects[0]?.id||"");
 useEffect(()=>{if(!run)return;const t=setInterval(()=>setSec(x=>{if(x<=1){setRun(false);return 1500}return x-1}),1000);return()=>clearInterval(t)},[run]);
 return <div className="card pomo"><Clock3 size={30}/><h2>Pomodoro Focus</h2><div className="circle">{String(Math.floor(sec/60)).padStart(2,"0")}:{String(sec%60).padStart(2,"0")}</div><select value={subject} onChange={e=>setSubject(e.target.value)}>{subjects.map(s=><option value={s.id}>{s.name}</option>)}</select><div className="actions"><button className="purple" onClick={()=>setRun(!run)}>{run?<Pause/>:<Play/>}{run?"หยุด":"เริ่มอ่าน"}</button><button className="outline" onClick={()=>{setRun(false);setSec(1500)}}>รีเซ็ต</button><button className="outline" onClick={()=>addSession(subject,25,5)}>บันทึก 25 นาที</button></div></div>
}
function GoalsPage({subjects,score}){return <Page title="เป้าหมาย & รางวัล" sub="เป้าหมายช่วยให้การอ่านมีทิศทาง"><div className="card goal"><Trophy size={45}/><h2>เป้าหมาย Exam Readiness 90%</h2><div className="track"><i style={{width:score+"%"}}/></div><b>{score}% / 90%</b><p>อีก {Math.max(0,90-score)}% เพื่อถึงเป้าหมาย</p></div></Page>}
function Achievements({subjects,history,tasks}){const pages=history.reduce((a,x)=>a+x.pages,0),done=tasks.filter(x=>x.done).length;const a=[["🌱","เริ่มต้นเส้นทาง","บันทึกการอ่านครั้งแรก",history.length>0],["🔥","อ่านต่อเนื่อง 7 วัน","รักษา Streak 7 วัน",true],["📚","100 หน้า","อ่านครบ 100 หน้า",pages>=100],["🎯","ครบ 1 วิชา","ทำเนื้อหาครบ 100%",subjects.some(s=>s.progress>=100)],["☑","ภารกิจสำเร็จ","ทำงานวันนี้ครบ",done===tasks.length]];return <Page title="ความสำเร็จ" sub="ปลดล็อก Achievement จากพฤติกรรมการเรียน"><div className="cards achievements">{a.map(x=>
<div key={x[1]} className={"card achievement "+(x[3]?"unlocked":"")}><div>{x[0]}</div><h3>{x[1]}</h3><p>{x[2]}</p><span>{x[3]?"✓ ปลดล็อกแล้ว":"🔒 ยังไม่ปลดล็อก"}</span></div>)}</div></Page>}
function SettingsPage({examDate,setExamDate,examTime,setExamTime,emergency,setEmergency,exportData,reminders,setReminders,notifyReady,enableNotifications}){
 const addReminder=()=>setReminders(rs=>[...rs,{id:Date.now(),time:"18:00",label:"เวลาอ่านหนังสือ",enabled:true,lastFired:""}]);
 return <Page title="ตั้งค่า" sub="ปรับระบบให้เหมาะกับการสอบของคุณ"><div className="card settings"><label>ชื่อผู้ใช้<input defaultValue="ธนัชพร"/></label><label>วันสอบ<input type="date" value={examDate} onChange={e=>setExamDate(e.target.value)}/></label><label>เวลาสอบ<input type="time" value={examTime} onChange={e=>setExamTime(e.target.value)}/></label><div className="notification-box"><div><b>🔔 การแจ้งเตือน</b><small>{notifyReady?"พร้อมแจ้งเตือนตามเวลาที่ตั้งไว้":"ต้องกดอนุญาตการแจ้งเตือนก่อน"}</small></div><button className="outline" onClick={enableNotifications}>{notifyReady?"ทดสอบแจ้งเตือน":"เปิดการแจ้งเตือน"}</button></div><div className="reminder-settings"><div className="title"><h2>เวลาที่เตือน</h2><button className="outline" onClick={addReminder}>+ เพิ่ม</button></div>{reminders.map(r=><div className="reminder-edit" key={r.id}><input type="time" value={r.time} onChange={e=>setReminders(rs=>rs.map(x=>x.id===r.id?{...x,time:e.target.value,lastFired:""}:x))}/><input value={r.label} onChange={e=>setReminders(rs=>rs.map(x=>x.id===r.id?{...x,label:e.target.value}:x))}/><input type="checkbox" checked={r.enabled} onChange={e=>setReminders(rs=>rs.map(x=>x.id===r.id?{...x,enabled:e.target.checked}:x))}/><button className="trash" onClick={()=>setReminders(rs=>rs.filter(x=>x.id!==r.id))}><Trash2 size={15}/></button></div>)}</div><label>Emergency Mode <input type="checkbox" checked={emergency} onChange={e=>setEmergency(e.target.checked)}/></label><div className="backup"><ShieldCheck/><div><b>ข้อมูลเก็บในเครื่องนี้</b><small>PassIt! ใช้ localStorage จึงใช้งานได้แม้ไม่ต่อฐานข้อมูล</small></div></div><button className="purple" onClick={exportData}><Download size={15}/>สำรองข้อมูล JSON</button></div></Page>
}
function AIModal({subjects,tasks,close}){return <div className="modal-bg"><div className="modal"><button className="x" onClick={close}><X/></button><AIBox subjects={subjects} tasks={tasks}/></div></div>}
