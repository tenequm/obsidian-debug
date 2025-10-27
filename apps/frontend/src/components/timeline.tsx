"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { TimelineStep, TransactionTimeline } from "@/lib/timeline/types";

interface TimelineStepProps {
  step: TimelineStep;
  isLast: boolean;
  isFailed: boolean;
}

function TimelineStepComponent({ step, isLast, isFailed }: TimelineStepProps) {
  return (
    <div className="relative flex gap-4">
      {!isLast && (
        <div
          className={`absolute top-8 left-4 h-full w-0.5 ${
            isFailed ? "bg-destructive/20" : "bg-border"
          }`}
        />
      )}

      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background">
        {step.status === "failed" ? (
          <div className="h-3 w-3 rounded-full bg-destructive" />
        ) : (
          <div className="h-3 w-3 rounded-full bg-primary" />
        )}
      </div>

      <Card className="mb-4 flex-1 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground text-sm">
                Step {step.index + 1}
              </span>
              <Badge
                variant={step.status === "failed" ? "destructive" : "secondary"}
              >
                {step.status}
              </Badge>
            </div>
            <p className="mt-1 font-semibold">{step.programName}</p>
            {step.narrative && (
              <p className="mt-2 text-muted-foreground text-sm">
                {step.narrative}
              </p>
            )}
            {step.errorMessage && (
              <p className="mt-2 text-destructive text-sm">
                {step.errorMessage}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-muted-foreground text-xs">Compute</div>
            <div className="font-mono text-sm">
              {step.computeUnits.toLocaleString()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface TimelineProps {
  timeline: TransactionTimeline;
}

export function Timeline({ timeline }: TimelineProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-lg">
          Transaction Execution Timeline
        </h3>
        <div className="mt-2 flex items-center gap-4 text-muted-foreground text-sm">
          <span>{timeline.steps.length} instructions</span>
          <span>•</span>
          <span>{timeline.totalCompute.toLocaleString()} compute units</span>
          {timeline.failedAtStep !== undefined && (
            <>
              <span>•</span>
              <span className="text-destructive">
                Failed at step {timeline.failedAtStep + 1}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-0">
        {timeline.steps.map((step, idx) => (
          <TimelineStepComponent
            isFailed={idx === timeline.failedAtStep}
            isLast={idx === timeline.steps.length - 1}
            key={step.id}
            step={step}
          />
        ))}
      </div>
    </Card>
  );
}
