"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CardContent, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Printer, Flame, CreditCard, ChevronLeft, ChevronRight, X } from "lucide-react"
import { usePOS } from "@/lib/pos-context"
import { useNotification } from "@/lib/notification-context"
import { getThermalPrinter, updatePrinterSettings } from "@/lib/thermal-printer"
import type { OrderItem } from "@/lib/types"
import { formatCurrency } from "@/lib/currency"

interface OrderPanelProps {
  orderItems: OrderItem[]
  onUpdateQuantity: (itemId: string, quantity: number) => void
  onRemoveItem: (itemId: string) => void
  onPrint: () => void
  onFire: () => void
  onCharge: () => void
}

export function OrderPanel({ orderItems, onUpdateQuantity, onRemoveItem, onPrint, onFire, onCharge }: OrderPanelProps) {
  const { calculateOrderTotal, restaurantSettings } = usePOS()
  const { showToast, showNotification } = useNotification()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const { subtotal, tax, serviceCharge, discount, total } = calculateOrderTotal(orderItems)

  // Update printer settings when restaurant settings change
  useEffect(() => {
    updatePrinterSettings(restaurantSettings.name, restaurantSettings.address, restaurantSettings.phone)
  }, [restaurantSettings])

  const handlePrint = async () => {
    if (orderItems.length === 0) {
      showToast({
        type: "warning",
        title: "No Items",
        message: "Please add items to the order before printing receipt",
      })
      return
    }

    setIsPrinting(true)

    try {
      const printer = getThermalPrinter()
      const orderId = `ORD-${Date.now().toString().slice(-6)}`
      const customerName = `Customer #${Date.now().toString().slice(-4)}`

      const success = await printer.printOrderReceipt(
        orderItems,
        { subtotal, tax, serviceCharge, discount, total },
        orderId,
        customerName,
      )

      if (success) {
        showToast({
          type: "success",
          title: "Receipt Printed",
          message: "Receipt has been sent to thermal printer successfully",
        })
      } else {
        showNotification({
          type: "info",
          title: "Print Dialog Opened",
          message: "Thermal printer not available. Receipt opened in system print dialog as fallback.",
        })
      }

      onPrint() // Call parent handler
    } catch (error) {
      console.error("Print error:", error)
      showNotification({
        type: "error",
        title: "Print Failed",
        message: "Failed to print receipt. Please check printer connection and try again.",
      })
    } finally {
      setIsPrinting(false)
    }
  }

  const handleFire = async () => {
    if (orderItems.length === 0) {
      showToast({
        type: "warning",
        title: "No Items",
        message: "Please add items to the order before sending to kitchen",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      onFire()
      showToast({
        type: "success",
        title: "Order Sent",
        message: "Order has been sent to kitchen for preparation",
      })
    } catch (error) {
      showNotification({
        type: "error",
        title: "Failed to Send Order",
        message: "Could not send order to kitchen. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCharge = async () => {
    if (orderItems.length === 0) {
      showToast({
        type: "warning",
        title: "No Items",
        message: "Please add items to the order before processing payment",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Print receipt automatically after successful charge
      const printer = getThermalPrinter()
      const orderId = `ORD-${Date.now().toString().slice(-6)}`
      const customerName = `Customer #${Date.now().toString().slice(-4)}`

      // Print receipt
      await printer.printOrderReceipt(
        orderItems,
        { subtotal, tax, serviceCharge, discount, total },
        orderId,
        customerName,
      )

      onCharge()
      showToast({
        type: "success",
        title: "Payment Processed",
        message: `Payment of ${formatCurrency(total)} processed successfully. Receipt printed.`,
      })
    } catch (error) {
      showNotification({
        type: "error",
        title: "Payment Failed",
        message: "Payment processing failed. Please try again.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-80"
      } bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col h-screen transition-all duration-300 ease-in-out`}
    >
      {/* Collapsible Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!isCollapsed && <CardTitle className="text-lg text-gray-800 dark:text-gray-200">Order Summary</CardTitle>}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          title={isCollapsed ? "Expand Order Panel" : "Collapse Order Panel"}
        >
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Collapsed State */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center justify-center p-2 space-y-4">
          <div className="text-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-2">
              <span className="text-white text-sm font-bold">{orderItems.length}</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Items</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(total)}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          {orderItems.length > 0 && (
            <div className="space-y-2 w-full">
              <Button
                size="sm"
                onClick={handleFire}
                disabled={isProcessing}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white p-2"
                title="Send to Kitchen"
              >
                <Flame className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleCharge}
                disabled={isProcessing}
                className="w-full bg-green-500 hover:bg-green-600 text-white p-2"
                title={`Charge ${formatCurrency(total)}`}
              >
                <CreditCard className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Expanded State */}
      {!isCollapsed && (
        <>
          <CardContent className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {orderItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No items in order</p>
                    <p className="text-sm">Add items from the menu</p>
                  </div>
                ) : (
                  orderItems.map((item) => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 flex-1 pr-2">
                              {item.menuItem.name}
                            </h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onRemoveItem(item.id)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <p className="text-green-600 dark:text-green-400 font-semibold text-sm">
                            {formatCurrency(item.menuItem.price)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="h-6 w-6 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center text-gray-800 dark:text-gray-200">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {formatCurrency(item.quantity * item.menuItem.price)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {orderItems.length > 0 && (
                <>
                  <Separator className="dark:border-gray-600" />

                  {/* Order Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>Sub Total</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>Service Charge</span>
                      <span>{formatCurrency(serviceCharge)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>Tax</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <Separator className="dark:border-gray-600" />
                    <div className="flex justify-between font-semibold text-gray-800 dark:text-gray-200">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>

          {/* Action Buttons */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                disabled={orderItems.length === 0 || isPrinting}
                className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
              >
                <Printer className="h-4 w-4 mr-1" />
                {isPrinting ? "Printing..." : "Print"}
              </Button>
              <Button
                size="sm"
                onClick={handleFire}
                disabled={orderItems.length === 0 || isProcessing}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Flame className="h-4 w-4 mr-1" />
                {isProcessing ? "Sending..." : "Fire"}
              </Button>
            </div>
            <Button
              onClick={handleCharge}
              disabled={orderItems.length === 0 || isProcessing}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : `Charge ${formatCurrency(total)}`}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
