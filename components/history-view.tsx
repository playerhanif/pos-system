"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, DollarSign, ShoppingBag, Search, Trash2 } from "lucide-react"
import { usePOS } from "@/lib/pos-context"
import { useNotification } from "@/lib/notification-context"
import type { Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"

export function HistoryView() {
  const { getCompletedOrders, lastOrderUpdate, clearOrderHistory } = usePOS()
  const { showConfirmation, showToast } = useNotification()
  const [completedOrders, setCompletedOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Real-time updates for completed orders
  useEffect(() => {
    const refreshOrders = () => {
      const orders = getCompletedOrders()
      setCompletedOrders(orders)
    }

    refreshOrders() // Initial load

    // Auto-refresh every 5 seconds
    const interval = setInterval(refreshOrders, 5000)

    return () => clearInterval(interval)
  }, [getCompletedOrders, lastOrderUpdate])

  const filteredOrders = completedOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleClearHistory = () => {
    showConfirmation(
      "⚠️ Clear Order History",
      "Are you sure you want to clear the order history display?\n\nThis will:\n• Remove completed orders from the History view\n• Keep all sales data intact for reports\n• Not affect Back Office analytics\n\nNote: This only clears the history display, not the underlying sales data.",
      () => {
        clearOrderHistory()
        showToast({
          type: "success",
          title: "History Cleared",
          message: "Order history display has been cleared. Sales data remains intact for reports.",
        })
      },
      "warning",
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-screen overflow-container transition-colors">
      <div className="flex-shrink-0 p-4 lg:p-6 pb-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Order History</h1>
            <p className="text-gray-600 dark:text-gray-400">View completed orders and transactions</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search completed orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleClearHistory}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-gray-600 bg-transparent"
              disabled={filteredOrders.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          {filteredOrders.length} completed orders
        </div>
      </div>

      <div className="flex-1 scrollable-content px-4 lg:px-6 pb-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Completed Orders</h3>
            <p className="text-gray-500 dark:text-gray-500">Completed orders will appear here</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="hover:shadow-md transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-xl"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-gray-800 dark:text-gray-200">{order.id}</CardTitle>
                      <p className="text-gray-600 dark:text-gray-400">{order.customerName}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      Completed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Items:</h4>
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.quantity}× {item.menuItem.name}
                          </span>
                          <span className="text-gray-800 dark:text-gray-200">
                            {formatCurrency(item.quantity * item.menuItem.price)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t dark:border-gray-600 pt-3 space-y-1 text-sm">
                      <div className="flex justify-between text-gray-700 dark:text-gray-300">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(order.subtotal)}</span>
                      </div>
                      {order.tax > 0 && (
                        <div className="flex justify-between text-gray-700 dark:text-gray-300">
                          <span>Tax:</span>
                          <span>{formatCurrency(order.tax)}</span>
                        </div>
                      )}
                      {order.serviceCharge > 0 && (
                        <div className="flex justify-between text-gray-700 dark:text-gray-300">
                          <span>Service Charge:</span>
                          <span>{formatCurrency(order.serviceCharge)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold border-t dark:border-gray-600 pt-1 text-gray-800 dark:text-gray-200">
                        <span>Total:</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="grid grid-cols-3 gap-4 text-sm border-t dark:border-gray-600 pt-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{order.createdAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{order.items.length} items</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
