import AsyncStorage from "@react-native-async-storage/async-storage";

export const storageRepository = {
  async getItem<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as T;
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async removeItems(keys: readonly string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    await AsyncStorage.multiRemove([...keys]);
  },
};
