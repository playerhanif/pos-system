"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { usePOS } from "@/lib/pos-context"

export function TaxDiscountSettings() {
  const { taxSettings, discountTypes, updateTaxSettings, addDiscountType, updateDiscountType, deleteDiscountType } =
    usePOS()

  const handleSaveSettings = () => {
    alert("Settings saved successfully!")
  }

  const handleAddDiscount = () => {
    addDiscountType({
      name: "New Discount",
      percentage: 0,
      active: true,
    })
  }

  const handleUpdateDiscount = (id: string, field: string, value: any) => {
    updateDiscountType(id, { [field]: value })
  }

  const handleDeleteDiscount = (id: string) => {
    if (confirm("Are you sure you want to delete this discount?")) {
      deleteDiscountType(id)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Tax & Discount Settings</h2>
        <p className="text-gray-600">Configure tax rates, service charges, and discount options</p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {/* Tax Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Tax Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  step="0.1"
                  value={taxSettings.taxRate}
                  onChange={(e) => updateTaxSettings({ taxRate: Number.parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-charge">Service Charge (%)</Label>
                <Input
                  id="service-charge"
                  type="number"
                  step="0.1"
                  value={taxSettings.serviceChargeRate}
                  onChange={(e) => updateTaxSettings({ serviceChargeRate: Number.parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-apply tax to all orders</Label>
                  <p className="text-sm text-gray-600">Automatically calculate and add tax to orders</p>
                </div>
                <Switch
                  checked={taxSettings.autoApplyTax}
                  onCheckedChange={(checked) => updateTaxSettings({ autoApplyTax: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-apply service charge</Label>
                  <p className="text-sm text-gray-600">Automatically add service charge to orders</p>
                </div>
                <Switch
                  checked={taxSettings.autoApplyServiceCharge}
                  onCheckedChange={(checked) => updateTaxSettings({ autoApplyServiceCharge: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discount Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Discount Types</CardTitle>
            <Button onClick={handleAddDiscount} className="bg-green-500 hover:bg-green-600">
              Add Discount
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {discountTypes.map((discount) => (
                <div key={discount.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <Input
                      value={discount.name}
                      onChange={(e) => handleUpdateDiscount(discount.id, "name", e.target.value)}
                      placeholder="Discount name"
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={discount.percentage}
                      onChange={(e) =>
                        handleUpdateDiscount(discount.id, "percentage", Number.parseFloat(e.target.value))
                      }
                      placeholder="0"
                    />
                  </div>
                  <span className="text-sm text-gray-500">%</span>
                  <Switch
                    checked={discount.active}
                    onCheckedChange={(checked) => handleUpdateDiscount(discount.id, "active", checked)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteDiscount(discount.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="bg-green-500 hover:bg-green-600">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
