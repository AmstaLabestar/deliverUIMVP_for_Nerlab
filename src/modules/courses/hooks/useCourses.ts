import {
  CoursesActionsContext,
  CoursesActionsContextValue,
} from "@/src/modules/courses/store/CoursesActionsContext";
import {
  CoursesDataContext,
  CoursesDataContextValue,
} from "@/src/modules/courses/store/CoursesDataContext";
import {
  CoursesStatusContext,
  CoursesStatusContextValue,
} from "@/src/modules/courses/store/CoursesStatusContext";
import { useContext, useMemo } from "react";

export const useCoursesData = (): CoursesDataContextValue => {
  const context = useContext(CoursesDataContext);

  if (!context) {
    throw new Error("useCoursesData must be used inside CoursesDataProvider");
  }

  return context;
};

export const useCoursesActions = (): CoursesActionsContextValue => {
  const context = useContext(CoursesActionsContext);

  if (!context) {
    throw new Error("useCoursesActions must be used inside CoursesActionsProvider");
  }

  return context;
};

export const useCoursesStatus = (): CoursesStatusContextValue => {
  const context = useContext(CoursesStatusContext);

  if (!context) {
    throw new Error("useCoursesStatus must be used inside CoursesStatusProvider");
  }

  return context;
};

export const useCourses = () => {
  const data = useCoursesData();
  const actions = useCoursesActions();
  const status = useCoursesStatus();

  return useMemo(
    () => ({
      availableCourses: data.availableCourses,
      activeCourse: data.activeCourse,
      history: data.history,
      refreshCourses: actions.refreshCourses,
      loadMoreAvailableCourses: actions.loadMoreAvailableCourses,
      loadMoreHistory: actions.loadMoreHistory,
      acceptCourse: actions.acceptCourse,
      rejectCourse: actions.rejectCourse,
      assignExternalCourse: actions.assignExternalCourse,
      startActiveCourse: actions.startActiveCourse,
      completeActiveCourse: actions.completeActiveCourse,
      isLoading: status.isLoading,
      error: status.error,
      isFetchingMoreAvailableCourses: status.isFetchingMoreAvailable,
      hasNextAvailablePage: data.hasNextAvailablePage,
      isFetchingMoreHistory: status.isFetchingMoreHistory,
      hasNextHistoryPage: data.hasNextHistoryPage,
    }),
    [actions, data, status],
  );
};
