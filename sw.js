const CACHE="passit-v3";
self.addEventListener("install",e=>{self.skipWaiting()});
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  self.registration.showNotification(data.title || "แจ้งเตือน", {
    body: data.body || "ได้เวลาอ่านหนังสือแล้ว!",
    icon: "/favicon.ico"
  });
});
