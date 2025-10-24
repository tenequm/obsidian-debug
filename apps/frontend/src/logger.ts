type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = {
  [key: string]: unknown;
};

class Logger {
  private normalizeContext(context: unknown): LogContext | undefined {
    if (context === null || context === undefined) {
      return;
    }
    if (typeof context === "object" && !Array.isArray(context)) {
      return context as LogContext;
    }
    return { value: context };
  }

  private log(level: LogLevel, message: string, context?: unknown) {
    let consoleMethod: "error" | "warn" | "log";
    if (level === "error") {
      consoleMethod = "error";
    } else if (level === "warn") {
      consoleMethod = "warn";
    } else {
      consoleMethod = "log";
    }

    const normalizedContext = this.normalizeContext(context);
    if (normalizedContext) {
      console[consoleMethod](
        `[${level.toUpperCase()}] ${message}`,
        normalizedContext
      );
    } else {
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`);
    }
  }

  debug(message: string, context?: unknown) {
    this.log("debug", message, context);
  }

  info(message: string, context?: unknown) {
    this.log("info", message, context);
  }

  warn(message: string, context?: unknown) {
    this.log("warn", message, context);
  }

  error(message: string, context?: unknown) {
    this.log("error", message, context);
  }

  // Helper method for API route logging
  apiLog(req: Request, message: string, context?: LogContext) {
    const url = new URL(req.url);
    this.info(message, {
      method: req.method,
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      ...context,
    });
  }

  // Helper method for performance tracking
  startTimer(operation: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.info(`${operation} completed`, {
        duration: `${duration.toFixed(2)}ms`,
      });
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogContext };
