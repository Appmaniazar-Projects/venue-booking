"use client"

import { DashboardStats } from "@/components/dashboard-stats"
import { RecentBookingsTable } from "@/components/recent-bookings-table"
import { BookingsChart } from "@/components/bookings-chart"
import { ConflictSummary } from "@/components/conflict-summary"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Municipal event coordination overview
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <BookingsChart />
        <ConflictSummary />
      </div>

      <RecentBookingsTable />
    </div>
  )
}
