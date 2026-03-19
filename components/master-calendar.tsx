"use client"

import { useState, useMemo } from "react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store"
import { CalendarEventCard } from "@/components/calendar-event-card"
import { BookingDetailSheet } from "@/components/booking-detail-sheet"
import { RISK_COLORS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Booking, RiskLevel } from "@/lib/types"

type CalendarView = "month" | "week" | "day"

interface MasterCalendarProps {
  riskFilter: RiskLevel | "all"
  venueFilter: string
  noiseFilter: boolean
  liquorFilter: boolean
}

export function MasterCalendar({
  riskFilter,
  venueFilter,
  noiseFilter,
  liquorFilter,
}: MasterCalendarProps) {
  const { state } = useStore()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>("month")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const filteredBookings = useMemo(() => {
    return state.bookings.filter((b) => {
      if (b.status === "cancelled") return false
      if (riskFilter !== "all" && b.riskLevel !== riskFilter) return false
      if (venueFilter !== "all" && b.venueId !== venueFilter) return false
      if (noiseFilter && !b.amplifiedNoise) return false
      if (liquorFilter && !b.liquorLicense) return false
      return true
    })
  }, [state.bookings, riskFilter, venueFilter, noiseFilter, liquorFilter])

  function getBookingsForDate(date: Date): Booking[] {
    const dateStr = format(date, "yyyy-MM-dd")
    return filteredBookings.filter((b) => b.date === dateStr)
  }

  function handleNav(dir: "prev" | "next") {
    if (view === "month") {
      setCurrentDate(dir === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
    } else if (view === "week") {
      setCurrentDate(dir === "prev" ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1))
    } else {
      setCurrentDate(dir === "prev" ? addDays(currentDate, -1) : addDays(currentDate, 1))
    }
  }

  function handleEventClick(booking: Booking) {
    setSelectedBooking(booking)
    setSheetOpen(true)
  }

  const HOURS = Array.from({ length: 16 }, (_, i) => i + 6) // 06:00 - 21:00

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleNav("prev")}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button variant="outline" size="icon" onClick={() => handleNav("next")}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
          <h2 className="text-lg font-semibold ml-2">
            {view === "month" && format(currentDate, "MMMM yyyy")}
            {view === "week" &&
              `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d")} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), "MMM d, yyyy")}`}
            {view === "day" && format(currentDate, "EEEE, MMMM d, yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          {(["month", "week", "day"] as CalendarView[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors",
                view === v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Month View */}
      {view === "month" && (
        <MonthView
          currentDate={currentDate}
          getBookingsForDate={getBookingsForDate}
          onEventClick={handleEventClick}
          onDayClick={(date) => {
            setCurrentDate(date)
            setView("day")
          }}
        />
      )}

      {/* Week View */}
      {view === "week" && (
        <WeekView
          currentDate={currentDate}
          getBookingsForDate={getBookingsForDate}
          onEventClick={handleEventClick}
          hours={HOURS}
        />
      )}

      {/* Day View */}
      {view === "day" && (
        <DayView
          currentDate={currentDate}
          bookings={getBookingsForDate(currentDate)}
          onEventClick={handleEventClick}
          hours={HOURS}
        />
      )}

      <BookingDetailSheet
        booking={selectedBooking}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  )
}

// Month View Component
function MonthView({
  currentDate,
  getBookingsForDate,
  onEventClick,
  onDayClick,
}: {
  currentDate: Date
  getBookingsForDate: (d: Date) => Booking[]
  onEventClick: (b: Booking) => void
  onDayClick: (d: Date) => void
}) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const weeks: Date[][] = []
  let day = calStart
  while (day <= calEnd) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) {
      week.push(day)
      day = addDays(day, 1)
    }
    weeks.push(week)
  }

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {dayNames.map((name) => (
          <div
            key={name}
            className="px-2 py-2 text-xs font-medium text-muted-foreground text-center"
          >
            {name}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b last:border-b-0">
          {week.map((date) => {
            const dayBookings = getBookingsForDate(date)
            const inMonth = isSameMonth(date, currentDate)
            const today = isToday(date)
            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "min-h-[100px] p-1.5 border-r last:border-r-0 cursor-pointer hover:bg-accent/30 transition-colors",
                  !inMonth && "bg-muted/20"
                )}
                onClick={() => onDayClick(date)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      !inMonth && "text-muted-foreground/40",
                      today &&
                        "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                    )}
                  >
                    {format(date, "d")}
                  </span>
                  {dayBookings.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{dayBookings.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  {dayBookings.slice(0, 3).map((booking) => (
                    <CalendarEventCard
                      key={booking.id}
                      booking={booking}
                      compact
                      onClick={(e) => {
                        onEventClick(booking)
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// Week View Component
function WeekView({
  currentDate,
  getBookingsForDate,
  onEventClick,
  hours,
}: {
  currentDate: Date
  getBookingsForDate: (d: Date) => Booking[]
  onEventClick: (b: Booking) => void
  hours: number[]
}) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  function getTopOffset(time: string): number {
    const [h, m] = time.split(":").map(Number)
    return ((h - hours[0]) * 60 + m) / ((hours.length) * 60) * 100
  }

  function getHeight(start: string, end: string): number {
    const [sh, sm] = start.split(":").map(Number)
    const [eh, em] = end.split(":").map(Number)
    const duration = (eh * 60 + em) - (sh * 60 + sm)
    return (duration / ((hours.length) * 60)) * 100
  }

  return (
    <div className="rounded-md border overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b bg-muted/30">
        <div className="px-2 py-2 text-xs font-medium text-muted-foreground" />
        {days.map((date) => (
          <div
            key={date.toISOString()}
            className="px-2 py-2 text-center border-l"
          >
            <div className="text-xs font-medium text-muted-foreground">
              {format(date, "EEE")}
            </div>
            <div
              className={cn(
                "text-sm font-semibold",
                isToday(date) && "text-primary"
              )}
            >
              {format(date, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] relative overflow-y-auto max-h-[500px]">
        {/* Time labels */}
        <div className="flex flex-col">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-12 border-b flex items-start justify-end pr-2 pt-0.5"
            >
              <span className="text-[10px] text-muted-foreground">
                {String(hour).padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((date) => {
          const dayBookings = getBookingsForDate(date)
          return (
            <div
              key={date.toISOString()}
              className="relative border-l"
            >
              {hours.map((hour) => (
                <div key={hour} className="h-12 border-b border-dashed border-border/50" />
              ))}
              {/* Event blocks */}
              {dayBookings.map((booking) => {
                const top = getTopOffset(booking.startTime)
                const height = getHeight(booking.startTime, booking.endTime)
                const risk = RISK_COLORS[booking.riskLevel]
                return (
                  <button
                    key={booking.id}
                    type="button"
                    onClick={() => onEventClick(booking)}
                    className={cn(
                      "absolute left-0.5 right-0.5 rounded-md px-1.5 py-0.5 text-left overflow-hidden transition-opacity hover:opacity-80",
                      risk.bg,
                      risk.text
                    )}
                    style={{
                      top: `${top}%`,
                      height: `${Math.max(height, 3)}%`,
                    }}
                  >
                    <div className="text-[10px] font-medium truncate">
                      {booking.title}
                    </div>
                    <div className="text-[9px] opacity-70">
                      {booking.startTime}-{booking.endTime}
                    </div>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Day View Component
function DayView({
  currentDate,
  bookings,
  onEventClick,
  hours,
}: {
  currentDate: Date
  bookings: Booking[]
  onEventClick: (b: Booking) => void
  hours: number[]
}) {
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="border-b bg-muted/30 px-4 py-3">
        <div className="text-sm font-medium">
          {format(currentDate, "EEEE, MMMM d, yyyy")}
        </div>
        <div className="text-xs text-muted-foreground">
          {bookings.length} event{bookings.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-[60px_1fr] relative max-h-[500px] overflow-y-auto">
        {/* Time labels */}
        <div className="flex flex-col">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-14 border-b flex items-start justify-end pr-2 pt-0.5"
            >
              <span className="text-[10px] text-muted-foreground">
                {String(hour).padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>

        {/* Event column */}
        <div className="relative border-l">
          {hours.map((hour) => (
            <div key={hour} className="h-14 border-b border-dashed border-border/50" />
          ))}
          {bookings.map((booking) => {
            const [sh, sm] = booking.startTime.split(":").map(Number)
            const [eh, em] = booking.endTime.split(":").map(Number)
            const startMinutes = (sh - hours[0]) * 60 + sm
            const duration = (eh * 60 + em) - (sh * 60 + sm)
            const totalMinutes = hours.length * 60
            const top = (startMinutes / totalMinutes) * 100
            const height = (duration / totalMinutes) * 100
            const risk = RISK_COLORS[booking.riskLevel]

            return (
              <button
                key={booking.id}
                type="button"
                onClick={() => onEventClick(booking)}
                className={cn(
                  "absolute left-1 right-1 rounded-md border px-3 py-2 text-left overflow-hidden transition-colors hover:bg-accent/50",
                  risk.bg,
                  booking.conflicts.length > 0
                    ? "border-red-500/30"
                    : "border-transparent"
                )}
                style={{
                  top: `${top}%`,
                  height: `${Math.max(height, 4)}%`,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", risk.dot)} />
                  <span className="text-sm font-medium truncate">{booking.title}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {booking.startTime} - {booking.endTime} | {booking.organizer}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
