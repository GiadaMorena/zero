export const sameLoginAccount = (left?: string, right?: string) =>
  !!left && !!right && left.trim().toLowerCase() === right.trim().toLowerCase();

export function nextLoginStep(
  metadata: { zero_onboarding_completed?: unknown; zero_profile_completed?: unknown },
  pin: { hasPin: boolean; pinCode: string },
  resettingPin = false,
): "profile_setup" | "add_card" | "create_pin" | "lock" {
  const hasSavedPin = pin.hasPin && /^\d{6}$/.test(pin.pinCode);
  const completed = metadata.zero_onboarding_completed || hasSavedPin;
  if (!completed) return metadata.zero_profile_completed ? "add_card" : "profile_setup";
  return hasSavedPin && !resettingPin ? "lock" : "create_pin";
}
