import { noCache } from "@/lib/subscriptionReminderServer";
import { queueWalletDraft, walletBody, walletCapability, walletDraft, walletError, WalletError } from "@/lib/walletPushServer";

export const maxDuration = 30;
export async function POST(request: Request) {
  try {
    const { admin, userId, pairing, device } = await walletCapability(request);
    const draft = walletDraft(await walletBody(request), pairing.cardId);
    const result = await queueWalletDraft(admin, userId, draft, device);
    if (!result.notificationAccepted) throw new WalletError(503, "Bozza già ricevuta; la notifica non è confermata. Apri ZERO dalla Home per recuperarla.");
    return Response.json({ ok: true, ...result }, { headers: noCache });
  } catch (error) { return walletError(error); }
}
