import { AppError } from "@/src/core/errors/AppError";
import { QueryClient } from "@tanstack/react-query";

const MAX_QUERY_RETRIES = 2;
const MAX_MUTATION_RETRIES = 1;
const BASE_RETRY_DELAY_MS = 800;
const MAX_RETRY_DELAY_MS = 8000;

const shouldRetry = (failureCount: number, error: unknown, maxRetries: number): boolean => {
  if (failureCount >= maxRetries) {
    return false;
  }

  if (error instanceof AppError) {
    if (error.code === "unauthorized" || error.code === "validation_error") {
      return false;
    }
  }

  return true;
};

const retryDelay = (attemptIndex: number): number => {
  const delay = BASE_RETRY_DELAY_MS * 2 ** attemptIndex;
  return Math.min(delay, MAX_RETRY_DELAY_MS);
};

export const createAppQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 90_000,
        gcTime: 15 * 60_000,
        networkMode: "offlineFirst",
        retry: (failureCount, error) =>
          shouldRetry(failureCount, error, MAX_QUERY_RETRIES),
        retryDelay,
        refetchOnReconnect: true,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        networkMode: "offlineFirst",
        retry: (failureCount, error) =>
          shouldRetry(failureCount, error, MAX_MUTATION_RETRIES),
        retryDelay,
      },
    },
  });
};
