"use client"

import { Building2, Ticket, CalendarDays, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"
import { useRole } from "@/components/role-provider"

export function DashboardStats() {
  const { state } = useStore()
  const { isOperator, isAdmin } = useRole()

  const totalVenues = state.venues.length
  const activeBookings = state.bookings.filter(
    (b) => b.status === "confirmed" || b.status === "override"
  ).length
  const upcomingBookings = state.bookings.filter((b) => {
    const bookingDate = new Date(b.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return bookingDate >= today && b.status !== "cancelled"
  }).length
  const activeAlerts = state.bookings.reduce(
    (count, b) => count + b.conflicts.length,
    0
  )

  // Operator-specific stats
  const myBookings = state.bookings.filter((b) => {
    const bookingDate = new Date(b.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return bookingDate >= today && b.status !== "cancelled" && b.status !== "denied"
  }).length

  const availableVenues = state.venues.filter(v => 
    !state.bookings.some(b => 
      b.venueId === v.id && 
      (b.status === 'confirmed' || b.status === 'override')
    )
  ).length

  const stats = isOperator ? [
    {
      title: "Total Venues",
      value: totalVenues,
      icon: Building2,
      description: "Available for booking",
      accent: "text-primary",
    },
    {
      title: "Available Today",
      value: availableVenues,
      icon: CalendarDays,
      description: "Not currently booked",
      accent: "text-emerald-600",
    },
    {
      title: "My Bookings",
      value: myBookings,
      icon: Ticket,
      description: "Your upcoming events",
      accent: "text-blue-600",
    },
    {
      title: "Active Alerts",
      value: activeAlerts,
      icon: AlertTriangle,
      description: "Conflict warnings",
      accent: activeAlerts > 0 ? "text-red-600" : "text-muted-foreground",
    },
  ] : [
    {
      title: "Total Venues",
      value: totalVenues,
      icon: Building2,
      description: "Registered event venues",
      accent: "text-primary",
    },
    {
      title: "Active Bookings",
      value: activeBookings,
      icon: Ticket,
      description: "Confirmed and overridden",
      accent: "text-emerald-600",
    },
    {
      title: "Upcoming Events",
      value: upcomingBookings,
      icon: CalendarDays,
      description: "Scheduled this period",
      accent: "text-amber-600",
    },
    {
      title: "Active Alerts",
      value: activeAlerts,
      icon: AlertTriangle,
      description: "Conflict warnings",
      accent: activeAlerts > 0 ? "text-red-600" : "text-muted-foreground",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.accent}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
