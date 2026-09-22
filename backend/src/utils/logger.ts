type LogLevel = "info" | "warn" | "error" | "debug";

function formatLog(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const metaStr = data ? ` | ${JSON.stringify(data)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
  info(message: string, data?: unknown): void {
    console.log(formatLog("info", message, data));
  },
  warn(message: string, data?: unknown): void {
    console.warn(formatLog("warn", message, data));
  },
  error(message: string, data?: unknown): void {
    console.error(formatLog("error", message, data));
  },
  debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(formatLog("debug", message, data));
    }
  },
};
