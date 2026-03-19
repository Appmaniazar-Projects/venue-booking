"use client"

import { useMemo } from "react"
import { format, parseISO, startOfWeek, addDays } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useStore } from "@/lib/store"

export function BookingsChart() {
  const { state } = useStore()

  const chartData = useMemo(() => {
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 1 })
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i)
      const dateStr = format(date, "yyyy-MM-dd")
      const dayBookings = state.bookings.filter(
        (b) => b.date === dateStr && b.status !== "cancelled"
      )
      return {
        day: format(date, "EEE"),
        bookings: dayBookings.length,
        high: dayBookings.filter((b) => b.riskLevel === "high").length,
        medium: dayBookings.filter((b) => b.riskLevel === "medium").length,
        low: dayBookings.filter((b) => b.riskLevel === "low").length,
      }
    })
    return days
  }, [state.bookings])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weekly Overview</CardTitle>
        <CardDescription>Bookings by risk level this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="20%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-border)"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                stroke="var(--color-muted-foreground)"
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                stroke="var(--color-muted-foreground)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 12,
                  color: "var(--color-popover-foreground)",
                }}
              />
              <Bar
                dataKey="low"
                stackId="risk"
                fill="oklch(0.65 0.17 155)"
                radius={[0, 0, 0, 0]}
                name="Low Risk"
              />
              <Bar
                dataKey="medium"
                stackId="risk"
                fill="oklch(0.75 0.16 70)"
                radius={[0, 0, 0, 0]}
                name="Medium Risk"
              />
              <Bar
                dataKey="high"
                stackId="risk"
                fill="oklch(0.6 0.2 25)"
                radius={[4, 4, 0, 0]}
                name="High Risk"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
