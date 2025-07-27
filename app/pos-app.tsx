"use client"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { POSProvider } from "@/lib/pos-context"
import { ThemeProvider } from "@/lib/theme-context"
import { NotificationProvider } from "@/lib/notification-context"
import { Login } from "@/components/login"
import { POSSystem } from "@/components/pos-system"
import { KitchenView } from "@/components/kitchen-view"
import { useEffect, useState } from "react"

function AppContent() {
  const { user, isLoading } = useAuth()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const email = user.email?.toLowerCase() || ""
      if (email.includes("admin")) setRole("admin")
      else if (email.includes("cashier")) setRole("cashier")
      else if (email.includes("kitchen")) setRole("kitchen")
    }
  }, [user])

  if (isLoading) return <div className="p-4 text-center">Loading...</div>
  if (!user) return <Login />

  return (
    <main className="p-4">
      {role === "admin" && <div className="text-xl font-bold">Welcome Admin</div>}
      {role === "cashier" && <POSSystem />}
      {role === "kitchen" && <KitchenView />}
    </main>
  )
}

export default function POSApp() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
          <POSProvider>
            <AppContent />
          </POSProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
