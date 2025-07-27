"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { MenuItem, Category, Order, OrderItem } from "./types"
import type { User } from "./auth-context"
import { updatePrinterSettings } from "@/lib/thermal-printer"

interface TaxSettings {
  taxRate: number
  serviceChargeRate: number
  autoApplyTax: boolean
  autoApplyServiceCharge: boolean
}

interface DiscountType {
  id: string
  name: string
  percentage: number
  active: boolean
}

interface RestaurantSettings {
  name: string
  address: string
  phone: string
  email: string
  website: string
}

interface POSContextType {
  // Restaurant Settings
  restaurantSettings: RestaurantSettings
  updateRestaurantSettings: (settings: Partial<RestaurantSettings>) => void

  // Menu & Categories
  menuItems: MenuItem[]
  categories: Category[]
  addMenuItem: (item: Omit<MenuItem, "id">) => void
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void
  deleteMenuItem: (id: string) => void
  addCategory: (category: Omit<Category, "id">) => void
  updateCategory: (id: string, category: Partial<Category>) => void
  deleteCategory: (id: string) => void
  reorderCategories: (categories: Category[]) => void

  // Tax & Discounts
  taxSettings: TaxSettings
  discountTypes: DiscountType[]
  updateTaxSettings: (settings: Partial<TaxSettings>) => void
  addDiscountType: (discount: Omit<DiscountType, "id">) => void
  updateDiscountType: (id: string, discount: Partial<DiscountType>) => void
  deleteDiscountType: (id: string) => void

  // Users & Password Management
  users: User[]
  addUser: (user: Omit<User, "id">) => void
  updateUser: (id: string, user: Partial<User>) => void
  deleteUser: (id: string) => void
  updateUserPassword: (userId: string, newPassword: string) => void
  resetUserPassword: (userId: string) => string

  // Orders - Enhanced for real-time sync
  orders: Order[]
  addOrder: (order: Omit<Order, "id">) => void
  updateOrderStatus: (id: string, status: Order["status"]) => void
  getKitchenOrders: () => Order[]
  getCompletedOrders: () => Order[]
  getAllOrders: () => Order[]
  getOrderById: (id: string) => Order | undefined
  clearOrderHistory: () => void

  // Real-time updates
  lastOrderUpdate: number
  refreshOrders: () => void

  // Analytics
  getTodayStats: () => {
    totalRevenue: number
    totalOrders: number
    averageOrder: number
    topItems: Array<{ name: string; quantity: number; revenue: number }>
  }

  // Calculations
  calculateOrderTotal: (items: OrderItem[]) => {
    subtotal: number
    tax: number
    serviceCharge: number
    discount: number
    total: number
  }
}

const POSContext = createContext<POSContextType | undefined>(undefined)

// Initial data
const initialRestaurantSettings: RestaurantSettings = {
  name: "DonerG",
  address: "123 Main Street, City, State",
  phone: "+1 (555) 123-4567",
  email: "info@donerg.com",
  website: "www.donerg.com",
}

const initialMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Super Delicious Pizza",
    price: 12.0,
    image: "/placeholder.svg?height=120&width=120&text=🍕",
    category: "pizzas",
    description: "Delicious pizza with fresh ingredients",
  },
  {
    id: "2",
    name: "Super Delicious Chicken",
    price: 15.0,
    image: "/placeholder.svg?height=120&width=120&text=🍗",
    category: "food",
    description: "Grilled chicken with herbs",
  },
  {
    id: "3",
    name: "Super Delicious Burger",
    price: 10.0,
    image: "/placeholder.svg?height=120&width=120&text=🍔",
    category: "food",
    description: "Juicy beef burger with fries",
  },
  {
    id: "4",
    name: "Super Delicious Chips",
    price: 6.0,
    image: "/placeholder.svg?height=120&width=120&text=🍟",
    category: "food",
    description: "Crispy golden fries",
  },
  {
    id: "5",
    name: "Cheese Selection",
    price: 12.0,
    image: "/placeholder.svg?height=120&width=120&text=🧀",
    category: "food",
    description: "Artisan cheese platter",
  },
  {
    id: "6",
    name: "Meat Balls",
    price: 12.0,
    image: "/placeholder.svg?height=120&width=120&text=🍖",
    category: "food",
    description: "Homemade meatballs in sauce",
  },
  {
    id: "7",
    name: "Almond Crusted Salmon",
    price: 21.0,
    image: "/placeholder.svg?height=120&width=120&text=🐟",
    category: "food",
    description: "Fresh salmon with almond crust",
  },
]

const initialCategories: Category[] = [
  { id: "bar", name: "Bar", icon: "🍺" },
  { id: "food", name: "Food", icon: "🍽️" },
  { id: "wine", name: "Wine", icon: "🍷" },
  { id: "coffee", name: "Coffee", icon: "☕" },
  { id: "pizzas", name: "Pizzas", icon: "🍕" },
  { id: "ice", name: "Ice", icon: "🧊" },
]

const initialUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "admin@donerg.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "cashier@donerg.com",
    role: "cashier",
  },
  {
    id: "3",
    name: "Mike Wilson",
    email: "kitchen@donerg.com",
    role: "kitchen",
  },
]

const initialTaxSettings: TaxSettings = {
  taxRate: 8.5,
  serviceChargeRate: 0,
  autoApplyTax: true,
  autoApplyServiceCharge: false,
}

const initialDiscountTypes: DiscountType[] = [
  { id: "1", name: "Senior Discount", percentage: 10, active: true },
  { id: "2", name: "Student Discount", percentage: 5, active: true },
  { id: "3", name: "Staff Discount", percentage: 15, active: true },
]

// Helper function to get data from localStorage with fallback
function getStoredData<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback

  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(fallback)) {
        return parsed.length >= 0 ? parsed : fallback
      }
      return parsed
    }
  } catch (error) {
    console.warn(`Error parsing ${key} from localStorage:`, error)
  }

  // Initialize localStorage with fallback data
  localStorage.setItem(key, JSON.stringify(fallback))
  return fallback
}

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [restaurantSettings, setRestaurantSettings] = useState<RestaurantSettings>(() =>
    getStoredData("pos-restaurant-settings", initialRestaurantSettings),
  )
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getStoredData("pos-menu-items", initialMenuItems))
  const [categories, setCategories] = useState<Category[]>(() => getStoredData("pos-categories", initialCategories))
  const [users, setUsers] = useState<User[]>(() => getStoredData("pos-users", initialUsers))
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(() =>
    getStoredData("pos-tax-settings", initialTaxSettings),
  )
  const [discountTypes, setDiscountTypes] = useState<DiscountType[]>(() =>
    getStoredData("pos-discount-types", initialDiscountTypes),
  )
  const [orders, setOrders] = useState<Order[]>(() => {
    const storedOrders = getStoredData("pos-orders", [])
    // Convert date strings back to Date objects
    return storedOrders.map((order: any) => ({
      ...order,
      createdAt: new Date(order.createdAt),
    }))
  })
  const [lastOrderUpdate, setLastOrderUpdate] = useState(Date.now())

  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem("pos-restaurant-settings", JSON.stringify(restaurantSettings))
  }, [restaurantSettings])

  useEffect(() => {
    localStorage.setItem("pos-menu-items", JSON.stringify(menuItems))
  }, [menuItems])

  useEffect(() => {
    localStorage.setItem("pos-categories", JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem("pos-users", JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem("pos-tax-settings", JSON.stringify(taxSettings))
  }, [taxSettings])

  useEffect(() => {
    localStorage.setItem("pos-discount-types", JSON.stringify(discountTypes))
  }, [discountTypes])

  useEffect(() => {
    // Serialize orders with proper date handling
    const ordersToStore = orders.map((order) => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
    }))
    localStorage.setItem("pos-orders", JSON.stringify(ordersToStore))
  }, [orders])

  // Restaurant Settings
  const updateRestaurantSettings = (settings: Partial<RestaurantSettings>) => {
    setRestaurantSettings((prev) => {
      const updated = { ...prev, ...settings }
      // Update printer settings when restaurant info changes
      updatePrinterSettings(updated.name, updated.address, updated.phone)
      return updated
    })
  }

  // Menu Items
  const addMenuItem = (item: Omit<MenuItem, "id">) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
    }
    setMenuItems((prev) => [...prev, newItem])
  }

  const updateMenuItem = (id: string, item: Partial<MenuItem>) => {
    setMenuItems((prev) => prev.map((existing) => (existing.id === id ? { ...existing, ...item } : existing)))
  }

  const deleteMenuItem = (id: string) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id))
  }

  // Categories
  const addCategory = (category: Omit<Category, "id">) => {
    const newCategory: Category = {
      ...category,
      id: category.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
    }
    setCategories((prev) => [...prev, newCategory])
  }

  const updateCategory = (id: string, category: Partial<Category>) => {
    setCategories((prev) => prev.map((existing) => (existing.id === id ? { ...existing, ...category } : existing)))
  }

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
    // Also remove menu items in this category or move them to 'food'
    setMenuItems((prev) => prev.map((item) => (item.category === id ? { ...item, category: "food" } : item)))
  }

  const reorderCategories = (newCategories: Category[]) => {
    setCategories(newCategories)
  }

  // Tax Settings
  const updateTaxSettings = (settings: Partial<TaxSettings>) => {
    setTaxSettings((prev) => ({ ...prev, ...settings }))
  }

  // Discount Types
  const addDiscountType = (discount: Omit<DiscountType, "id">) => {
    const newDiscount: DiscountType = {
      ...discount,
      id: Date.now().toString(),
    }
    setDiscountTypes((prev) => [...prev, newDiscount])
  }

  const updateDiscountType = (id: string, discount: Partial<DiscountType>) => {
    setDiscountTypes((prev) => prev.map((existing) => (existing.id === id ? { ...existing, ...discount } : existing)))
  }

  const deleteDiscountType = (id: string) => {
    setDiscountTypes((prev) => prev.filter((discount) => discount.id !== id))
  }

  // Users
  const addUser = (user: Omit<User, "id">) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
    }
    setUsers((prev) => [...prev, newUser])
  }

  const updateUser = (id: string, user: Partial<User>) => {
    setUsers((prev) => prev.map((existing) => (existing.id === id ? { ...existing, ...user } : existing)))

    // Update auth context if current user is being updated
    const currentUser = JSON.parse(localStorage.getItem("pos-current-user") || "{}")
    if (currentUser.id === id) {
      const updatedUser = { ...currentUser, ...user }
      localStorage.setItem("pos-current-user", JSON.stringify(updatedUser))
    }
  }

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  // Password Management
  const updateUserPassword = (userId: string, newPassword: string) => {
    // Store password securely (in a real app, this would be hashed)
    const passwords = JSON.parse(localStorage.getItem("pos-user-passwords") || "{}")
    passwords[userId] = newPassword
    localStorage.setItem("pos-user-passwords", JSON.stringify(passwords))
  }

  const resetUserPassword = (userId: string): string => {
    const defaultPassword = "password123"
    updateUserPassword(userId, defaultPassword)
    return defaultPassword
  }

  // Orders - Enhanced with real-time sync
  const addOrder = (order: Omit<Order, "id">) => {
    const today = new Date()
    const dateStr = today.toISOString().split("T")[0]

    // Get today's orders to determine next order number
    const todayOrders = orders.filter((o) => {
      const orderDate = new Date(o.createdAt).toISOString().split("T")[0]
      return orderDate === dateStr
    })

    const orderNumber = todayOrders.length + 1
    const newOrder: Order = {
      ...order,
      id: `ORD-${dateStr.replace(/-/g, "")}-${orderNumber.toString().padStart(3, "0")}`,
      status: "pending",
      createdAt: new Date(),
    }
    setOrders((prev) => [...prev, newOrder])
    setLastOrderUpdate(Date.now())
  }

  const updateOrderStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)))
    setLastOrderUpdate(Date.now())
  }

  const getKitchenOrders = () => {
    return orders
      .filter((order) => order.status !== "completed")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  const getCompletedOrders = () => {
    return orders
      .filter((order) => order.status === "completed")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  const getAllOrders = () => {
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  const getOrderById = (id: string) => {
    return orders.find((order) => order.id === id)
  }

  const clearOrderHistory = () => {
    // Only remove completed orders from the main orders array
    // This preserves sales data for reports but clears the history view
    setOrders((prev) => prev.filter((order) => order.status !== "completed"))
    setLastOrderUpdate(Date.now())
  }

  const refreshOrders = () => {
    setLastOrderUpdate(Date.now())
  }

  // Analytics - Real data only
  const getTodayStats = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      orderDate.setHours(0, 0, 0, 0)
      return orderDate.getTime() === today.getTime()
    })

    const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = todayOrders.length
    const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate top items from real orders
    const itemCounts: { [key: string]: { name: string; quantity: number; revenue: number } } = {}

    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.menuItem.id
        if (!itemCounts[key]) {
          itemCounts[key] = {
            name: item.menuItem.name,
            quantity: 0,
            revenue: 0,
          }
        }
        itemCounts[key].quantity += item.quantity
        itemCounts[key].revenue += item.menuItem.price * item.quantity
      })
    })

    const topItems = Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    return {
      totalRevenue,
      totalOrders,
      averageOrder,
      topItems,
    }
  }

  // Calculate order totals
  const calculateOrderTotal = (items: OrderItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
    const tax = taxSettings.autoApplyTax ? subtotal * (taxSettings.taxRate / 100) : 0
    const serviceCharge = taxSettings.autoApplyServiceCharge ? subtotal * (taxSettings.serviceChargeRate / 100) : 0
    const discount = 0 // Can be enhanced to apply discounts
    const total = subtotal + tax + serviceCharge - discount

    return { subtotal, tax, serviceCharge, discount, total }
  }

  const value: POSContextType = {
    restaurantSettings,
    updateRestaurantSettings,
    menuItems,
    categories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    taxSettings,
    discountTypes,
    updateTaxSettings,
    addDiscountType,
    updateDiscountType,
    deleteDiscountType,
    users,
    addUser,
    updateUser,
    deleteUser,
    updateUserPassword,
    resetUserPassword,
    orders,
    addOrder,
    updateOrderStatus,
    getKitchenOrders,
    getCompletedOrders,
    getAllOrders,
    getOrderById,
    clearOrderHistory,
    lastOrderUpdate,
    refreshOrders,
    getTodayStats,
    calculateOrderTotal,
  }

  return <POSContext.Provider value={value}>{children}</POSContext.Provider>
}

export function usePOS() {
  const context = useContext(POSContext)
  if (context === undefined) {
    throw new Error("usePOS must be used within a POSProvider")
  }
  return context
}
