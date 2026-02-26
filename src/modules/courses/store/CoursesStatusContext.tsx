import { toErrorMessage } from "@/src/core/errors/toErrorMessage";
import React, { createContext, useMemo } from "react";

export interface CoursesStatusContextValue {
  isLoading: boolean;
  isLoadingHistory: boolean;
  isLoadingAvailable: boolean;
  error: string | null;
  isFetchingMoreAvailable: boolean;
  isFetchingMoreHistory: boolean;
}

export const CoursesStatusContext = createContext<
  CoursesStatusContextValue | undefined
>(undefined);

interface CoursesStatusProviderProps {
  children: React.ReactNode;
  availableCoursesIsPending: boolean;
  availableCoursesError: unknown;
  availableCoursesIsFetchingNextPage: boolean;
  historyIsPending: boolean;
  historyError: unknown;
  historyIsFetchingNextPage: boolean;
}

export const CoursesStatusProvider = ({
  children,
  availableCoursesIsPending,
  availableCoursesError,
  availableCoursesIsFetchingNextPage,
  historyIsPending,
  historyError,
  historyIsFetchingNextPage,
}: CoursesStatusProviderProps) => {
  const firstError = availableCoursesError ?? historyError;
  const error = useMemo(
    () => (firstError ? toErrorMessage(firstError) : null),
    [firstError],
  );

  const isLoading = useMemo(
    () =>
      (availableCoursesIsPending || historyIsPending) &&
      !availableCoursesIsFetchingNextPage &&
      !historyIsFetchingNextPage,
    [
      availableCoursesIsPending,
      historyIsPending,
      availableCoursesIsFetchingNextPage,
      historyIsFetchingNextPage,
    ],
  );

  const value = useMemo<CoursesStatusContextValue>(
    () => ({
      isLoading,
      isLoadingHistory: historyIsPending,
      isLoadingAvailable: availableCoursesIsPending,
      error,
      isFetchingMoreAvailable: availableCoursesIsFetchingNextPage,
      isFetchingMoreHistory: historyIsFetchingNextPage,
    }),
    [
      isLoading,
      historyIsPending,
      availableCoursesIsPending,
      error,
      availableCoursesIsFetchingNextPage,
      historyIsFetchingNextPage,
    ],
  );

  return (
    <CoursesStatusContext.Provider value={value}>
      {children}
    </CoursesStatusContext.Provider>
  );
};
