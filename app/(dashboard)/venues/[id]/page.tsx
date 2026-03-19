"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format, parseISO } from "date-fns"
import {
  ArrowLeft,
  MapPin,
  Users,
  Mail,
  Building2,
  Ticket,
  Pencil,
  Trash2,
  Car,
  Route,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store"
import { VenueFormDialog } from "@/components/venue-form"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { state, getBookingsByVenue, deleteVenue } = useStore()
  const [editOpen, setEditOpen] = useState(false)
  const router = useRouter()

  const venue = state.venues.find((v) => v.id === id)

  if (!venue) {
    notFound()
  }

  const venueBookings = getBookingsByVenue(venue.id).filter(
    (b) => b.status !== "cancelled"
  )

  const linkedParking = state.parkingAreas.filter((p) =>
    p.linkedVenueIds.includes(venue.id)
  )
  const linkedRoads = state.roads.filter((r) =>
    r.linkedVenueIds.includes(venue.id)
  )

  function handleDelete() {
    deleteVenue(venue.id)
    toast.success(`"${venue.name}" has been removed`)
    router.push("/venues")
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Back nav */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/venues">
            <ArrowLeft className="h-4 w-4 mr-1" />
            All Venues
          </Link>
        </Button>
      </div>

      {/* Hero section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative aspect-[16/9] overflow-hidden rounded-lg border bg-muted">
          {venue.image ? (
            <Image
              src={venue.image}
              alt={venue.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building2 className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="capitalize">
                {venue.type}
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {venue.name}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{venue.address}</span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 rounded-md border p-3">
              <span className="text-xs text-muted-foreground">Max Capacity</span>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                <span className="text-lg font-semibold">
                  {venue.maxPopulation.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-md border p-3">
              <span className="text-xs text-muted-foreground">Active Bookings</span>
              <div className="flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5 text-primary" />
                <span className="text-lg font-semibold">
                  {venueBookings.length}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">Owner Details</h4>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{venue.ownerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{venue.ownerContact}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming Bookings</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {venueBookings.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {venueBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No active bookings for this venue.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {venueBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center gap-3 rounded-md border p-3"
                  >
                    <Ticket className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {booking.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(booking.date), "MMM d, yyyy")} |{" "}
                        {booking.startTime} - {booking.endTime} |{" "}
                        {booking.expectedAttendance.toLocaleString()} expected
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0 shrink-0 capitalize",
                        booking.status === "confirmed"
                          ? "border-emerald-500/20 text-emerald-600"
                          : booking.status === "override"
                            ? "border-red-500/20 text-red-600"
                            : "border-amber-500/20 text-amber-600"
                      )}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Infrastructure */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                Linked Parking
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedParking.length === 0 ? (
                <p className="text-xs text-muted-foreground">No linked parking areas.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {linkedParking.map((p) => (
                    <div key={p.id} className="flex flex-col gap-0.5 rounded-md border p-2.5">
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.allocatedSpaces.toLocaleString()} / {p.totalSpaces.toLocaleString()} spaces allocated
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Route className="h-4 w-4 text-muted-foreground" />
                Linked Roads
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedRoads.length === 0 ? (
                <p className="text-xs text-muted-foreground">No linked roads.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {linkedRoads.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-2 rounded-md border p-2.5">
                      <span className="text-sm font-medium truncate">{r.name}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 shrink-0 capitalize",
                          r.status === "open"
                            ? "border-emerald-500/20 text-emerald-600"
                            : r.status === "closed"
                              ? "border-red-500/20 text-red-600"
                              : "border-amber-500/20 text-amber-600"
                        )}
                      >
                        {r.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground/60">
            Added {format(parseISO(venue.createdAt), "MMM d, yyyy")}
          </div>
        </div>
      </div>

      <VenueFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        venue={venue}
      />
    </div>
  )
}
