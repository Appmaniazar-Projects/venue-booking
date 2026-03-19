"use client"

import { Volume2, Wine, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RISK_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Booking } from "@/lib/types"

interface CalendarEventCardProps {
  booking: Booking
  compact?: boolean
  onClick?: () => void
}

export function CalendarEventCard({
  booking,
  compact = false,
  onClick,
}: CalendarEventCardProps) {
  const risk = RISK_COLORS[booking.riskLevel]

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    onClick?.()
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1 w-full text-left rounded px-1.5 py-0.5 text-[11px] leading-tight truncate transition-colors hover:opacity-80",
          risk.bg,
          risk.text
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", risk.dot)} />
        <span className="truncate">{booking.title}</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1 w-full text-left rounded-md border p-2 transition-colors hover:bg-accent/50",
        booking.conflicts.length > 0
          ? "border-red-500/30 bg-red-500/5"
          : "border-border"
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className={cn("h-2 w-2 rounded-full shrink-0", risk.dot)} />
        <span className="text-sm font-medium truncate">{booking.title}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span>
          {booking.startTime}-{booking.endTime}
        </span>
        <div className="flex items-center gap-0.5 ml-auto">
          {booking.amplifiedNoise && (
            <Volume2 className="h-3 w-3 text-amber-600" />
          )}
          {booking.liquorLicense && (
            <Wine className="h-3 w-3 text-violet-600" />
          )}
          {booking.conflicts.length > 0 && (
            <AlertTriangle className="h-3 w-3 text-red-600" />
          )}
        </div>
      </div>
    </button>
  )
}
