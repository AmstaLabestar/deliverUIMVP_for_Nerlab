import { useAuth } from "@/src/modules/auth/hooks/useAuth";
import { coursesQueryKeys } from "@/src/modules/courses/store/coursesQueryKeys";
import {
  Course,
  Cursor,
  CursorPage,
} from "@/src/modules/courses/types/courseTypes";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useCallback, useMemo } from "react";

type CoursePage = CursorPage<Course>;
type CourseInfiniteData = InfiniteData<CoursePage, Cursor>;

const removeCourseFromInfiniteData = (
  previous: CourseInfiniteData | undefined,
  courseId: string,
): CourseInfiniteData | undefined => {
  if (!previous) {
    return previous;
  }

  return {
    ...previous,
    pages: previous.pages.map((page) => ({
      ...page,
      items: page.items.filter((item) => item.id !== courseId),
    })),
  };
};

const prependCourseToHistory = (
  previous: CourseInfiniteData | undefined,
  course: Course,
): CourseInfiniteData => {
  if (!previous || previous.pages.length === 0) {
    return {
      pageParams: [null],
      pages: [
        {
          items: [course],
          nextCursor: null,
        },
      ],
    };
  }

  const firstPage = previous.pages[0];
  const nextFirstPage: CoursePage = {
    ...firstPage,
    items: [course, ...firstPage.items.filter((item) => item.id !== course.id)],
  };

  return {
    ...previous,
    pages: [nextFirstPage, ...previous.pages.slice(1)],
  };
};

export interface CoursesActionsContextValue {
  refreshCourses: () => Promise<void>;
  loadMoreAvailableCourses: () => Promise<void>;
  loadMoreHistory: () => Promise<void>;
  acceptCourse: (courseId: string) => Promise<Course>;
  rejectCourse: (courseId: string) => Promise<void>;
  assignExternalCourse: (course: Course) => Promise<Course>;
  startActiveCourse: () => Promise<void>;
  completeActiveCourse: () => Promise<Course | null>;
  setActiveCourse: React.Dispatch<React.SetStateAction<Course | null>>;
}

export const CoursesActionsContext = createContext<
  CoursesActionsContextValue | undefined
>(undefined);

interface CoursesActionsProviderProps {
  children: React.ReactNode;
  availableCourses: Course[];
  activeCourse: Course | null;
  setActiveCourse: React.Dispatch<React.SetStateAction<Course | null>>;
  hasNextAvailablePage: boolean;
  isFetchingMoreAvailableCourses: boolean;
  fetchNextAvailablePage: () => Promise<unknown>;
  hasNextHistoryPage: boolean;
  isFetchingMoreHistory: boolean;
  fetchNextHistoryPage: () => Promise<unknown>;
}

export const CoursesActionsProvider = ({
  children,
  availableCourses,
  activeCourse,
  setActiveCourse,
  hasNextAvailablePage,
  isFetchingMoreAvailableCourses,
  fetchNextAvailablePage,
  hasNextHistoryPage,
  isFetchingMoreHistory,
  fetchNextHistoryPage,
}: CoursesActionsProviderProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const refreshCourses = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: coursesQueryKeys.available() }),
      queryClient.invalidateQueries({ queryKey: coursesQueryKeys.history() }),
    ]);
  }, [queryClient]);

  const loadMoreAvailableCourses = useCallback(async () => {
    if (!hasNextAvailablePage || isFetchingMoreAvailableCourses) {
      return;
    }

    await fetchNextAvailablePage();
  }, [
    hasNextAvailablePage,
    isFetchingMoreAvailableCourses,
    fetchNextAvailablePage,
  ]);

  const loadMoreHistory = useCallback(async () => {
    if (!hasNextHistoryPage || isFetchingMoreHistory) {
      return;
    }

    await fetchNextHistoryPage();
  }, [hasNextHistoryPage, isFetchingMoreHistory, fetchNextHistoryPage]);

  const assignCourse = useCallback(
    async (course: Course): Promise<Course> => {
      const acceptedCourse: Course = {
        ...course,
        statut: "en_attente",
        livreurId: user?.livreur.id,
        dateAcceptation: new Date().toISOString(),
      };

      setActiveCourse(acceptedCourse);
      queryClient.setQueryData<CourseInfiniteData>(
        coursesQueryKeys.available(),
        (previous) => removeCourseFromInfiniteData(previous, course.id),
      );

      return acceptedCourse;
    },
    [queryClient, user?.livreur.id, setActiveCourse],
  );

  const acceptCourse = useCallback(
    async (courseId: string): Promise<Course> => {
      const foundCourse = availableCourses.find((course) => course.id === courseId);
      if (!foundCourse) {
        throw new Error("Course introuvable.");
      }

      return assignCourse(foundCourse);
    },
    [assignCourse, availableCourses],
  );

  const assignExternalCourse = useCallback(
    async (course: Course): Promise<Course> => {
      return assignCourse(course);
    },
    [assignCourse],
  );

  const rejectCourse = useCallback(
    async (courseId: string): Promise<void> => {
      queryClient.setQueryData<CourseInfiniteData>(
        coursesQueryKeys.available(),
        (previous) => removeCourseFromInfiniteData(previous, courseId),
      );
    },
    [queryClient],
  );

  const startActiveCourse = useCallback(async (): Promise<void> => {
    setActiveCourse((previous) =>
      previous
        ? {
            ...previous,
            statut: "en_cours",
          }
        : previous,
    );
  }, [setActiveCourse]);

  const completeActiveCourse = useCallback(async (): Promise<Course | null> => {
    if (!activeCourse) {
      return null;
    }

    const completedCourse: Course = {
      ...activeCourse,
      statut: "terminee",
      dateTerminaison: new Date().toISOString(),
    };

    setActiveCourse(null);
    queryClient.setQueryData<CourseInfiniteData>(
      coursesQueryKeys.history(),
      (previous) => prependCourseToHistory(previous, completedCourse),
    );

    return completedCourse;
  }, [activeCourse, queryClient, setActiveCourse]);

  const value = useMemo<CoursesActionsContextValue>(
    () => ({
      refreshCourses,
      loadMoreAvailableCourses,
      loadMoreHistory,
      acceptCourse,
      rejectCourse,
      assignExternalCourse,
      startActiveCourse,
      completeActiveCourse,
      setActiveCourse,
    }),
    [
      refreshCourses,
      loadMoreAvailableCourses,
      loadMoreHistory,
      acceptCourse,
      rejectCourse,
      assignExternalCourse,
      startActiveCourse,
      completeActiveCourse,
      setActiveCourse,
    ],
  );

  return (
    <CoursesActionsContext.Provider value={value}>
      {children}
    </CoursesActionsContext.Provider>
  );
};
