"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { usePOS } from "@/lib/pos-context"
import { useNotification } from "@/lib/notification-context"
import type { MenuItem } from "@/lib/types"
import { formatCurrency } from "@/lib/currency"

interface MenuViewProps {
  onAddToOrder: (item: MenuItem) => void
}

export function MenuView({ onAddToOrder }: MenuViewProps) {
  const { menuItems, categories } = usePOS()
  const { showToast } = useNotification()
  const [activeCategory, setActiveCategory] = useState("food")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAddToOrder = (item: MenuItem) => {
    onAddToOrder(item)
    showToast({
      type: "success",
      title: "Item Added",
      message: `${item.name} added to order`,
      duration: 2000,
    })
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-screen overflow-container transition-colors">
      {/* Fixed header section */}
      <div className="flex-shrink-0 p-4 lg:p-6 pb-4 bg-gray-50 dark:bg-gray-900">
        <div className="mb-4 lg:mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
            <Input
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Category</h2>
          <div className="flex space-x-2 lg:space-x-4 overflow-x-auto pb-2">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              onClick={() => setActiveCategory("all")}
              className={`whitespace-nowrap ${
                activeCategory === "all"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 whitespace-nowrap ${
                  activeCategory === category.id
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable content section */}
      <div className="flex-1 scrollable-content px-4 lg:px-6 pb-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Special Menu for you</h3>
          <div className="responsive-grid grid gap-4">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-xl"
              >
                <CardContent className="p-4">
                  <div className="aspect-square mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1 text-sm">{item.name}</h4>
                  <p className="text-green-600 dark:text-green-400 font-semibold mb-3">{formatCurrency(item.price)}</p>
                  <Button
                    onClick={() => handleAddToOrder(item)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                    size="sm"
                  >
                    ADD
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No items found</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Try adjusting your search or category filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
