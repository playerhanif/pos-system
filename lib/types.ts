export interface MenuItem {
  id: string
  name: string
  price: number
  image: string
  category: string
  description?: string
}

export interface OrderItem {
  id: string
  menuItem: MenuItem
  quantity: number
  notes?: string
}

export interface Order {
  id: string
  customerName: string
  customerContact?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  serviceCharge: number
  discount: number
  total: number
  status: "pending" | "preparing" | "ready" | "completed"
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
}
