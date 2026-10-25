import { randomUUID } from "node:crypto";
import { noCache } from "@/lib/subscriptionReminderServer";
import { queueWalletDraft, walletCapability, walletError, WalletError } from "@/lib/walletPushServer";

export const maxDuration = 30;

// This endpoint tests the exact Shortcuts authorization and notification route
// without relying on a Wallet transaction or accepting financial values.
export async function POST(request: Request) {
  try {
    const { admin, userId, pairing, device } = await walletCapability(request);
    if (Number(request.headers.get("content-length") || 0) > 5000) throw new WalletError(413, "Dati della prova troppo lunghi.");
    // Drain the small request body, but never use its payment fields for this test.
    if ((await request.text()).length > 5000) throw new WalletError(413, "Dati della prova troppo lunghi.");
    const result = await queueWalletDraft(admin, userId, {
      ref: randomUUID(), title: "Prova Comandi Rapidi", amount: 1,
      date: new Date().toISOString().slice(0, 10), cardId: pairing.cardId, preview: true,
    }, device);
    console.info("ZERO wallet shortcut check accepted");
    return Response.json({ ok: true, preview: true, ...result }, { headers: noCache });
  } catch (error) {
    console.warn("ZERO wallet shortcut check rejected", { status: error instanceof WalletError ? error.status : 503 });
    return walletError(error);
  }
}
