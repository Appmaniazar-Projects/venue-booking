"use client"

import { DashboardStats } from "@/components/dashboard-stats"
import { RecentBookingsTable } from "@/components/recent-bookings-table"
import { BookingsChart } from "@/components/bookings-chart"
import { ConflictSummary } from "@/components/conflict-summary"
import { useRole } from "@/components/role-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, CalendarDays, Ticket, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const { isOperator, isAdmin } = useRole()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isOperator 
            ? "Venue booking and management overview" 
            : "Municipal event coordination overview"
          }
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-2">
        {isOperator ? (
          <>
            {/* Operator-focused content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/venues">
                  <Button className="w-full">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Browse Venues
                  </Button>
                </Link>
                <Link href="/calendar">
                  <Button variant="outline" className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Calendar
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  My Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View and manage your upcoming venue bookings
                </p>
                <Link href="/venues">
                  <Button variant="outline" className="w-full mt-2">
                    Book New Venue
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Admin-focused content */}
            <BookingsChart />
            <ConflictSummary />
          </>
        )}
      </div>

      <RecentBookingsTable />
    </div>
  )
}
