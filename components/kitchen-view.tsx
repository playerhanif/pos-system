"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePOS } from "@/lib/pos-context"
import { useAuth } from "@/lib/auth-context"
import { useNotification } from "@/lib/notification-context"
import { Clock, ChefHat, CheckCircle, PlayCircle, LogOut } from "lucide-react"
import type { Order } from "@/lib/types"

export function KitchenView() {
  const { getKitchenOrders, updateOrderStatus, categories, lastOrderUpdate, restaurantSettings } = usePOS()
  const { logout, user } = useAuth()
  const { showToast } = useNotification()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Real-time order updates
  useEffect(() => {
    const refreshOrders = () => {
      try {
        const kitchenOrders = getKitchenOrders()
        setOrders(kitchenOrders)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading kitchen orders:", error)
        setOrders([])
        setIsLoading(false)
      }
    }

    refreshOrders() // Initial load

    // Auto-refresh every 3 seconds
    const interval = setInterval(refreshOrders, 3000)

    return () => clearInterval(interval)
  }, [getKitchenOrders, lastOrderUpdate])

  const handleStatusUpdate = (orderId: string, newStatus: Order["status"]) => {
    try {
      updateOrderStatus(orderId, newStatus)
      const statusMessages = {
        preparing: "Order is now being prepared",
        ready: "Order is ready for pickup",
        completed: "Order has been completed",
      }
      showToast({
        type: "success",
        title: "Status Updated",
        message: statusMessages[newStatus] || "Order status updated",
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      showToast({
        type: "error",
        title: "Update Failed",
        message: "Failed to update order status",
      })
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">Q</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading Kitchen Display...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
      case "preparing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
      case "ready":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
    }
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "preparing":
        return <ChefHat className="h-4 w-4" />
      case "ready":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : categoryId
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getTimeElapsed = (date: Date) => {
    const now = new Date()
    const orderTime = new Date(date)
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60))
    return diffMinutes
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">Q</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Kitchen Display</h1>
              <p className="text-gray-600 dark:text-gray-400">{restaurantSettings.name} Restaurant</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-medium text-gray-800 dark:text-gray-200">{user?.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Kitchen Staff</p>
            </div>
            <Button
              variant="outline"
              onClick={logout}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 dark:border-gray-600 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="p-6 overflow-container">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Active Orders ({orders.length})</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Live Updates
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Active Orders</h3>
            <p className="text-gray-500 dark:text-gray-500">New orders will appear here automatically</p>
          </div>
        ) : (
          <div className="responsive-grid grid gap-6">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:border-gray-700"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-gray-800 dark:text-gray-200">{order.id}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{formatTime(order.createdAt)}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          ({getTimeElapsed(order.createdAt)}m ago)
                        </span>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-800 dark:text-gray-200">
                              {item.menuItem.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {getCategoryName(item.menuItem.category)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                              ×{item.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                      {order.status === "pending" && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, "preparing")}
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                          size="sm"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Start Cooking
                        </Button>
                      )}
                      {order.status === "preparing" && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, "ready")}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Ready
                        </Button>
                      )}
                      {order.status === "ready" && (
                        <Button
                          onClick={() => handleStatusUpdate(order.id, "completed")}
                          className="w-full bg-gray-500 hover:bg-gray-600 text-white"
                          size="sm"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Order
                        </Button>
                      )}
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
