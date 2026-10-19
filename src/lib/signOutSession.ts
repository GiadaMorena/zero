interface SessionAuth {
  signOut: (options: { scope: "local" }) => Promise<{ error: unknown }>;
  getSession: () => Promise<{ data: { session: unknown }; error?: unknown }>;
}

// Keep the device PIN for its owner, but require authentication before it can be used.
export async function signOutSession(
  auth: SessionAuth,
  local: Pick<Storage, "removeItem">,
  session: Pick<Storage, "removeItem">,
): Promise<{ error?: string }> {
  try {
    const result = await auth.signOut({ scope: "local" });
    if (result.error) return { error: "Disconnessione non riuscita. Controlla la connessione e riprova." };
    const check = await auth.getSession();
    if (check.error || check.data.session) return { error: "La sessione risulta ancora attiva. Riprova a disconnetterti." };
    for (const key of ["zero_app_state_v6", "zero_auth_state_v5"]) {
      try { local.removeItem(key); } catch { /* Session revocation has already succeeded. */ }
    }
    for (const key of ["zero_pending_wallet_v1", "zero_update_resume_v1"]) {
      try { session.removeItem(key); } catch { /* Optional session cache. */ }
    }
    return {};
  } catch {
    return { error: "Disconnessione non riuscita. Controlla la connessione e riprova." };
  }
}
