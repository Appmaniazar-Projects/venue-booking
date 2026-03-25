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

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Operator-only sign-up: we set role on the auth user record.
          data: { role: "operator" },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })

      if (error) {
        toast.error(error.message)
        setErrorMessage(error.message)
        return
      }

      if (data.session) {
        toast.success("Operator account created")
        router.replace("/dashboard")
        return
      }

      const msg = "Check your email to confirm your operator account."
      setSuccessMessage(msg)
      toast.success(msg)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign-up failed"
      toast.error(message)
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>Operator sign-up only</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          {successMessage && <p className="text-sm text-emerald-500">{successMessage}</p>}

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
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create operator account"}
            </Button>
          </form>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Admin accounts must be created separately.
            </span>
            <Link href="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

