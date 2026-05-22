/**
 * Encrypted-at-rest storage adapter for the Supabase auth session.
 *
 * Why this exists: by default supabase-js persists the session (access token +
 * long-lived refresh token) in AsyncStorage, which is plaintext on disk. On a
 * rooted/jailbroken device, in an unencrypted backup, or via malware with app-data
 * access, that refresh token can be lifted and replayed → account takeover.
 *
 * This adapter stores the session in expo-secure-store instead — iOS Keychain /
 * Android Keystore-backed EncryptedSharedPreferences. SecureStore has a ~2KB value
 * limit and Supabase sessions can exceed it, so we transparently chunk large values
 * across multiple SecureStore entries.
 *
 * On web (Expo web has no SecureStore) we fall back to AsyncStorage.
 */
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// Stay comfortably under SecureStore's per-value limit. ASCII/base64 session blobs
// mean 1 char ≈ 1 byte, so 1800 chars keeps each chunk well below ~2KB.
const CHUNK_SIZE = 1800;

const opts: SecureStore.SecureStoreOptions = {
  // Allow the background token refresh to read the session while the device is
  // locked-after-first-unlock. Do NOT require biometrics here.
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

const isWeb = Platform.OS === "web";

// SecureStore keys must match [A-Za-z0-9._-]. Supabase keys already comply, but
// sanitize defensively so we never throw on an unexpected key.
function safeKey(key: string): string {
  return key.replace(/[^A-Za-z0-9._-]/g, "_");
}

const metaKey = (key: string) => `${safeKey(key)}__n`;
const chunkKey = (key: string, i: number) => `${safeKey(key)}__c${i}`;

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return AsyncStorage.getItem(key);

  const countStr = await SecureStore.getItemAsync(metaKey(key), opts);
  if (countStr == null) return null;

  const count = parseInt(countStr, 10);
  if (!Number.isFinite(count) || count <= 0) return null;

  let value = "";
  for (let i = 0; i < count; i++) {
    const chunk = await SecureStore.getItemAsync(chunkKey(key, i), opts);
    if (chunk == null) return null; // corrupt / partially written → treat as absent
    value += chunk;
  }
  return value;
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) return AsyncStorage.setItem(key, value);

  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) {
    chunks.push(value.slice(i, i + CHUNK_SIZE));
  }

  // Remove any leftover chunks from a previous, larger value before writing.
  await removeItem(key);

  for (let i = 0; i < chunks.length; i++) {
    await SecureStore.setItemAsync(chunkKey(key, i), chunks[i], opts);
  }
  await SecureStore.setItemAsync(metaKey(key), String(chunks.length), opts);
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) return AsyncStorage.removeItem(key);

  const countStr = await SecureStore.getItemAsync(metaKey(key), opts);
  if (countStr != null) {
    const count = parseInt(countStr, 10);
    if (Number.isFinite(count)) {
      for (let i = 0; i < count; i++) {
        await SecureStore.deleteItemAsync(chunkKey(key, i), opts);
      }
    }
    await SecureStore.deleteItemAsync(metaKey(key), opts);
  }
}

/** Storage adapter shaped for supabase-js `auth.storage`. */
export const secureStorage = { getItem, setItem, removeItem };
