"use client"

import { format, parse, parseISO } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useStore } from "@/lib/store"
import { RISK_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { BookingStatus } from "@/lib/types"

const statusStyles: Record<BookingStatus, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  override: "bg-red-500/10 text-red-700 border-red-500/20",
  denied: "bg-red-500/10 text-red-700 border-red-500/20",
}

function formatTimeLabel(time: string) {
  return format(parse(time, "HH:mm", new Date()), "h:mm a")
}

function toStatusLabel(status: BookingStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function RecentBookingsTable() {
  const { state, getVenueById } = useStore()

  const recentBookings = [...state.bookings]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Bookings</CardTitle>
        <CardDescription>Latest event bookings across all venues</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentBookings.map((booking) => {
              const venue = getVenueById(booking.venueId)
              const risk = RISK_COLORS[booking.riskLevel]
              return (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {booking.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {booking.organizer}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {venue?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {format(parseISO(booking.date), "MMM d, yyyy")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeLabel(booking.startTime)} - {formatTimeLabel(booking.endTime)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn("h-2 w-2 rounded-full", risk.dot)}
                      />
                      <span className={cn("text-xs capitalize", risk.text)}>
                        {booking.riskLevel}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize",
                        statusStyles[booking.status]
                      )}
                    >
                      {toStatusLabel(booking.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              )
            })}
            {recentBookings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No bookings yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
