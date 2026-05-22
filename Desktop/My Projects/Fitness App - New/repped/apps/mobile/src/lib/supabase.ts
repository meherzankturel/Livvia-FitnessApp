import { createClient } from "@repped/supabase";
import { secureStorage } from "./secure-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Encrypted-at-rest session storage (Keychain/Keystore) instead of plaintext
    // AsyncStorage, so a stolen device/backup can't yield a replayable refresh token.
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
