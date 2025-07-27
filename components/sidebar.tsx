"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { usePOS } from "@/lib/pos-context"
import {
  Menu,
  List,
  History,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuth()
  const { restaurantSettings } = usePOS()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { id: "menu", label: "Menu", icon: Menu },
    { id: "orders", label: "Order List", icon: List },
    { id: "history", label: "History", icon: History },
    { id: "bills", label: "Bills", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help", label: "Help Center", icon: HelpCircle },
  ]

  const adminItems = [{ id: "backoffice", label: "Back Office", icon: Briefcase }]

  return (
    <div
      className={`${isCollapsed ? "w-16" : "w-64"} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-all duration-300 ease-in-out`}
    >
      {/* Header with toggle */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">Q</span>
            </div>
            <div>
              <span className="text-xl font-semibold text-gray-800 dark:text-gray-200">QPOS</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">{restaurantSettings.name}</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-white font-bold">Q</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start"} transition-colors ${
                activeView === item.id
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => onViewChange(item.id)}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 ${!isCollapsed ? "mr-3" : ""}`} />
              {!isCollapsed && item.label}
            </Button>
          )
        })}

        {user?.role === "admin" && (
          <>
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Admin
                </div>
              </div>
            )}
            {adminItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? "default" : "ghost"}
                  className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start"} transition-colors ${
                    activeView === item.id
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => onViewChange(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`h-5 w-5 ${!isCollapsed ? "mr-3" : ""}`} />
                  {!isCollapsed && item.label}
                </Button>
              )
            })}
          </>
        )}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="mb-3 text-center">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? "justify-center px-2" : "justify-start"} text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors`}
          onClick={logout}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className={`h-5 w-5 ${!isCollapsed ? "mr-3" : ""}`} />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </div>
  )
}
