"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ErrorAnalysisDisplay() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Error Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Transaction analysis coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
