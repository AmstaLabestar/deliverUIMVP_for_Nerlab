import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { AppError } from "@/src/core/errors/AppError";

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

let secureStoreAvailabilityPromise: Promise<boolean> | null = null;

const isSecureStoreAvailable = async (): Promise<boolean> => {
  if (!secureStoreAvailabilityPromise) {
    secureStoreAvailabilityPromise = SecureStore.isAvailableAsync();
  }

  return secureStoreAvailabilityPromise;
};

const parseStoredValue = <T>(key: string, raw: string | null): T | null => {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new AppError("validation_error", `Invalid secure value for key "${key}".`, error);
  }
};

const getWebFallbackItem = async <T>(key: string): Promise<T | null> => {
  const raw = await AsyncStorage.getItem(key);
  return parseStoredValue<T>(key, raw);
};

const setWebFallbackItem = async <T>(key: string, value: T): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

const assertSecureStoreAvailable = async (): Promise<void> => {
  const available = await isSecureStoreAvailable();
  if (!available) {
    throw new AppError("unknown_error", "Secure storage is unavailable on this device.");
  }
};

export const secureStorageRepository = {
  async getItem<T>(key: string): Promise<T | null> {
    if (Platform.OS === "web") {
      return getWebFallbackItem<T>(key);
    }

    await assertSecureStoreAvailable();
    const raw = await SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
    return parseStoredValue<T>(key, raw);
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    if (Platform.OS === "web") {
      await setWebFallbackItem(key, value);
      return;
    }

    await assertSecureStoreAvailable();
    await SecureStore.setItemAsync(key, JSON.stringify(value), SECURE_STORE_OPTIONS);
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      await AsyncStorage.removeItem(key);
      return;
    }

    await assertSecureStoreAvailable();
    await SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS);
  },

  async removeItems(keys: readonly string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.removeItem(key)));
  },
};
