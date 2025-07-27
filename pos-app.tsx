"use client"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { POSProvider } from "@/lib/pos-context"
import { ThemeProvider } from "@/lib/theme-context"
import { NotificationProvider } from "@/lib/notification-context"
import { Login } from "@/components/login"
import { POSSystem } from "@/components/pos-system"
import { KitchenView } from "@/components/kitchen-view"

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">Q</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading QPOS...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  // Kitchen users get their own dedicated view
  if (user.role === "kitchen") {
    return (
      <POSProvider>
        <KitchenView />
      </POSProvider>
    )
  }

  // All other users get the full POS system
  return (
    <POSProvider>
      <POSSystem />
    </POSProvider>
  )
}

export default function POSApp() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  )
}
