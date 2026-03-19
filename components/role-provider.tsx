"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { UserRole } from "@/lib/types"

interface RoleContextValue {
  role: UserRole
  setRole: (role: UserRole) => void
  toggleRole: () => void
  isAdmin: boolean
  isOperator: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("admin")

  const toggleRole = useCallback(() => {
    setRole((prev) => (prev === "admin" ? "operator" : "admin"))
  }, [])

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        toggleRole,
        isAdmin: role === "admin",
        isOperator: role === "operator",
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error("useRole must be used within RoleProvider")
  return ctx
}
