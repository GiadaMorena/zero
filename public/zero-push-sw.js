const walletId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
self.addEventListener("install", event => { event.waitUntil(self.skipWaiting()); });
self.addEventListener("activate", event => { event.waitUntil(self.clients.claim()); });
self.addEventListener("push", event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch {}
  if (!payload || typeof payload !== "object") payload = {};
  const wallet = payload?.type === "zero-wallet-payment" && typeof payload.id === "string" && walletId.test(payload.id);
  event.waitUntil(self.registration.showNotification(typeof payload.title === "string" ? payload.title : "Promemoria ZERO", {
    body: typeof payload.body === "string" ? payload.body : "Apri ZERO per controllare le scadenze.",
    icon: "/icon.png", badge: "/icon.png", tag: typeof payload.tag === "string" ? payload.tag : "zero-reminder",
    // Never put payment details, secrets or an arbitrary URL on the lock screen.
    data: wallet ? { type: "zero-wallet-payment", id: payload.id } : { type: "zero-subscription-reminders" },
  }));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil((async () => {
    const data = event.notification.data;
    const wallet = data?.type === "zero-wallet-payment" && typeof data.id === "string" && walletId.test(data.id);
    const url = new URL(wallet ? "/#zero-wallet-inbox" : "/#subscription-reminders", self.location.origin).href;
    const message = wallet ? { type: "zero-wallet-payment", id: data.id } : { type: "zero-subscription-reminders" };
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      try { if (new URL(client.url).origin !== self.location.origin) continue; } catch { continue; }
      client.postMessage(message);
      await client.focus();
      return;
    }
    const client = await self.clients.openWindow(url);
    client?.postMessage(message);
  })());
});
