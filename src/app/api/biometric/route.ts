import { noCache } from "@/lib/subscriptionReminderServer";
import { biometricAction, biometricBody, biometricError, biometricStatus, biometricUser } from "@/lib/biometricServer";

export const maxDuration = 30;

export async function GET(request: Request) {
  try { return Response.json(await biometricStatus(await biometricUser(request)), { headers: noCache }); }
  catch (error) { return biometricError(error); }
}
export async function POST(request: Request) {
  try {
    const auth = await biometricUser(request);
    return Response.json(await biometricAction(request, auth, await biometricBody(request)), { headers: noCache });
  } catch (error) { return biometricError(error); }
}
