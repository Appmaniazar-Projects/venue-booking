"use client"

import { format, parseISO } from "date-fns"
import {
  CalendarDays,
  Clock,
  Users,
  MapPin,
  Volume2,
  Wine,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { RISK_COLORS } from "@/lib/constants"
import { ConflictAlertPanel } from "@/components/conflict-alert-panel"
import { cn } from "@/lib/utils"
import type { Booking, BookingStatus } from "@/lib/types"

const statusStyles: Record<BookingStatus, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  override: "bg-red-500/10 text-red-700 border-red-500/20",
}

interface BookingDetailSheetProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookingDetailSheet({
  booking,
  open,
  onOpenChange,
}: BookingDetailSheetProps) {
  const { getVenueById } = useStore()

  if (!booking) return null

  const venue = getVenueById(booking.venueId)
  const risk = RISK_COLORS[booking.riskLevel]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <SheetTitle>{booking.title}</SheetTitle>
            <Badge
              variant="outline"
              className={cn(
                "capitalize text-xs",
                statusStyles[booking.status]
              )}
            >
              {booking.status}
            </Badge>
          </div>
          <SheetDescription>{booking.description || booking.organizer}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 mt-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-md border p-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Date</span>
                <span className="text-sm font-medium">
                  {format(parseISO(booking.date), "MMM d, yyyy")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border p-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Time</span>
                <span className="text-sm font-medium">
                  {booking.startTime} - {booking.endTime}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border p-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs text-muted-foreground">Venue</span>
                <span className="text-sm font-medium truncate">
                  {venue?.name || "Unknown"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-md border p-3">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Attendance</span>
                <span className="text-sm font-medium">
                  {booking.expectedAttendance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium">Risk & Triggers</h4>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  risk.bg,
                  risk.text
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", risk.dot)} />
                {booking.riskLevel} risk
              </Badge>
              {booking.amplifiedNoise && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                  <Volume2 className="h-3 w-3 mr-1" />
                  Amplified Noise
                </Badge>
              )}
              {booking.liquorLicense && (
                <Badge variant="outline" className="bg-violet-500/10 text-violet-600 border-violet-500/20">
                  <Wine className="h-3 w-3 mr-1" />
                  Liquor License
                </Badge>
              )}
            </div>
          </div>

          {booking.conflicts.length > 0 && (
            <>
              <Separator />
              <ConflictAlertPanel conflicts={booking.conflicts} />
            </>
          )}

          {booking.status === "override" && booking.overrideReason && (
            <>
              <Separator />
              <div className="flex flex-col gap-2 rounded-md border border-red-500/20 bg-red-500/5 p-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    Override Applied
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {booking.overrideReason}
                </p>
                {booking.overriddenBy && (
                  <p className="text-xs text-muted-foreground/70">
                    By {booking.overriddenBy} on{" "}
                    {booking.overriddenAt
                      ? format(parseISO(booking.overriddenAt), "MMM d, yyyy 'at' HH:mm")
                      : "N/A"}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="text-xs text-muted-foreground/60 pt-2">
            Created {format(parseISO(booking.createdAt), "MMM d, yyyy 'at' HH:mm")}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
