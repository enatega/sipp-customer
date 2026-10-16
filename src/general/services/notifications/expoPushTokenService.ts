import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const PUSH_TOKEN_KEY = "sipp_customer_device_push_token";
const registrations = new Set<Promise<void>>();
let signingOut = false;

export const pushTokenStorage = {
  get: () => Platform.OS === "web" ? Promise.resolve(null) : SecureStore.getItemAsync(PUSH_TOKEN_KEY),
  save: (token: string) => Platform.OS === "web" ? Promise.resolve() : SecureStore.setItemAsync(PUSH_TOKEN_KEY, token),
  clear: () => {
    cachedToken = null;
    return Platform.OS === "web" ? Promise.resolve() : SecureStore.deleteItemAsync(PUSH_TOKEN_KEY);
  },
  register: async (token: string, send: () => Promise<unknown>) => {
    if (signingOut) return false;
    const pending = (async () => {
      await send();
      await pushTokenStorage.save(token);
    })();
    registrations.add(pending);
    try {
      await pending;
      return true;
    } finally {
      registrations.delete(pending);
    }
  },
  beginLogout: async () => {
    signingOut = true;
    await Promise.allSettled([...registrations]);
  },
  cancelLogout: () => { signingOut = false; },
};

let cachedToken: string | null = null;
let inFlightTokenPromise: Promise<string | null> | null = null;

function normalizePushToken(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue.length > 0 ? trimmedValue : null;
  }

  if (
    value &&
    typeof value === "object" &&
    "data" in value &&
    typeof (value as { data?: unknown }).data === "string"
  ) {
    const nestedValue = (value as { data: string }).data.trim();
    return nestedValue.length > 0 ? nestedValue : null;
  }

  return null;
}

function getEasProjectId(): string | undefined {
  const expoConfigProjectId = Constants.expoConfig?.extra?.eas?.projectId;
  const easConfigProjectId = Constants.easConfig?.projectId;
  const envProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

  return easConfigProjectId ?? expoConfigProjectId ?? envProjectId;
}

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "default",
    importance: Notifications.AndroidImportance.MAX,
  });
}

async function getPushTokenInternal(): Promise<string | null> {
  try {
    await ensureAndroidNotificationChannel();

    const permissions = await Notifications.getPermissionsAsync();
    let status = permissions.status;

    if (status !== "granted" && permissions.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }

    if (status !== "granted" && (await Notifications.getPermissionsAsync()).ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) {
      return null;
    }

    const projectId = getEasProjectId();
    console.log('[ExpoPushToken][auth] project IDs', {
      selected: projectId ?? null,
      easConfig: Constants.easConfig?.projectId ?? null,
      expoConfig: Constants.expoConfig?.extra?.eas?.projectId ?? null,
      environment: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? null,
    });
    const response = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    const token = normalizePushToken(response.data);
    console.log('[ExpoPushToken][auth] generated token', token);
    return token;
  } catch (error) {
    console.error('[ExpoPushToken][auth] token generation failed', error);
    return null;
  }
}

export async function getExpoPushTokenForAuth(): Promise<string | null> {
  if (cachedToken) {
    console.log('[ExpoPushToken][auth] cached token', cachedToken);
    return cachedToken;
  }

  if (inFlightTokenPromise) {
    return inFlightTokenPromise;
  }

  inFlightTokenPromise = getPushTokenInternal();

  try {
    const token = normalizePushToken(await inFlightTokenPromise);
    if (token) {
      cachedToken = token;
      await pushTokenStorage.save(token);
    }
    return token;
  } finally {
    inFlightTokenPromise = null;
  }
}
