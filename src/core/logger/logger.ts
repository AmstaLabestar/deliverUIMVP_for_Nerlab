import { APP_CONFIG, LogLevel } from "@/src/core/config/env";

type LogContext = Record<string, unknown>;

const LOG_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const canLog = (level: LogLevel): boolean => {
  return LOG_PRIORITY[level] >= LOG_PRIORITY[APP_CONFIG.logging.level];
};

const serializeError = (error: unknown): Record<string, unknown> => {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
};

const writeLog = (
  level: LogLevel,
  event: string,
  context?: LogContext,
  error?: unknown,
): void => {
  if (!canLog(level)) {
    return;
  }

  const payload: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    event,
    environment: APP_CONFIG.environment,
  };

  if (context) {
    payload.context = context;
  }

  if (typeof error !== "undefined") {
    payload.error = serializeError(error);
  }

  const line = JSON.stringify(payload);

  switch (level) {
    case "debug":
    case "info":
      console.log(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
  }
};

export const logger = {
  debug: (event: string, context?: LogContext): void => {
    writeLog("debug", event, context);
  },
  info: (event: string, context?: LogContext): void => {
    writeLog("info", event, context);
  },
  warn: (event: string, context?: LogContext, error?: unknown): void => {
    writeLog("warn", event, context, error);
  },
  error: (event: string, error?: unknown, context?: LogContext): void => {
    writeLog("error", event, context, error);
  },
};
