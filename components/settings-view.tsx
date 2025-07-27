"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePOS } from "@/lib/pos-context"
import { useTheme } from "@/lib/theme-context"
import { Moon, Sun, Monitor, Save, RotateCcw } from "lucide-react"

export function SettingsView() {
  const { discountTypes } = usePOS()
  const { theme, setTheme } = useTheme()

  // Local state for form inputs
  const [formData, setFormData] = useState({
    autoPrintReceipts: true,
    soundNotifications: true,
    layoutDensity: "comfortable",
    printerWidth: "80mm" as "58mm" | "80mm",
    printKitchenCopy: false,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  const handleSave = async () => {
    setIsSaving(true)

    // Save settings to localStorage
    localStorage.setItem("pos-general-settings", JSON.stringify(formData))

    // Show success message
    setSaveMessage("Settings saved successfully!")
    setTimeout(() => setSaveMessage(""), 3000)
    setIsSaving(false)
  }

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to default values?")) {
      setFormData({
        autoPrintReceipts: true,
        soundNotifications: true,
        layoutDensity: "comfortable",
        printerWidth: "80mm",
        printKitchenCopy: false,
      })

      // Reset theme
      setTheme("light")

      setSaveMessage("Settings reset to defaults!")
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

  // Load saved settings on mount
  useEffect(() => {
    const saved = localStorage.getItem("pos-general-settings")
    if (saved) {
      try {
        const settings = JSON.parse(saved)
        setFormData((prev) => ({ ...prev, ...settings }))
      } catch (error) {
        console.warn("Error loading settings:", error)
      }
    }
  }, [])

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-screen">
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Configure your POS system preferences</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-green-500 hover:bg-green-600">
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
        {saveMessage && (
          <div className="mt-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 p-2 rounded-md">
            {saveMessage}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid gap-6 max-w-4xl">
          {/* System Preferences */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-gray-200">System Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="dark:text-gray-300">Auto-print receipts</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Automatically print receipts after payment</p>
                </div>
                <Switch
                  checked={formData.autoPrintReceipts}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoPrintReceipts: checked })}
                />
              </div>
              <Separator className="dark:border-gray-600" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="dark:text-gray-300">Sound notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Play sounds for new orders</p>
                </div>
                <Switch
                  checked={formData.soundNotifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, soundNotifications: checked })}
                />
              </div>
              <Separator className="dark:border-gray-600" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="dark:text-gray-300">Layout Density</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose interface density</p>
                </div>
                <Select
                  value={formData.layoutDensity}
                  onValueChange={(value) => setFormData({ ...formData, layoutDensity: value })}
                >
                  <SelectTrigger className="w-40 dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Printer Configuration */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-gray-200">Printer Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="dark:text-gray-300">Paper Width</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Select thermal printer paper width</p>
                </div>
                <Select
                  value={formData.printerWidth}
                  onValueChange={(value: "58mm" | "80mm") => setFormData({ ...formData, printerWidth: value })}
                >
                  <SelectTrigger className="w-32 dark:bg-gray-700 dark:border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="58mm">58mm</SelectItem>
                    <SelectItem value="80mm">80mm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator className="dark:border-gray-600" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="dark:text-gray-300">Print kitchen copy</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Print additional copy for kitchen</p>
                </div>
                <Switch
                  checked={formData.printKitchenCopy}
                  onCheckedChange={(checked) => setFormData({ ...formData, printKitchenCopy: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme & Appearance */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-gray-200">Theme & Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="dark:text-gray-300">Theme</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    className={theme === "light" ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    className={theme === "dark" ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                    className={theme === "system" ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Discounts */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-gray-200">Active Discounts</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage discount types in Back Office → Tax & Discounts
              </p>
            </CardHeader>
            <CardContent>
              {discountTypes.filter((d) => d.active).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No active discounts configured</p>
              ) : (
                <div className="space-y-2">
                  {discountTypes
                    .filter((d) => d.active)
                    .map((discount) => (
                      <div
                        key={discount.id}
                        className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <span className="font-medium dark:text-gray-200">{discount.name}</span>
                        <span className="text-green-600 dark:text-green-400 font-semibold">
                          {discount.percentage}% OFF
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Access */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-gray-200">Quick Access</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">Access additional configuration options</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Restaurant & Currency</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Configure restaurant information and currency settings
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">Available in Back Office → Restaurant</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Tax & Pricing</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Manage tax rates, service charges, and discount types
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Available in Back Office → Tax & Discounts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
