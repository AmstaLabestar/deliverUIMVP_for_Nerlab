import { z } from "zod";
import { AppError } from "@/src/core/errors/AppError";

export const parseWithSchema = <T>(
  schema: z.ZodType<T>,
  payload: unknown,
  context: string,
): T => {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const details = issue?.message ? ` ${issue.message}` : "";
    throw new AppError("validation_error", `${context}.${details}`.trim(), parsed.error);
  }

  return parsed.data;
};
