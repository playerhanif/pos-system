"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MenuManagement } from "./menu-management"
import { CategoryManagement } from "./category-management"
import { UserManagement } from "./user-management"
import { SalesReports } from "./sales-reports"
import { TaxDiscountSettings } from "./tax-discount-settings"
import { SystemManagement } from "./system-management"
import { RestaurantSettings } from "./restaurant-settings"
import { PrinterSettings } from "./printer-settings"
import { Menu, Users, BarChart3, Tag, DollarSign, Settings, Building, Printer } from "lucide-react"

export function BackOffice() {
  const [activeSection, setActiveSection] = useState("overview")

  const sections = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "restaurant", label: "Restaurant", icon: Building },
    { id: "menu", label: "Menu Items", icon: Menu },
    { id: "categories", label: "Categories", icon: Tag },
    { id: "users", label: "Users", icon: Users },
    { id: "tax-discount", label: "Tax & Discounts", icon: DollarSign },
    { id: "printer", label: "Printer Settings", icon: Printer },
    { id: "reports", label: "Order Reports", icon: BarChart3 },
    { id: "system", label: "System Management", icon: Settings },
  ]

  const renderSection = () => {
    switch (activeSection) {
      case "restaurant":
        return <RestaurantSettings />
      case "menu":
        return <MenuManagement />
      case "categories":
        return <CategoryManagement />
      case "users":
        return <UserManagement />
      case "tax-discount":
        return <TaxDiscountSettings />
      case "printer":
        return <PrinterSettings />
      case "reports":
        return <SalesReports />
      case "system":
        return <SystemManagement />
      default:
        return (
          <div className="space-y-6 max-w-7xl">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Back Office Overview</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your restaurant operations</p>
            </div>
            <div className="responsive-grid grid gap-6">
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-xl"
                onClick={() => setActiveSection("restaurant")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                    <Building className="h-5 w-5" />
                    <span>Restaurant Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">Configure restaurant information and branding</p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-xl"
                onClick={() => setActiveSection("menu")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                    <Menu className="h-5 w-5" />
                    <span>Menu Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">Add, edit, and manage menu items and pricing</p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-xl"
                onClick={() => setActiveSection("users")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">Manage staff accounts, roles, and passwords</p>
                </CardContent>
              </Card>
              <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-xl"
                onClick={() => setActiveSection("reports")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-gray-800 dark:text-gray-200">
                    <BarChart3 className="h-5 w-5" />
                    <span>Order Reports</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">View sales analytics and performance</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 h-screen overflow-container transition-colors">
      <div className="flex-shrink-0 p-4 lg:p-6 pb-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700 transition-colors">
        <div className="flex space-x-2 overflow-x-auto scrollable-content">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <Button
                key={section.id}
                variant={activeSection === section.id ? "default" : "outline"}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{section.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      <div className="flex-1 scrollable-content p-4 lg:p-6">{renderSection()}</div>
    </div>
  )
}
