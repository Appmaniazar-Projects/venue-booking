"use client"

import { AlertTriangle, ShieldAlert, Volume2, Wine } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { TRIGGER_COLORS, TRIGGER_LABELS } from "@/lib/constants"
import type { TriggerType } from "@/lib/types"

const triggerIcons: Record<TriggerType, React.ElementType> = {
  venue_conflict: ShieldAlert,
  amplified_noise: Volume2,
  risk_overlap: AlertTriangle,
  liquor_overlap: Wine,
  capacity_exceeded: AlertTriangle,
}

export function ConflictSummary() {
  const { state, getVenueById } = useStore()

  const allConflicts = state.bookings.flatMap((b) =>
    b.conflicts.map((c) => ({
      ...c,
      bookingTitle: b.title,
      venueId: b.venueId,
    }))
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Active Conflicts</CardTitle>
        <CardDescription>
          {allConflicts.length === 0
            ? "No active conflicts detected"
            : `${allConflicts.length} conflict${allConflicts.length > 1 ? "s" : ""} require attention`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {allConflicts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-emerald-500/10 p-3 mb-3">
              <ShieldAlert className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              All clear. No conflicts detected.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto">
            {allConflicts.map((conflict, i) => {
              const Icon = triggerIcons[conflict.type]
              const colors = TRIGGER_COLORS[conflict.type]
              const venue = getVenueById(conflict.venueId)
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-3 rounded-md border p-3",
                    conflict.severity === "critical"
                      ? "border-red-500/20 bg-red-500/5"
                      : "border-amber-500/20 bg-amber-500/5"
                  )}
                >
                  <Icon
                    className={cn("h-4 w-4 mt-0.5 shrink-0", colors.text)}
                  />
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {conflict.bookingTitle}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          colors.bg,
                          colors.text
                        )}
                      >
                        {TRIGGER_LABELS[conflict.type]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {conflict.message}
                    </p>
                    {venue && (
                      <p className="text-[10px] text-muted-foreground/70">
                        {venue.name}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
