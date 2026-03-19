import type { Booking, ConflictResult, Venue } from "./types"

/**
 * Check if two time intervals overlap.
 * Times are in "HH:mm" format on the same date.
 */
export function hasTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const toMinutes = (t: string) => {
    const [h, m] = t.split(":").map(Number)
    return h * 60 + m
  }
  const sA = toMinutes(startA)
  const eA = toMinutes(endA)
  const sB = toMinutes(startB)
  const eB = toMinutes(endB)
  return sA < eB && sB < eA
}

/**
 * Detect all conflicts for a new/updated booking against existing bookings.
 */
export function detectConflicts(
  booking: Partial<Booking> & {
    venueId: string
    date: string
    startTime: string
    endTime: string
  },
  existingBookings: Booking[],
  venues: Venue[]
): ConflictResult[] {
  const conflicts: ConflictResult[] = []
  const bookingId = booking.id || ""

  // Only check against confirmed/override/pending bookings on the same date
  const sameDateBookings = existingBookings.filter(
    (b) =>
      b.date === booking.date &&
      b.id !== bookingId &&
      b.status !== "cancelled"
  )

  for (const existing of sameDateBookings) {
    const overlaps = hasTimeOverlap(
      booking.startTime,
      booking.endTime,
      existing.startTime,
      existing.endTime
    )

    if (!overlaps) continue

    // 1. Venue conflict: same venue, overlapping time
    if (existing.venueId === booking.venueId) {
      conflicts.push({
        type: "venue_conflict",
        severity: "critical",
        message: `Overlaps with "${existing.title}" at the same venue (${existing.startTime}-${existing.endTime})`,
        suggestion:
          "Consider rescheduling to a different time slot or selecting an alternative venue",
        relatedBookingId: existing.id,
      })
    }

    // 2. Amplified noise: two amplified events at overlapping times
    if (booking.amplifiedNoise && existing.amplifiedNoise) {
      const venue = venues.find((v) => v.id === existing.venueId)
      conflicts.push({
        type: "amplified_noise",
        severity: "warning",
        message: `Amplified noise overlap with "${existing.title}" at ${venue?.name || "another venue"} (${existing.startTime}-${existing.endTime})`,
        suggestion:
          "Coordinate sound levels between events or stagger amplified periods",
        relatedBookingId: existing.id,
      })
    }

    // 3. Risk overlap: high+high, high+medium, medium+medium
    if (booking.riskLevel && existing.riskLevel) {
      const riskScore = { low: 1, medium: 2, high: 3 }
      const combinedRisk =
        riskScore[booking.riskLevel] + riskScore[existing.riskLevel]

      if (combinedRisk >= 4) {
        const severity = combinedRisk >= 5 ? "critical" : "warning"
        const venue = venues.find((v) => v.id === existing.venueId)
        conflicts.push({
          type: "risk_overlap",
          severity,
          message: `${booking.riskLevel.charAt(0).toUpperCase() + booking.riskLevel.slice(1)} risk event overlaps with ${existing.riskLevel} risk "${existing.title}" at ${venue?.name || "another venue"}`,
          suggestion:
            severity === "critical"
              ? "Strongly recommend rescheduling one of these events to avoid compounded security risk"
              : "Ensure additional security resources are allocated for concurrent events",
          relatedBookingId: existing.id,
        })
      }
    }

    // 4. Liquor overlap: two liquor events at overlapping times
    if (booking.liquorLicense && existing.liquorLicense) {
      const venue = venues.find((v) => v.id === existing.venueId)
      conflicts.push({
        type: "liquor_overlap",
        severity: "warning",
        message: `Concurrent liquor-licensed event with "${existing.title}" at ${venue?.name || "another venue"} (${existing.startTime}-${existing.endTime})`,
        suggestion:
          "Ensure adequate law enforcement presence for concurrent alcohol-serving events",
        relatedBookingId: existing.id,
      })
    }
  }

  // 5. Capacity check
  if (booking.expectedAttendance && booking.venueId) {
    const venue = venues.find((v) => v.id === booking.venueId)
    if (venue && booking.expectedAttendance > venue.maxPopulation) {
      conflicts.push({
        type: "capacity_exceeded",
        severity: "critical",
        message: `Expected attendance (${booking.expectedAttendance}) exceeds venue capacity (${venue.maxPopulation})`,
        suggestion: `Reduce expected attendance to ${venue.maxPopulation} or choose a larger venue`,
      })
    }
  }

  return conflicts
}
