"use client"

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react"
import type {
  AppState,
  Venue,
  Booking,
  TriggerLog,
  OverrideLog,
} from "./types"
import {
  SEED_VENUES,
  SEED_BOOKINGS,
  SEED_PARKING_AREAS,
  SEED_ROADS,
} from "./seed-data"

const STORAGE_KEY = "metromatrix-state"
const STORAGE_VERSION_KEY = "metromatrix-version"
const CURRENT_VERSION = "3" // Bump this to force a re-seed

const initialState: AppState = {
  venues: SEED_VENUES,
  bookings: SEED_BOOKINGS,
  parkingAreas: SEED_PARKING_AREAS,
  roads: SEED_ROADS,
  triggerLogs: [],
  overrideLogs: [],
}

type Action =
  | { type: "SET_STATE"; payload: AppState }
  | { type: "ADD_VENUE"; payload: Venue }
  | { type: "UPDATE_VENUE"; payload: Venue }
  | { type: "DELETE_VENUE"; payload: string }
  | { type: "ADD_BOOKING"; payload: Booking }
  | { type: "UPDATE_BOOKING"; payload: Booking }
  | { type: "DELETE_BOOKING"; payload: string }
  | { type: "ADD_TRIGGER_LOG"; payload: TriggerLog }
  | { type: "ADD_OVERRIDE_LOG"; payload: OverrideLog }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_STATE":
      return action.payload
    case "ADD_VENUE":
      return { ...state, venues: [...state.venues, action.payload] }
    case "UPDATE_VENUE":
      return {
        ...state,
        venues: state.venues.map((v) =>
          v.id === action.payload.id ? action.payload : v
        ),
      }
    case "DELETE_VENUE":
      return {
        ...state,
        venues: state.venues.filter((v) => v.id !== action.payload),
      }
    case "ADD_BOOKING":
      return { ...state, bookings: [...state.bookings, action.payload] }
    case "UPDATE_BOOKING":
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.payload.id ? action.payload : b
        ),
      }
    case "DELETE_BOOKING":
      return {
        ...state,
        bookings: state.bookings.filter((b) => b.id !== action.payload),
      }
    case "ADD_TRIGGER_LOG":
      return {
        ...state,
        triggerLogs: [action.payload, ...state.triggerLogs],
      }
    case "ADD_OVERRIDE_LOG":
      return {
        ...state,
        overrideLogs: [action.payload, ...state.overrideLogs],
      }
    default:
      return state
  }
}

interface StoreContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  addVenue: (venue: Venue) => void
  updateVenue: (venue: Venue) => void
  deleteVenue: (id: string) => void
  addBooking: (booking: Booking) => void
  updateBooking: (booking: Booking) => void
  deleteBooking: (id: string) => void
  addTriggerLog: (log: TriggerLog) => void
  addOverrideLog: (log: OverrideLog) => void
  getVenueById: (id: string) => Venue | undefined
  getBookingsByVenue: (venueId: string) => Booking[]
  getBookingsByDate: (date: string) => Booking[]
}

const StoreContext = createContext<StoreContextValue | null>(null)

function loadState(): AppState {
  if (typeof window === "undefined") return initialState
  try {
    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
    // If the version doesn't match, clear stale data and re-seed
    if (storedVersion !== CURRENT_VERSION) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)
      return initialState
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as AppState
      // Ensure all keys exist (handles schema upgrades)
      return {
        venues: parsed.venues ?? initialState.venues,
        bookings: parsed.bookings ?? initialState.bookings,
        parkingAreas: parsed.parkingAreas ?? initialState.parkingAreas,
        roads: parsed.roads ?? initialState.roads,
        triggerLogs: parsed.triggerLogs ?? initialState.triggerLogs,
        overrideLogs: parsed.overrideLogs ?? initialState.overrideLogs,
      }
    }
  } catch {
    // Ignore parse errors
  }
  localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)
  return initialState
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadState)

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Ignore quota errors
    }
  }, [state])

  const addVenue = useCallback(
    (venue: Venue) => dispatch({ type: "ADD_VENUE", payload: venue }),
    []
  )
  const updateVenue = useCallback(
    (venue: Venue) => dispatch({ type: "UPDATE_VENUE", payload: venue }),
    []
  )
  const deleteVenue = useCallback(
    (id: string) => dispatch({ type: "DELETE_VENUE", payload: id }),
    []
  )
  const addBooking = useCallback(
    (booking: Booking) => dispatch({ type: "ADD_BOOKING", payload: booking }),
    []
  )
  const updateBooking = useCallback(
    (booking: Booking) =>
      dispatch({ type: "UPDATE_BOOKING", payload: booking }),
    []
  )
  const deleteBooking = useCallback(
    (id: string) => dispatch({ type: "DELETE_BOOKING", payload: id }),
    []
  )
  const addTriggerLog = useCallback(
    (log: TriggerLog) => dispatch({ type: "ADD_TRIGGER_LOG", payload: log }),
    []
  )
  const addOverrideLog = useCallback(
    (log: OverrideLog) =>
      dispatch({ type: "ADD_OVERRIDE_LOG", payload: log }),
    []
  )
  const getVenueById = useCallback(
    (id: string) => state.venues.find((v) => v.id === id),
    [state.venues]
  )
  const getBookingsByVenue = useCallback(
    (venueId: string) => state.bookings.filter((b) => b.venueId === venueId),
    [state.bookings]
  )
  const getBookingsByDate = useCallback(
    (date: string) => state.bookings.filter((b) => b.date === date),
    [state.bookings]
  )

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        addVenue,
        updateVenue,
        deleteVenue,
        addBooking,
        updateBooking,
        deleteBooking,
        addTriggerLog,
        addOverrideLog,
        getVenueById,
        getBookingsByVenue,
        getBookingsByDate,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
