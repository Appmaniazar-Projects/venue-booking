"use client"

import { useState } from "react"
import { MasterCalendar } from "@/components/master-calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useStore } from "@/lib/store"
import { useRole } from "@/components/role-provider"
import type { RiskLevel } from "@/lib/types"

export default function CalendarPage() {
  const { state } = useStore()
  const { isOperator, isAdmin } = useRole()
  const [riskFilter, setRiskFilter] = useState<RiskLevel | "all">("all")
  const [venueFilter, setVenueFilter] = useState("all")
  const [noiseFilter, setNoiseFilter] = useState(false)
  const [liquorFilter, setLiquorFilter] = useState(false)

  // Operator-specific: Show only operator's bookings
  const operatorBookings = isOperator 
    ? state.bookings.filter(b => b.organizer === "Test Operator" && b.status !== "cancelled" && b.status !== "denied")
    : state.bookings.filter(b => b.status !== "cancelled" && b.status !== "denied")

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {isOperator ? "My Calendar" : "Master Calendar"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isOperator 
            ? "View your scheduled events and manage bookings"
            : "View all scheduled events with conflict visualization"
          }
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">
            Risk:
          </Label>
          <Select
            value={riskFilter}
            onValueChange={(val) => setRiskFilter(val as RiskLevel | "all")}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">
            Venue:
          </Label>
          <Select value={venueFilter} onValueChange={setVenueFilter}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isOperator ? "All My Venues" : "All Venues"}</SelectItem>
              {state.venues.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="noise-filter"
            checked={noiseFilter}
            onCheckedChange={setNoiseFilter}
          />
          <Label htmlFor="noise-filter" className="text-xs cursor-pointer">
            Amplified Noise
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="liquor-filter"
            checked={liquorFilter}
            onCheckedChange={setLiquorFilter}
          />
          <Label htmlFor="liquor-filter" className="text-xs cursor-pointer">
            Liquor Events
          </Label>
        </div>
      </div>

      <MasterCalendar
        bookings={operatorBookings}
        riskFilter={riskFilter}
        venueFilter={venueFilter}
        noiseFilter={noiseFilter}
        liquorFilter={liquorFilter}
      />
    </div>
  )
}
