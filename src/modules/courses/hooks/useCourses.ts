import { useContext } from "react";
import { CoursesContext } from "@/src/modules/courses/store/CoursesProvider";

export const useCourses = () => {
  const context = useContext(CoursesContext);

  if (!context) {
    throw new Error("useCourses must be used inside CoursesProvider");
  }

  return context;
};
