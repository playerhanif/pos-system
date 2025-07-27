"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { usePOS } from "@/lib/pos-context"
import { useNotification } from "@/lib/notification-context"
import { getThermalPrinter } from "@/lib/thermal-printer"
import { Printer, TestTube, Settings, Wifi } from "lucide-react"

export function PrinterSettings() {
  const { restaurantSettings } = usePOS()
  const { showToast, showNotification } = useNotification()
  const [printerWidth, setPrinterWidth] = useState<"58" | "80">("80")
  const [autoPrint, setAutoPrint] = useState(true)
  const [printKitchenCopy, setPrintKitchenCopy] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const handleTestPrint = async () => {
    setIsTesting(true)

    try {
      const printer = getThermalPrinter()

      // Create test order items
      const testItems = [
        {
          id: "test1",
          menuItem: {
            id: "1",
            name: "Test Pizza",
            price: 12.99,
            category: "food",
            image: "",
          },
          quantity: 2,
        },
        {
          id: "test2",
          menuItem: {
            id: "2",
            name: "Test Drink",
            price: 3.5,
            category: "beverages",
            image: "",
          },
          quantity: 1,
        },
      ]

      const testTotals = {
        subtotal: 29.48,
        tax: 2.36,
        serviceCharge: 0,
        discount: 0,
        total: 31.84,
      }

      const success = await printer.printOrderReceipt(testItems, testTotals, "TEST-001", "Test Customer")

      if (success) {
        showToast({
          type: "success",
          title: "Test Print Successful",
          message: "Test receipt has been sent to the thermal printer",
        })
      } else {
        showNotification({
          type: "info",
          title: "Test Print Opened",
          message: "Test receipt opened in system print dialog. Check if the format looks correct.",
        })
      }
    } catch (error) {
      showNotification({
        type: "error",
        title: "Test Print Failed",
        message: "Could not print test receipt. Please check printer connection.",
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleConnectPrinter = async () => {
    try {
      if (!("serial" in navigator)) {
        showNotification({
          type: "error",
          title: "Not Supported",
          message: "Web Serial API is not supported in this browser. Please use Chrome, Edge, or Opera.",
        })
        return
      }

      // Request port access
      const port = await (navigator as any).serial.requestPort()
      await port.open({ baudRate: 9600 })
      await port.close()

      showToast({
        type: "success",
        title: "Printer Connected",
        message: "Thermal printer has been connected successfully",
      })
    } catch (error) {
      showNotification({
        type: "error",
        title: "Connection Failed",
        message: "Could not connect to thermal printer. Please check the connection and try again.",
      })
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Printer Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure thermal printer settings and test printing</p>
      </div>

      {/* Printer Configuration */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
            <Printer className="h-5 w-5" />
            <span>Thermal Printer Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Paper Width</Label>
              <Select value={printerWidth} onValueChange={(value: "58" | "80") => setPrinterWidth(value)}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                  <SelectItem value="58">58mm (32 characters)</SelectItem>
                  <SelectItem value="80">80mm (48 characters)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 dark:text-gray-400">Select your thermal printer's paper width</p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleConnectPrinter}
                variant="outline"
                className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
              >
                <Wifi className="h-4 w-4 mr-2" />
                Connect Thermal Printer
              </Button>
              <Button onClick={handleTestPrint} disabled={isTesting} className="w-full bg-green-500 hover:bg-green-600">
                <TestTube className="h-4 w-4 mr-2" />
                {isTesting ? "Printing Test..." : "Test Print"}
              </Button>
            </div>
          </div>

          <Separator className="dark:border-gray-600" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-700 dark:text-gray-300">Auto-print receipts after payment</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically print receipt when charge button is pressed
                </p>
              </div>
              <Switch checked={autoPrint} onCheckedChange={setAutoPrint} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-700 dark:text-gray-300">Print kitchen copy</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Print an additional copy for kitchen when order is fired
                </p>
              </div>
              <Switch checked={printKitchenCopy} onCheckedChange={setPrintKitchenCopy} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Preview */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-800 dark:text-gray-200">Receipt Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white dark:bg-gray-900 p-4 rounded border font-mono text-xs leading-tight max-w-sm">
            <div className="text-center space-y-1">
              <div className="font-bold">{restaurantSettings.name.toUpperCase()}</div>
              {restaurantSettings.address && <div>{restaurantSettings.address}</div>}
              {restaurantSettings.phone && <div>{restaurantSettings.phone}</div>}
            </div>
            <div className="border-t border-dashed my-2"></div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Order:</span>
                <span>ORD-123456</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="border-t border-dashed my-2"></div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>2x Super Pizza</span>
                <span>$25.98</span>
              </div>
              <div className="flex justify-between">
                <span>1x Soft Drink</span>
                <span>$3.50</span>
              </div>
            </div>
            <div className="border-t border-dashed my-2"></div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>$29.48</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>$2.36</span>
              </div>
              <div className="border-t border-dashed"></div>
              <div className="flex justify-between font-bold">
                <span>TOTAL:</span>
                <span>$31.84</span>
              </div>
            </div>
            <div className="border-t border-dashed my-2"></div>
            <div className="text-center space-y-1">
              <div>Thank you for your visit!</div>
              <div>Please come again</div>
              <div className="mt-2">Powered by QPOS</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Browser Compatibility */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
            <Settings className="h-5 w-5" />
            <span>Browser Compatibility</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">Thermal Printer Support</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                Direct thermal printer connection requires Web Serial API support:
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
                <li>✅ Chrome 89+ (Recommended)</li>
                <li>✅ Microsoft Edge 89+</li>
                <li>✅ Opera 75+</li>
                <li>❌ Firefox (Fallback to system print dialog)</li>
                <li>❌ Safari (Fallback to system print dialog)</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Fallback Printing</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                When thermal printer is not available, the system will automatically open a formatted receipt in the
                system print dialog for printing to any connected printer.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
