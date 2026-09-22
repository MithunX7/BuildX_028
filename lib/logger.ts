type LogLevel = "info" | "warn" | "error" | "debug";

interface LogPayload {
  level: LogLevel;
  message: string;
  requestId?: string;
  timestamp: string;
  data?: unknown;
}

function formatLog(level: LogLevel, message: string, data?: unknown, requestId?: string): LogPayload {
  return {
    level,
    message,
    requestId,
    timestamp: new Date().toISOString(),
    data,
  };
}

export const logger = {
  info(message: string, data?: unknown, requestId?: string) {
    const payload = formatLog("info", message, data, requestId);
    console.log(JSON.stringify(payload));
  },
  warn(message: string, data?: unknown, requestId?: string) {
    const payload = formatLog("warn", message, data, requestId);
    console.warn(JSON.stringify(payload));
  },
  error(message: string, error?: unknown, requestId?: string) {
    const payload = formatLog(
      "error",
      message,
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error,
      requestId
    );
    console.error(JSON.stringify(payload));
  },
  debug(message: string, data?: unknown, requestId?: string) {
    if (process.env.NODE_ENV !== "production") {
      const payload = formatLog("debug", message, data, requestId);
      console.debug(JSON.stringify(payload));
    }
  },
};
