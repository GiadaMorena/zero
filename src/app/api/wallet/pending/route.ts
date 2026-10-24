import { noCache } from "@/lib/subscriptionReminderServer";
import { consumeWalletDraft, pendingWalletDrafts, walletBody, walletError, walletUser } from "@/lib/walletPushServer";

export async function GET(request: Request) {
  try {
    const { admin, user } = await walletUser(request);
    return Response.json({ drafts: await pendingWalletDrafts(admin, user.id) }, { headers: noCache });
  } catch (error) { return walletError(error); }
}
export async function DELETE(request: Request) {
  try {
    const { admin, user } = await walletUser(request), body = await walletBody(request);
    await consumeWalletDraft(admin, user.id, body.id);
    return Response.json({ ok: true }, { headers: noCache });
  } catch (error) { return walletError(error); }
}
