"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { usePOS } from "@/lib/pos-context"
import { useNotification } from "@/lib/notification-context"
import { AlertTriangle, RotateCcw, Database, Trash2, Download, Upload } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

export function SystemManagement() {
  const { orders, getAllOrders } = usePOS()
  const { showNotification, showConfirmation, showToast } = useNotification()
  const [isResetting, setIsResetting] = useState(false)
  const [resetConfirmation, setResetConfirmation] = useState("")

  const handleSystemReset = async () => {
    if (resetConfirmation !== "RESET SYSTEM") {
      showNotification({
        type: "warning",
        title: "Invalid Confirmation",
        message: 'Please type "RESET SYSTEM" exactly to confirm the reset operation.',
      })
      return
    }

    showConfirmation(
      "⚠️ SYSTEM RESET WARNING",
      "This will permanently delete ALL data including:\n\n• All orders and order history\n• Menu items and categories\n• User accounts and settings\n• Tax and discount configurations\n• System preferences\n\nThis action cannot be undone. Are you absolutely sure?",
      async () => {
        setIsResetting(true)

        try {
          // Clear all localStorage data
          const keysToRemove = [
            "pos-menu-items",
            "pos-categories",
            "pos-users",
            "pos-tax-settings",
            "pos-discount-types",
            "pos-orders",
            "pos-general-settings",
            "pos-current-user",
            "pos-theme",
          ]

          keysToRemove.forEach((key) => {
            localStorage.removeItem(key)
          })

          showNotification({
            type: "success",
            title: "System Reset Complete",
            message: "All system data has been cleared successfully. The page will now reload to apply changes.",
            onConfirm: () => window.location.reload(),
            confirmText: "Reload Now",
          })
        } catch (error) {
          console.error("Error resetting system:", error)
          showNotification({
            type: "error",
            title: "Reset Failed",
            message: "An error occurred during system reset. Please try again or contact support.",
          })
        } finally {
          setIsResetting(false)
          setResetConfirmation("")
        }
      },
      "error",
    )
  }

  const handleExportData = () => {
    try {
      const exportData = {
        orders: getAllOrders(),
        menuItems: JSON.parse(localStorage.getItem("pos-menu-items") || "[]"),
        categories: JSON.parse(localStorage.getItem("pos-categories") || "[]"),
        users: JSON.parse(localStorage.getItem("pos-users") || "[]"),
        taxSettings: JSON.parse(localStorage.getItem("pos-tax-settings") || "{}"),
        discountTypes: JSON.parse(localStorage.getItem("pos-discount-types") || "[]"),
        generalSettings: JSON.parse(localStorage.getItem("pos-general-settings") || "{}"),
        exportDate: new Date().toISOString(),
        version: "1.0",
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `donerg-pos-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      showToast({
        type: "success",
        title: "Export Complete",
        message: "System data has been exported successfully to your downloads folder.",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      showNotification({
        type: "error",
        title: "Export Failed",
        message: "An error occurred while exporting system data. Please try again.",
      })
    }
  }

  const getSystemStats = () => {
    const totalOrders = orders.length
    const completedOrders = orders.filter((o) => o.status === "completed").length
    const totalRevenue = orders.filter((o) => o.status === "completed").reduce((sum, o) => sum + o.total, 0)
    const menuItems = JSON.parse(localStorage.getItem("pos-menu-items") || "[]").length
    const categories = JSON.parse(localStorage.getItem("pos-categories") || "[]").length
    const users = JSON.parse(localStorage.getItem("pos-users") || "[]").length

    return {
      totalOrders,
      completedOrders,
      totalRevenue,
      menuItems,
      categories,
      users,
    }
  }

  const stats = getSystemStats()

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">System Management</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage system data, backups, and reset options</p>
      </div>

      {/* System Statistics */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
            <Database className="h-5 w-5" />
            <span>System Statistics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="responsive-grid grid gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalOrders}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Orders</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completedOrders}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed Orders</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.menuItems}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Menu Items</div>
            </div>
            <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.categories}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Categories</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.users}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">System Users</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-200">Data Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={handleExportData}
              variant="outline"
              className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Export System Data
            </Button>
            <Button
              variant="outline"
              className="flex-1 dark:border-gray-600 dark:text-gray-300 bg-transparent"
              disabled
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data (Coming Soon)
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Export creates a complete backup of all system data including orders, menu, users, and settings.
          </p>
        </CardContent>
      </Card>

      {/* System Reset */}
      <Card className="border-red-200 dark:border-red-800 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2">Complete System Reset</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              This will permanently delete ALL data including:
            </p>
            <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1 mb-4">
              <li>All orders and order history</li>
              <li>Menu items and categories</li>
              <li>User accounts and settings</li>
              <li>Tax and discount configurations</li>
              <li>System preferences</li>
            </ul>
            <p className="text-sm font-semibold text-red-800 dark:text-red-400">⚠️ This action cannot be undone!</p>
          </div>

          <Separator className="dark:border-gray-600" />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-confirmation" className="text-gray-700 dark:text-gray-300">
                Type "RESET SYSTEM" to confirm (case sensitive):
              </Label>
              <Input
                id="reset-confirmation"
                value={resetConfirmation}
                onChange={(e) => setResetConfirmation(e.target.value)}
                placeholder="RESET SYSTEM"
                className="border-red-300 dark:border-red-700 focus:border-red-500 dark:focus:border-red-500 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>

            <Button
              onClick={handleSystemReset}
              disabled={isResetting || resetConfirmation !== "RESET SYSTEM"}
              className="w-full bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
            >
              {isResetting ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  Resetting System...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Reset Entire System
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
