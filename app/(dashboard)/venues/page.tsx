"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Plus, Search, Users, MapPin, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useStore } from "@/lib/store"
import { useRole } from "@/components/role-provider"
import { VenueFormDialog } from "@/components/venue-form"
import { VenueBookingForm } from "@/components/venue-booking-form"
import type { VenueType } from "@/lib/types"

export default function VenuesPage() {
  const { state } = useStore()
  const { isAdmin, isOperator } = useRole()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<VenueType | "all">("all")
  const [formOpen, setFormOpen] = useState(false)
  const [bookingFormOpen, setBookingFormOpen] = useState<string | null>(null)

  const filteredVenues = useMemo(() => {
    return state.venues.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.ownerName.toLowerCase().includes(search.toLowerCase()) ||
        v.address.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || v.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [state.venues, search, typeFilter])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            Venue Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "Browse and manage event venues across Green Point" : "Browse event venues across Green Point"}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => setFormOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Venue
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(val) => setTypeFilter(val as VenueType | "all")}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="indoor">Indoor</SelectItem>
            <SelectItem value="outdoor">Outdoor</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredVenues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground">No venues found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVenues.map((venue) => (
            <Link
              key={venue.id}
              href={`/venues/${venue.id}`}
              className="group flex flex-col rounded-lg border bg-card overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                {venue.image ? (
                  <Image
                    src={venue.image}
                    alt={venue.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <MapPin className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
                <Badge
                  variant="secondary"
                  className="absolute top-2 right-2 text-[10px] capitalize backdrop-blur-sm bg-background/80"
                >
                  {venue.type}
                </Badge>
              </div>
              <div className="flex flex-col gap-1.5 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-primary leading-tight group-hover:underline underline-offset-2">
                    {venue.name}
                  </h3>
                  {isOperator && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setBookingFormOpen(venue.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <CalendarPlus className="h-3.5 w-3.5 mr-1.5" />
                      Book Venue
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">{venue.address}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3 w-3 shrink-0" />
                  <span>Capacity: {venue.maxPopulation.toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isAdmin && (
        <VenueFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
        />
      )}

      {isOperator && (
        <VenueBookingForm
          open={!!bookingFormOpen}
          onOpenChange={(open) => {
            if (!open) setBookingFormOpen(null)
          }}
          venue={state.venues.find(v => v.id === bookingFormOpen)}
        />
      )}
    </div>
  )
}
