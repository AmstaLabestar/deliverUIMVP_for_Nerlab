import { Course, CursorPage, PaginationParams } from "@/src/modules/courses/types/courseTypes";

export interface CoursesRepository {
  fetchAvailableCoursesPage: (
    params?: PaginationParams,
  ) => Promise<CursorPage<Course>>;
  fetchHistoryPage: (params?: PaginationParams) => Promise<CursorPage<Course>>;
}
