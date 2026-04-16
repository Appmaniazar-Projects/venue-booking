"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseClient } from "@/lib/supabase-client"
import { useRole } from "@/components/role-provider"

export default function LoginPage() {
  const router = useRouter()
  const { isAdmin } = useRole()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Demo credentials
  const demoAdminEmail = process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || "admin@test.com"
  const demoAdminPassword = process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || "Admin1234"
  const demoOperatorEmail = process.env.NEXT_PUBLIC_DEMO_OPERATOR_EMAIL || "operator@test.com"
  const demoOperatorPassword = process.env.NEXT_PUBLIC_DEMO_OPERATOR_PASSWORD || "Operator1234"

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        setErrorMessage(error.message)
        return
      }

      toast.success(`Signed in successfully as ${isAdmin ? "Admin" : "Operator"}`)
      router.replace("/dashboard")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-in failed"
      toast.error(message)
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  async function loginAsDemoUser(kind: "admin" | "operator") {
    const demoEmail = kind === "admin" ? demoAdminEmail : demoOperatorEmail
    const demoPassword = kind === "admin" ? demoAdminPassword : demoOperatorPassword

    if (!demoEmail || !demoPassword) {
      const label = kind === "admin" ? "Admin" : "Operator"
      const message = `Missing ${label} demo credentials. Set NEXT_PUBLIC_DEMO_${kind === "admin" ? "ADMIN" : "OPERATOR"}_EMAIL and NEXT_PUBLIC_DEMO_${kind === "admin" ? "ADMIN" : "OPERATOR"}_PASSWORD.`
      setErrorMessage(message)
      toast.error(message)
      return
    }

    setEmail(demoEmail)
    setPassword(demoPassword)
    setErrorMessage(null)
    setLoading(true)

    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })

      if (error) {
        setErrorMessage(error.message)
        toast.error(error.message)
        return
      }

      const role = kind === "admin" ? "Admin" : "Operator"
      toast.success(`Signed in successfully as demo ${role}`)
      router.replace("/dashboard")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Demo sign-in failed"
      setErrorMessage(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in with your email and password.</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => loginAsDemoUser("admin")}
              disabled={loading}
            >
              Login as Admin
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => loginAsDemoUser("operator")}
              disabled={loading}
            >
              Login as Operator
            </Button>
          </div>

          <form className="grid gap-4" onSubmit={onSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">New here?</span>
            <div className="flex gap-2">
              <Link href="/signup" className="text-primary hover:underline">
                Create operator account
              </Link>
              <span className="text-muted-foreground">or</span>
              <Link href="/admin-signup" className="text-primary hover:underline">
                Create admin account
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

