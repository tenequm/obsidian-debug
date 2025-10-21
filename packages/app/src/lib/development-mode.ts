export function isDevelopmentMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("dev") === "true" ||
    process.env.NEXT_PUBLIC_ENV === "development"
  );
}

export function redirectToDevelopmentMode() {
  if (typeof window !== "undefined" && !isDevelopmentMode()) {
    window.location.href = "/?dev=true";
  }
}

export const DEV_MODE_BANNER_TEXT =
  "🚧 Development Mode Active - Using Test Data";
