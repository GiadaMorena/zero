import { after } from "next/server";
import webpush from "web-push";
import { authenticatedUser, noCache, readPushState, writePushState } from "@/lib/subscriptionReminderServer";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const auth = await authenticatedUser(request);
    if (!auth) return new Response(null, { status: 401, headers: noCache });
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY || !process.env.CRON_SECRET) {
      return Response.json({ error: "Notifiche non configurate." }, { status: 503, headers: noCache });
    }
    const text = await request.text();
    if (text.length > 4000) return new Response(null, { status: 413, headers: noCache });
    let endpoint: unknown;
    try { endpoint = JSON.parse(text).endpoint; } catch { return new Response(null, { status: 400, headers: noCache }); }
    const state = await readPushState(auth.admin, auth.user.id);
    const device = state.devices.find(item => item.endpoint === endpoint);
    if (!device) return Response.json({ error: "Attiva prima le notifiche su questo dispositivo." }, { status: 404, headers: noCache });
    const previousTest = state.sent.find(item => item.startsWith("test:"));
    if (previousTest && Date.now() - Number(previousTest.slice(5)) < 60000) {
      return Response.json({ error: "Attendi un minuto prima di ripetere la prova." }, { status: 429, headers: noCache });
    }
    webpush.setVapidDetails("https://zero-henna-one.vercel.app", process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
    await writePushState(auth.admin, auth.user.id, { ...state, sent: [...state.sent.filter(item => !item.startsWith("test:")), `test:${Date.now()}`] });
    after(async () => {
      await new Promise(resolve => setTimeout(resolve, 10000));
      try {
        const fresh = await readPushState(auth.admin, auth.user.id);
        if (!fresh.devices.some(item => item.endpoint === device.endpoint)) return;
        const { data: profile } = await auth.admin.from("profiles").select("notifications_enabled").eq("id", auth.user.id).single();
        if (profile?.notifications_enabled === false) return;
        await webpush.sendNotification(device, JSON.stringify({
          title: "Prova notifiche ZERO",
          body: "Se leggi questo avviso con ZERO chiusa, le notifiche funzionano su questo dispositivo.",
          tag: "zero-notification-test"
        }), { TTL: 300, timeout: 8000 });
      } catch { console.warn("ZERO notification test failed"); }
    });
    return Response.json({ queued: true }, { status: 202, headers: noCache });
  } catch {
    return Response.json({ error: "Non riesco a preparare la prova. Riprova." }, { status: 503, headers: noCache });
  }
}
