"use client";

import { Construction } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DEV_MODE_BANNER_TEXT,
  isDevelopmentMode,
} from "@/lib/development-mode";

export function DevelopmentBanner() {
  if (!isDevelopmentMode()) {
    return null;
  }

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-50 dark:bg-yellow-950/20">
      <Construction className="h-4 w-4" />
      <AlertDescription className="font-medium text-sm">
        {DEV_MODE_BANNER_TEXT}
      </AlertDescription>
    </Alert>
  );
}
