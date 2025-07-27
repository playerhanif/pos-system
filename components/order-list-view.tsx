"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePOS } from "@/lib/pos-context"
import { useNotification } from "@/lib/notification-context"
import type { Order } from "@/lib/types"
import { Search, Eye, CheckCircle, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { formatCurrency } from "@/lib/currency"

export function OrderListView() {
  const { getAllOrders, updateOrderStatus, lastOrderUpdate } = usePOS()
  const { showConfirmation, showToast } = useNotification()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Real-time order updates
  useEffect(() => {
    const refreshOrders = () => {
      const allOrders = getAllOrders()

      // Sort orders based on sortOrder
      const sortedOrders = [...allOrders].sort((a, b) => {
        const timeA = a.createdAt.getTime()
        const timeB = b.createdAt.getTime()
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA
      })

      setOrders(sortedOrders)
    }

    refreshOrders() // Initial load

    // Auto-refresh every 3 seconds
    const interval = setInterval(refreshOrders, 3000)

    return () => clearInterval(interval)
  }, [getAllOrders, lastOrderUpdate, sortOrder])

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "preparing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "ready":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsViewDialogOpen(true)
  }

  const handleCompleteOrder = (orderId: string) => {
    showConfirmation(
      "Complete Order",
      "Mark this order as completed? This action will move the order to history.",
      () => {
        updateOrderStatus(orderId, "completed")
        showToast({
          type: "success",
          title: "Order Completed",
          message: "Order has been marked as completed and moved to history.",
        })
      },
    )
  }

  const handleDeleteOrder = (orderId: string) => {
    showConfirmation(
      "Delete Order",
      "Are you sure you want to delete this order? This action cannot be undone and will permanently remove the order from the system.",
      () => {
        // Note: We'd need to add a deleteOrder function to the context
        // For now, we'll show a notification that this would be implemented
        showToast({
          type: "info",
          title: "Feature Coming Soon",
          message: "Order deletion functionality will be implemented in a future update.",
        })
      },
      "error",
    )
  }

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-screen overflow-container transition-colors">
      <div className="flex-shrink-0 p-4 lg:p-6 pb-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Order Management</h1>
            <p className="text-gray-600 dark:text-gray-400">View and manage all orders</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              variant="outline"
              onClick={toggleSortOrder}
              className="flex items-center space-x-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent"
            >
              {sortOrder === "asc" ? (
                <>
                  <ArrowUp className="h-4 w-4" />
                  <span>Oldest First</span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4" />
                  <span>Newest First</span>
                </>
              )}
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          Live Updates - {filteredOrders.length} orders
        </div>
      </div>

      <div className="flex-1 scrollable-content px-4 lg:px-6 pb-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-800 dark:text-gray-200">Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No orders found</p>
                <p className="text-sm">Orders will appear here when placed from the POS</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Order ID</TableHead>
                    <TableHead className="dark:text-gray-300">Customer</TableHead>
                    <TableHead className="dark:text-gray-300">Items</TableHead>
                    <TableHead className="dark:text-gray-300">Total Amount</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                    <TableHead className="dark:text-gray-300">Date/Time</TableHead>
                    <TableHead className="dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="dark:border-gray-700">
                      <TableCell className="font-medium text-gray-800 dark:text-gray-200">{order.id}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-300">{order.customerName}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="text-sm text-gray-700 dark:text-gray-300">
                              {item.quantity}× {item.menuItem.name}
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              +{order.items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-800 dark:text-gray-200">{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-gray-700 dark:text-gray-300">{order.createdAt.toLocaleDateString()}</div>
                          <div className="text-gray-500 dark:text-gray-400">{order.createdAt.toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewOrder(order)}
                            title="View Order Details"
                            className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status !== "completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCompleteOrder(order.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 dark:border-gray-600 dark:hover:bg-gray-700"
                              title="Mark as Completed"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 dark:border-gray-600 dark:hover:bg-gray-700"
                            title="Delete Order"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-gray-200">Order Details - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Customer</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Status</h4>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Order Date</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.createdAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Order Time</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.createdAt.toLocaleTimeString()}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{item.menuItem.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">×{item.quantity}</span>
                      </div>
                      <span className="text-gray-800 dark:text-gray-200">
                        {formatCurrency(item.quantity * item.menuItem.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t dark:border-gray-600 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Tax:</span>
                      <span>{formatCurrency(selectedOrder.tax)}</span>
                    </div>
                  )}
                  {selectedOrder.serviceCharge > 0 && (
                    <div className="flex justify-between text-gray-700 dark:text-gray-300">
                      <span>Service Charge:</span>
                      <span>{formatCurrency(selectedOrder.serviceCharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-lg border-t dark:border-gray-600 pt-2 text-gray-800 dark:text-gray-200">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
