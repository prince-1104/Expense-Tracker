type LogLevel = "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const payload = {
    level,
    message,
    context,
    timestamp: new Date().toISOString()
  };

  // Centralized place to later forward logs to a provider like Sentry/Datadog.
  // For now, log to stdout/stderr in JSON for easy ingestion.
  if (level === "error") {
    // eslint-disable-next-line no-console
    console.error(JSON.stringify(payload));
  } else if (level === "warn") {
    // eslint-disable-next-line no-console
    console.warn(JSON.stringify(payload));
  } else {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(payload));
  }
}

export function logInfo(message: string, context?: LogContext) {
  log("info", message, context);
}

export function logWarn(message: string, context?: LogContext) {
  log("warn", message, context);
}

export function logError(message: string, context?: LogContext) {
  log("error", message, context);
}

