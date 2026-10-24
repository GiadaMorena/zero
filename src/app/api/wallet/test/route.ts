import { noCache } from "@/lib/subscriptionReminderServer";
import { testWalletPush, walletBody, walletError, walletUser } from "@/lib/walletPushServer";

export const maxDuration = 30;
export async function POST(request: Request) {
  try {
    const { admin, user } = await walletUser(request);
    return Response.json(await testWalletPush(admin, user.id, await walletBody(request)), { headers: noCache });
  } catch (error) { return walletError(error); }
}
