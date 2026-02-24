import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import React, { createContext, useCallback, useMemo, useState } from "react";
import { toErrorMessage } from "@/src/core/errors/toErrorMessage";
import { useAuth } from "@/src/modules/auth/hooks/useAuth";
import { coursesRepository } from "@/src/modules/courses/services/coursesService";
import { coursesQueryKeys } from "@/src/modules/courses/store/coursesQueryKeys";
import {
  Course,
  CoursesContextValue,
  Cursor,
  CursorPage,
} from "@/src/modules/courses/types/courseTypes";

const AVAILABLE_PAGE_SIZE = 3;
const HISTORY_PAGE_SIZE = 5;

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

export const CoursesContext = createContext<CoursesContextValue | undefined>(
  undefined,
);

export const CoursesProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  const availableCoursesQuery = useInfiniteQuery({
    queryKey: coursesQueryKeys.available(),
    initialPageParam: null as Cursor,
    queryFn: ({ pageParam }) =>
      coursesRepository.fetchAvailableCoursesPage({
        cursor: pageParam,
        limit: AVAILABLE_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const historyQuery = useInfiniteQuery({
    queryKey: coursesQueryKeys.history(),
    initialPageParam: null as Cursor,
    queryFn: ({ pageParam }) =>
      coursesRepository.fetchHistoryPage({
        cursor: pageParam,
        limit: HISTORY_PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const availableCourses = useMemo(
    () => availableCoursesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [availableCoursesQuery.data],
  );

  const history = useMemo(
    () => historyQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [historyQuery.data],
  );

  const refreshCourses = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: coursesQueryKeys.available() }),
      queryClient.invalidateQueries({ queryKey: coursesQueryKeys.history() }),
    ]);
  }, [queryClient]);

  const loadMoreAvailableCourses = useCallback(async () => {
    if (!availableCoursesQuery.hasNextPage || availableCoursesQuery.isFetchingNextPage) {
      return;
    }

    await availableCoursesQuery.fetchNextPage();
  }, [availableCoursesQuery]);

  const loadMoreHistory = useCallback(async () => {
    if (!historyQuery.hasNextPage || historyQuery.isFetchingNextPage) {
      return;
    }

    await historyQuery.fetchNextPage();
  }, [historyQuery]);

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
    [queryClient, user?.livreur.id],
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
    setActiveCourse((previous) => {
      if (!previous) {
        return previous;
      }

      return {
        ...previous,
        statut: "en_cours",
      };
    });
  }, []);

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
    queryClient.setQueryData<CourseInfiniteData>(coursesQueryKeys.history(), (previous) =>
      prependCourseToHistory(previous, completedCourse),
    );

    return completedCourse;
  }, [activeCourse, queryClient]);

  const firstError = availableCoursesQuery.error ?? historyQuery.error;
  const error = firstError ? toErrorMessage(firstError) : null;
  const isLoading =
    (availableCoursesQuery.isPending || historyQuery.isPending) &&
    !availableCoursesQuery.isFetchingNextPage &&
    !historyQuery.isFetchingNextPage;

  const value = useMemo<CoursesContextValue>(
    () => ({
      availableCourses,
      activeCourse,
      history,
      isLoading,
      error,
      refreshCourses,
      loadMoreAvailableCourses,
      hasNextAvailablePage: Boolean(availableCoursesQuery.hasNextPage),
      isFetchingMoreAvailableCourses: availableCoursesQuery.isFetchingNextPage,
      loadMoreHistory,
      hasNextHistoryPage: Boolean(historyQuery.hasNextPage),
      isFetchingMoreHistory: historyQuery.isFetchingNextPage,
      acceptCourse,
      rejectCourse,
      assignExternalCourse,
      startActiveCourse,
      completeActiveCourse,
    }),
    [
      acceptCourse,
      activeCourse,
      assignExternalCourse,
      availableCourses,
      availableCoursesQuery.hasNextPage,
      availableCoursesQuery.isFetchingNextPage,
      completeActiveCourse,
      error,
      history,
      historyQuery.hasNextPage,
      historyQuery.isFetchingNextPage,
      isLoading,
      loadMoreAvailableCourses,
      loadMoreHistory,
      refreshCourses,
      rejectCourse,
      startActiveCourse,
    ],
  );

  return <CoursesContext.Provider value={value}>{children}</CoursesContext.Provider>;
};
