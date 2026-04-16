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
  fetchInitialData,
  createVenue,
  updateVenue as updateVenueInDB,
  deleteVenue as deleteVenueFromDB,
  createBooking,
  updateBooking as updateBookingInDB,
  deleteBooking as deleteBookingFromDB,
  createTriggerLog,
  createOverrideLog,
  confirmBooking as confirmBookingInDB,
  denyBooking as denyBookingInDB,
  cancelBooking as cancelBookingInDB,
  subscribeToBookings,
  subscribeToVenues,
  subscribeToTriggerLogs,
  subscribeToOverrideLogs,
} from "./supabase-services"

const initialState: AppState = {
  venues: [],
  bookings: [],
  parkingAreas: [],
  roads: [],
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
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void
  updateBooking: (booking: Booking) => void
  deleteBooking: (id: string) => void
  confirmBooking: (id: string) => void
  denyBooking: (id: string, reason: string) => void
  cancelBooking: (id: string, userId?: string) => void
  addTriggerLog: (log: TriggerLog) => void
  addOverrideLog: (log: OverrideLog) => void
  getVenueById: (id: string) => Venue | undefined
  getBookingsByVenue: (venueId: string) => Booking[]
  getBookingsByDate: (date: string) => Booking[]
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Fetch initial data
  useEffect(() => {
    fetchInitialData().then((initialData) => {
      dispatch({ type: "SET_STATE", payload: initialData })
    }).catch((error) => {
      console.error("Error loading initial data:", error)
    })
  }, [])

  // Set up real-time subscriptions
  useEffect(() => {
    const subscription = subscribeToBookings((booking) => {
      dispatch({ type: "UPDATE_BOOKING", payload: booking })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch])

  const addVenue = useCallback(
    async (venue: Venue) => {
      try {
        const newVenue = await createVenue(venue)
        dispatch({ type: "ADD_VENUE", payload: newVenue })
      } catch (error) {
        console.error("Error creating venue:", error)
        throw error
      }
    },
    []
  )

  const updateVenue = useCallback(
    async (venue: Venue) => {
      try {
        const updatedVenue = await updateVenueInDB(venue)
        dispatch({ type: "UPDATE_VENUE", payload: updatedVenue })
      } catch (error) {
        console.error("Error updating venue:", error)
        throw error
      }
    },
    []
  )

  const deleteVenue = useCallback(
    async (id: string) => {
      try {
        await deleteVenueFromDB(id)
        dispatch({ type: "DELETE_VENUE", payload: id })
      } catch (error) {
        console.error("Error deleting venue:", error)
        throw error
      }
    },
    []
  )

  const addBooking = useCallback(
    async (booking: Omit<Booking, 'id' | 'createdAt'>) => {
      try {
        const newBooking = await createBooking(booking)
        dispatch({ type: "ADD_BOOKING", payload: newBooking })

        // Log triggers if any conflicts
        for (const conflict of booking.conflicts) {
          await createTriggerLog({
            bookingId: newBooking.id,
            type: conflict.type,
            severity: conflict.severity,
            message: conflict.message,
            resolved: false,
          })
        }
      } catch (error) {
        console.error("Error creating booking:", error)
        throw error
      }
    },
    []
  )

  const updateBooking = useCallback(
    async (booking: Booking) => {
      try {
        const updatedBooking = await updateBookingInDB(booking)
        dispatch({ type: "UPDATE_BOOKING", payload: updatedBooking })

        // Log override if status changed to override
        if (booking.status === "override" && booking.overrideReason) {
          await createOverrideLog({
            bookingId: booking.id,
            operatorName: booking.overriddenBy || "Unknown",
            reason: booking.overrideReason,
            conflicts: booking.conflicts,
          })
        }
      } catch (error) {
        console.error("Error updating booking:", error)
        throw error
      }
    },
    []
  )

  const deleteBooking = useCallback(
    async (id: string) => {
      try {
        await deleteBookingFromDB(id)
        dispatch({ type: "DELETE_BOOKING", payload: id })
      } catch (error) {
        console.error("Error deleting booking:", error)
        throw error
      }
    },
    []
  )

  const confirmBooking = useCallback(
    async (id: string) => {
      try {
        const confirmedBooking = await confirmBookingInDB(id)
        dispatch({ type: "UPDATE_BOOKING", payload: confirmedBooking })
      } catch (error) {
        console.error("Error confirming booking:", error)
        throw error
      }
    },
    []
  )

  const denyBooking = useCallback(
    async (id: string, reason: string) => {
      try {
        const deniedBooking = await denyBookingInDB(id, reason)
        dispatch({ type: "UPDATE_BOOKING", payload: deniedBooking })
      } catch (error) {
        console.error("Error denying booking:", error)
        throw error
      }
    },
    []
  )

  const cancelBooking = useCallback(
    async (id: string, userId?: string) => {
      try {
        const cancelledBooking = await cancelBookingInDB(id, userId)
        dispatch({ type: "UPDATE_BOOKING", payload: cancelledBooking })
      } catch (error) {
        console.error("Error cancelling booking:", error)
        throw error
      }
    },
    []
  )

  const addTriggerLog = useCallback(
    async (log: TriggerLog) => {
      try {
        const newLog = await createTriggerLog(log)
        dispatch({ type: "ADD_TRIGGER_LOG", payload: newLog })
      } catch (error) {
        console.error("Error creating trigger log:", error)
        throw error
      }
    },
    []
  )

  const addOverrideLog = useCallback(
    async (log: OverrideLog) => {
      try {
        const newLog = await createOverrideLog(log)
        dispatch({ type: "ADD_OVERRIDE_LOG", payload: newLog })
      } catch (error) {
        console.error("Error creating override log:", error)
        throw error
      }
    },
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
        confirmBooking,
        denyBooking,
        cancelBooking,
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
