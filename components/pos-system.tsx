"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { MenuView } from "./menu-view"
import { OrderPanel } from "./order-panel"
import { OrderListView } from "./order-list-view"
import { HistoryView } from "./history-view"
import { SettingsView } from "./settings-view"
import type { MenuItem, OrderItem } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { usePOS } from "@/lib/pos-context"
import { useNotification } from "@/lib/notification-context"
import { BackOffice } from "./back-office/back-office"

export function POSSystem() {
  const { user } = useAuth()
  const { addOrder, calculateOrderTotal } = usePOS()
  const { showToast } = useNotification()
  const [activeView, setActiveView] = useState("menu")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  const addToOrder = (menuItem: MenuItem) => {
    const existingItem = orderItems.find((item) => item.menuItem.id === menuItem.id)

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) => (item.menuItem.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        menuItem,
        quantity: 1,
      }
      setOrderItems([...orderItems, newItem])
    }
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      setOrderItems(orderItems.filter((item) => item.id !== itemId))
    } else {
      setOrderItems(orderItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
    }
  }

  const removeItem = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId))
  }

  const handlePrint = () => {
    // Print functionality would be implemented here
  }

  const handleFire = () => {
    if (orderItems.length === 0) return

    // Create order and send to kitchen with current tax settings
    const orderTotals = calculateOrderTotal(orderItems)
    const newOrder = {
      customerName: `Customer #${Date.now().toString().slice(-4)}`,
      items: orderItems,
      subtotal: orderTotals.subtotal,
      tax: orderTotals.tax,
      serviceCharge: orderTotals.serviceCharge,
      discount: orderTotals.discount,
      total: orderTotals.total,
    }

    addOrder(newOrder)
    setOrderItems([]) // Clear current order
  }

  const handleCharge = () => {
    if (orderItems.length === 0) return

    // Create order and process payment with current tax settings
    const orderTotals = calculateOrderTotal(orderItems)
    const newOrder = {
      customerName: `Customer #${Date.now().toString().slice(-4)}`,
      items: orderItems,
      subtotal: orderTotals.subtotal,
      tax: orderTotals.tax,
      serviceCharge: orderTotals.serviceCharge,
      discount: orderTotals.discount,
      total: orderTotals.total,
    }

    addOrder(newOrder)
    setOrderItems([]) // Clear current order
  }

  const renderView = () => {
    switch (activeView) {
      case "menu":
        return <MenuView onAddToOrder={addToOrder} />
      case "orders":
        return <OrderListView />
      case "history":
        return <HistoryView />
      case "bills":
        return (
          <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-screen transition-colors">
            <div className="flex-shrink-0 p-6 pb-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Bills & Invoices</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage billing and invoicing</p>
            </div>
          </div>
        )
      case "settings":
        return <SettingsView />
      case "help":
        return (
          <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-screen transition-colors">
            <div className="flex-shrink-0 p-6 pb-4">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Help Center</h1>
              <p className="text-gray-600 dark:text-gray-400">Get help and support</p>
            </div>
          </div>
        )
      case "backoffice":
        return <BackOffice />
      default:
        return <MenuView onAddToOrder={addToOrder} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden transition-colors">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <div className="flex flex-1 min-w-0">
        {renderView()}

        {(activeView === "menu" || user?.role === "cashier") && (
          <OrderPanel
            orderItems={orderItems}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onPrint={handlePrint}
            onFire={handleFire}
            onCharge={handleCharge}
          />
        )}
      </div>
    </div>
  )
}
