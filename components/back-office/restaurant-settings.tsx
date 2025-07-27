"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { usePOS } from "@/lib/pos-context"
import { useNotification } from "@/lib/notification-context"
import { SUPPORTED_CURRENCIES, CurrencyService, formatCurrency } from "@/lib/currency"
import { Save, Building, Mail, Phone, Globe, DollarSign } from "lucide-react"

export function RestaurantSettings() {
  const { restaurantSettings, updateRestaurantSettings } = usePOS()
  const { showToast } = useNotification()
  const [formData, setFormData] = useState(restaurantSettings)
  const [selectedCurrency, setSelectedCurrency] = useState(CurrencyService.getInstance().getCurrencyCode())
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setFormData(restaurantSettings)
  }, [restaurantSettings])

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Update restaurant settings
      updateRestaurantSettings(formData)

      // Update currency
      CurrencyService.getInstance().setCurrency(selectedCurrency)

      showToast({
        type: "success",
        title: "Settings Saved",
        message:
          "Restaurant settings and currency have been updated successfully. Changes will appear throughout the system.",
      })
    } catch (error) {
      showToast({
        type: "error",
        title: "Save Failed",
        message: "Failed to save restaurant settings. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const currentCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrency)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Restaurant Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Configure your restaurant information and currency. Changes will update throughout the entire system.
        </p>
      </div>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
            <Building className="h-5 w-5" />
            <span>Restaurant Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="restaurant-name" className="text-gray-700 dark:text-gray-300">
                Restaurant Name *
              </Label>
              <Input
                id="restaurant-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter restaurant name"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This will appear on login screen, headers, and reports
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="restaurant@example.com"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Phone className="h-4 w-4" />
                <span>Phone Number</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-gray-700 dark:text-gray-300 flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>Website</span>
              </Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="www.restaurant.com"
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">
              Address
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main Street, City, State, ZIP"
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Currency Configuration */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
            <DollarSign className="h-5 w-5" />
            <span>Currency Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-gray-700 dark:text-gray-300">
                Primary Currency *
              </Label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-lg">{currency.symbol}</span>
                        <span>
                          {currency.name} ({currency.code})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This currency will be used throughout the system
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Currency Preview</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sample Item:</span>
                    <span className="font-semibold">{formatCurrency(12.99)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (8.5%):</span>
                    <span>{formatCurrency(1.1)}</span>
                  </div>
                  <div className="border-t dark:border-gray-600 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>{formatCurrency(14.09)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {currentCurrency && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Symbol: {currentCurrency.symbol} • Position: {currentCurrency.position} • Decimals:{" "}
                  {currentCurrency.decimals}
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Currency Change Impact</h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">Changing the currency will affect:</p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
              <li>All menu item prices and order totals</li>
              <li>Receipt formatting and printed receipts</li>
              <li>Sales reports and analytics</li>
              <li>Order history and transaction records</li>
            </ul>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2 font-medium">
              Note: Existing order data will display in the new currency format.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving || !formData.name} className="bg-green-500 hover:bg-green-600">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
