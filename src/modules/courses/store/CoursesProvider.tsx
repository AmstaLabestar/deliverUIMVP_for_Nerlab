import { coursesRepository } from "@/src/modules/courses/services/coursesService";
import { CoursesActionsProvider } from "@/src/modules/courses/store/CoursesActionsContext";
import { CoursesDataProvider } from "@/src/modules/courses/store/CoursesDataContext";
import { coursesQueryKeys } from "@/src/modules/courses/store/coursesQueryKeys";
import { CoursesStatusProvider } from "@/src/modules/courses/store/CoursesStatusContext";
import { Course, Cursor } from "@/src/modules/courses/types/courseTypes";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from "react";

const AVAILABLE_PAGE_SIZE = 4;
const HISTORY_PAGE_SIZE = 8;

interface CoursesProviderProps {
  children: React.ReactNode;
}

export const CoursesProvider = ({ children }: CoursesProviderProps) => {
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

  const fetchNextAvailablePage = useCallback(async () => {
    await availableCoursesQuery.fetchNextPage();
  }, [availableCoursesQuery.fetchNextPage]);

  const fetchNextHistoryPage = useCallback(async () => {
    await historyQuery.fetchNextPage();
  }, [historyQuery.fetchNextPage]);

  return (
    <CoursesDataProvider
      availableCourses={availableCourses}
      history={history}
      activeCourse={activeCourse}
      hasNextAvailablePage={Boolean(availableCoursesQuery.hasNextPage)}
      hasNextHistoryPage={Boolean(historyQuery.hasNextPage)}
    >
      <CoursesStatusProvider
        availableCoursesIsPending={availableCoursesQuery.isPending}
        availableCoursesError={availableCoursesQuery.error}
        availableCoursesIsFetchingNextPage={
          availableCoursesQuery.isFetchingNextPage
        }
        historyIsPending={historyQuery.isPending}
        historyError={historyQuery.error}
        historyIsFetchingNextPage={historyQuery.isFetchingNextPage}
      >
        <CoursesActionsProvider
          availableCourses={availableCourses}
          activeCourse={activeCourse}
          setActiveCourse={setActiveCourse}
          hasNextAvailablePage={Boolean(availableCoursesQuery.hasNextPage)}
          isFetchingMoreAvailableCourses={
            availableCoursesQuery.isFetchingNextPage
          }
          fetchNextAvailablePage={fetchNextAvailablePage}
          hasNextHistoryPage={Boolean(historyQuery.hasNextPage)}
          isFetchingMoreHistory={historyQuery.isFetchingNextPage}
          fetchNextHistoryPage={fetchNextHistoryPage}
        >
          {children}
        </CoursesActionsProvider>
      </CoursesStatusProvider>
    </CoursesDataProvider>
  );
};
