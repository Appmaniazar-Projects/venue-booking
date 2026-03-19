import type { RiskLevel, TriggerType } from "./types"

export const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; dot: string }> = {
  low: { bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
  medium: { bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
  high: { bg: "bg-red-500/10", text: "text-red-600", dot: "bg-red-500" },
}

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
}

export const TRIGGER_LABELS: Record<TriggerType, string> = {
  venue_conflict: "Venue Conflict",
  amplified_noise: "Amplified Noise",
  risk_overlap: "Risk Overlap",
  liquor_overlap: "Liquor Overlap",
  capacity_exceeded: "Capacity Exceeded",
}

export const TRIGGER_COLORS: Record<TriggerType, { bg: string; text: string }> = {
  venue_conflict: { bg: "bg-red-500/10", text: "text-red-600" },
  amplified_noise: { bg: "bg-amber-500/10", text: "text-amber-700" },
  risk_overlap: { bg: "bg-orange-500/10", text: "text-orange-600" },
  liquor_overlap: { bg: "bg-violet-500/10", text: "text-violet-600" },
  capacity_exceeded: { bg: "bg-red-500/10", text: "text-red-600" },
}

export const VENUE_TYPES = [
  { value: "indoor", label: "Indoor" },
  { value: "outdoor", label: "Outdoor" },
  { value: "hybrid", label: "Hybrid" },
] as const

export const BOOKING_STATUSES = [
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
  { value: "override", label: "Override" },
] as const
