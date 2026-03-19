"use client"

import { format, parseISO } from "date-fns"
import { AlertTriangle, ShieldCheck } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store"
import { TRIGGER_COLORS, TRIGGER_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

export default function LogsPage() {
  const { state } = useStore()

  const triggerLogs = [...state.triggerLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  const overrideLogs = [...state.overrideLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  // Get booking title helper
  function getBookingTitle(bookingId: string): string {
    const booking = state.bookings.find((b) => b.id === bookingId)
    return booking?.title || "Unknown Booking"
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          System Logs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Audit trail of triggers, conflicts, and administrative overrides
        </p>
      </div>

      <Tabs defaultValue="triggers">
        <TabsList>
          <TabsTrigger value="triggers" className="gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Trigger Logs
            {triggerLogs.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {triggerLogs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="overrides" className="gap-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Override Logs
            {overrideLogs.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
                {overrideLogs.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="triggers" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trigger History</CardTitle>
              <CardDescription>
                All conflict triggers raised by the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {triggerLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No trigger logs yet. Triggers are recorded when bookings
                    have conflicts.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Booking</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {triggerLogs.map((log) => {
                      const colors = TRIGGER_COLORS[log.type]
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(
                              parseISO(log.timestamp),
                              "MMM d, HH:mm:ss"
                            )}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {getBookingTitle(log.bookingId)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] px-1.5 py-0",
                                colors.bg,
                                colors.text
                              )}
                            >
                              {TRIGGER_LABELS[log.type]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] px-1.5 py-0 capitalize",
                                log.severity === "critical"
                                  ? "bg-red-500/10 text-red-600 border-red-500/20"
                                  : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                              )}
                            >
                              {log.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm max-w-[300px] truncate">
                            {log.message}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] px-1.5 py-0",
                                log.resolved
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {log.resolved ? "Resolved" : "Open"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overrides" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Override History</CardTitle>
              <CardDescription>
                Administrative overrides with justifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overrideLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No override logs yet. Overrides are recorded when operators
                    confirm bookings despite conflicts.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Booking</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Conflicts Overridden</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overrideLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(
                            parseISO(log.timestamp),
                            "MMM d, HH:mm:ss"
                          )}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {getBookingTitle(log.bookingId)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.operatorName}
                        </TableCell>
                        <TableCell className="text-sm max-w-[250px] truncate">
                          {log.reason}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {log.conflicts.map((c, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1.5 py-0",
                                  TRIGGER_COLORS[c.type].bg,
                                  TRIGGER_COLORS[c.type].text
                                )}
                              >
                                {TRIGGER_LABELS[c.type]}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
