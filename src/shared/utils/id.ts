import { randomUUID } from "expo-crypto";

export const buildId = (prefix: string): string => {
  return `${prefix}_${randomUUID()}`;
};
