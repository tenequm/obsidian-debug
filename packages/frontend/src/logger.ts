type LogLevel = "debug" | "info" | "warn" | "error";

type LogContext = {
  [key: string]: unknown;
};

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    let consoleMethod: "error" | "warn" | "log";
    if (level === "error") {
      consoleMethod = "error";
    } else if (level === "warn") {
      consoleMethod = "warn";
    } else {
      consoleMethod = "log";
    }

    if (context) {
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context);
    } else {
      console[consoleMethod](`[${level.toUpperCase()}] ${message}`);
    }
  }

  debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log("warn", message, context);
  }

  error(message: string, context?: LogContext) {
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
