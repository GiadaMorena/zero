import { noCache } from "@/lib/subscriptionReminderServer";
import { createWalletPairing, revokeWalletPairing, walletBody, walletConfigured, walletError, walletSetup, walletUser } from "@/lib/walletPushServer";

export async function GET(request: Request) {
  try {
    const { admin, user } = await walletUser(request);
    if (!walletConfigured()) return Response.json({ configured: false }, { headers: noCache });
    return Response.json({ configured: true, linked: await walletSetup(admin, user.id) }, { headers: noCache });
  } catch (error) { return walletError(error); }
}
export async function POST(request: Request) {
  try {
    const { admin, user } = await walletUser(request);
    return Response.json(await createWalletPairing(admin, user.id, await walletBody(request)), { headers: noCache });
  } catch (error) { return walletError(error); }
}
export async function DELETE(request: Request) {
  try {
    const { admin, user } = await walletUser(request);
    await revokeWalletPairing(admin, user.id);
    return Response.json({ ok: true }, { headers: noCache });
  } catch (error) { return walletError(error); }
}
