"use client"

import {
  AlertTriangle,
  ShieldAlert,
  Volume2,
  Wine,
  Lightbulb,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TRIGGER_COLORS, TRIGGER_LABELS } from "@/lib/constants"
import type { ConflictResult, TriggerType } from "@/lib/types"

const triggerIcons: Record<TriggerType, React.ElementType> = {
  venue_conflict: ShieldAlert,
  amplified_noise: Volume2,
  risk_overlap: AlertTriangle,
  liquor_overlap: Wine,
  capacity_exceeded: AlertTriangle,
}

interface ConflictAlertPanelProps {
  conflicts: ConflictResult[]
  className?: string
}

export function ConflictAlertPanel({
  conflicts,
  className,
}: ConflictAlertPanelProps) {
  if (conflicts.length === 0) return null

  const criticalCount = conflicts.filter(
    (c) => c.severity === "critical"
  ).length
  const warningCount = conflicts.filter(
    (c) => c.severity === "warning"
  ).length

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <AlertTriangle
          className={cn(
            "h-4 w-4",
            criticalCount > 0 ? "text-red-600" : "text-amber-600"
          )}
        />
        <span className="text-sm font-medium">
          {conflicts.length} Conflict{conflicts.length > 1 ? "s" : ""}{" "}
          Detected
        </span>
        {criticalCount > 0 && (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] px-1.5 py-0">
            {criticalCount} Critical
          </Badge>
        )}
        {warningCount > 0 && (
          <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-[10px] px-1.5 py-0">
            {warningCount} Warning
          </Badge>
        )}
      </div>

      {conflicts.map((conflict, i) => {
        const Icon = triggerIcons[conflict.type]
        const colors = TRIGGER_COLORS[conflict.type]
        return (
          <Alert
            key={i}
            className={cn(
              conflict.severity === "critical"
                ? "border-red-500/30 bg-red-500/5"
                : "border-amber-500/30 bg-amber-500/5"
            )}
          >
            <Icon className={cn("h-4 w-4", colors.text)} />
            <AlertTitle className="flex items-center gap-2">
              <span className="text-sm">
                {TRIGGER_LABELS[conflict.type]}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 capitalize",
                  conflict.severity === "critical"
                    ? "border-red-500/30 text-red-600"
                    : "border-amber-500/30 text-amber-700"
                )}
              >
                {conflict.severity}
              </Badge>
            </AlertTitle>
            <AlertDescription className="flex flex-col gap-2 mt-1">
              <p className="text-sm leading-relaxed">{conflict.message}</p>
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                <span>{conflict.suggestion}</span>
              </div>
            </AlertDescription>
          </Alert>
        )
      })}
    </div>
  )
}
