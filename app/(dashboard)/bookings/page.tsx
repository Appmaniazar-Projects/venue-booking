"use client"

import { useState, useMemo } from "react"
import { format, parseISO } from "date-fns"
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  XCircle,
  Volume2,
  Wine,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { RISK_COLORS } from "@/lib/constants"
import { BookingFormDialog } from "@/components/booking-form"
import { BookingDetailSheet } from "@/components/booking-detail-sheet"
import { cn } from "@/lib/utils"
import type { Booking, BookingStatus } from "@/lib/types"
import { toast } from "sonner"

const statusStyles: Record<BookingStatus, string> = {
  confirmed: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  override: "bg-red-500/10 text-red-700 border-red-500/20",
}

export default function BookingsPage() {
  const { state, getVenueById, updateBooking } = useStore()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all")
  const [formOpen, setFormOpen] = useState(false)
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filteredBookings = useMemo(() => {
    return state.bookings
      .filter((b) => {
        const venue = getVenueById(b.venueId)
        const matchesSearch =
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.organizer.toLowerCase().includes(search.toLowerCase()) ||
          (venue?.name || "").toLowerCase().includes(search.toLowerCase())
        const matchesStatus =
          statusFilter === "all" || b.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }, [state.bookings, search, statusFilter, getVenueById])

  function handleCancel(booking: Booking) {
    updateBooking({ ...booking, status: "cancelled" })
    toast.success(`"${booking.title}" has been cancelled`)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Booking Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage event bookings with conflict detection
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Booking
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) =>
            setStatusFilter(val as BookingStatus | "all")
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="override">Override</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Triggers</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => {
              const venue = getVenueById(booking.venueId)
              const risk = RISK_COLORS[booking.riskLevel]
              return (
                <TableRow
                  key={booking.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setDetailBooking(booking)
                    setDetailOpen(true)
                  }}
                >
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
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn("h-2 w-2 rounded-full", risk.dot)}
                      />
                      <span
                        className={cn("text-xs capitalize", risk.text)}
                      >
                        {booking.riskLevel}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {booking.amplifiedNoise && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-[10px] px-1 py-0"
                        >
                          <Volume2 className="h-2.5 w-2.5" />
                        </Badge>
                      )}
                      {booking.liquorLicense && (
                        <Badge
                          variant="outline"
                          className="bg-violet-500/10 text-violet-600 border-violet-500/20 text-[10px] px-1 py-0"
                        >
                          <Wine className="h-2.5 w-2.5" />
                        </Badge>
                      )}
                      {booking.conflicts.length > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] px-1 py-0"
                        >
                          <AlertTriangle className="h-2.5 w-2.5" />
                        </Badge>
                      )}
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
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            setDetailBooking(booking)
                            setDetailOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {booking.status !== "cancelled" && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancel(booking)
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Booking
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
            {filteredBookings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-muted-foreground"
                >
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BookingFormDialog open={formOpen} onOpenChange={setFormOpen} />

      <BookingDetailSheet
        booking={detailBooking}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
