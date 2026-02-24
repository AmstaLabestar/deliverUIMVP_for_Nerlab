export const coursesQueryKeys = {
  all: ["courses"] as const,
  available: () => [...coursesQueryKeys.all, "available"] as const,
  history: () => [...coursesQueryKeys.all, "history"] as const,
};
