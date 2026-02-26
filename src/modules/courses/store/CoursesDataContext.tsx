import { Course } from "@/src/modules/courses/types/courseTypes";
import React, { createContext, useMemo } from "react";

export interface CoursesDataContextValue {
  availableCourses: Course[];
  history: Course[];
  activeCourse: Course | null;
  hasNextAvailablePage: boolean;
  hasNextHistoryPage: boolean;
}

export const CoursesDataContext = createContext<
  CoursesDataContextValue | undefined
>(undefined);

interface CoursesDataProviderProps {
  children: React.ReactNode;
  availableCourses: Course[];
  history: Course[];
  activeCourse: Course | null;
  hasNextAvailablePage: boolean;
  hasNextHistoryPage: boolean;
}

export const CoursesDataProvider = ({
  children,
  availableCourses,
  history,
  activeCourse,
  hasNextAvailablePage,
  hasNextHistoryPage,
}: CoursesDataProviderProps) => {
  const value = useMemo<CoursesDataContextValue>(
    () => ({
      availableCourses,
      history,
      activeCourse,
      hasNextAvailablePage,
      hasNextHistoryPage,
    }),
    [
      availableCourses,
      history,
      activeCourse,
      hasNextAvailablePage,
      hasNextHistoryPage,
    ],
  );

  return (
    <CoursesDataContext.Provider value={value}>
      {children}
    </CoursesDataContext.Provider>
  );
};
