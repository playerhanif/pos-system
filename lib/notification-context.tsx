"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { NotificationModal, ToastNotification, type NotificationType } from "@/components/ui/notification-modal"

interface NotificationState {
  isOpen: boolean
  type: NotificationType
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  showCancel?: boolean
}

interface ToastState {
  isOpen: boolean
  type: NotificationType
  title: string
  message: string
  duration?: number
}

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationState, "isOpen">) => void
  showToast: (toast: Omit<ToastState, "isOpen">) => void
  showConfirmation: (title: string, message: string, onConfirm: () => void, type?: NotificationType) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  })

  const [toast, setToast] = useState<ToastState>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  })

  const showNotification = (newNotification: Omit<NotificationState, "isOpen">) => {
    setNotification({ ...newNotification, isOpen: true })
  }

  const showToast = (newToast: Omit<ToastState, "isOpen">) => {
    setToast({ ...newToast, isOpen: true })
  }

  const showConfirmation = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: NotificationType = "warning",
  ) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      showCancel: true,
      confirmText: "Confirm",
      cancelText: "Cancel",
    })
  }

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }))
  }

  const closeToast = () => {
    setToast((prev) => ({ ...prev, isOpen: false }))
  }

  return (
    <NotificationContext.Provider value={{ showNotification, showToast, showConfirmation }}>
      {children}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
        onConfirm={notification.onConfirm}
        showCancel={notification.showCancel}
      />
      <ToastNotification
        isOpen={toast.isOpen}
        onClose={closeToast}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        duration={toast.duration}
      />
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
