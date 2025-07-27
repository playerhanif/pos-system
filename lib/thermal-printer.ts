"use client"

import type { OrderItem } from "./types"
import { formatCurrency } from "./currency"

interface PrinterConfig {
  width: 58 | 80 // mm
  charactersPerLine: number
  paperCutCommand: string
  initCommand: string
}

const PRINTER_CONFIGS: Record<string, PrinterConfig> = {
  "58mm": {
    width: 58,
    charactersPerLine: 32,
    paperCutCommand: "\x1D\x56\x00", // ESC/POS cut command
    initCommand: "\x1B\x40", // Initialize printer
  },
  "80mm": {
    width: 80,
    charactersPerLine: 48,
    paperCutCommand: "\x1D\x56\x00",
    initCommand: "\x1B\x40",
  },
}

export class ThermalPrinterService {
  private config: PrinterConfig
  private restaurantName: string
  private restaurantAddress: string
  private restaurantPhone: string

  constructor(printerWidth: 58 | 80 = 80, restaurantName = "DonerG", restaurantAddress = "", restaurantPhone = "") {
    this.config = PRINTER_CONFIGS[`${printerWidth}mm`]
    this.restaurantName = restaurantName
    this.restaurantAddress = restaurantAddress
    this.restaurantPhone = restaurantPhone
  }

  private centerText(text: string): string {
    const padding = Math.max(0, Math.floor((this.config.charactersPerLine - text.length) / 2))
    return " ".repeat(padding) + text
  }

  private rightAlign(text: string): string {
    const padding = Math.max(0, this.config.charactersPerLine - text.length)
    return " ".repeat(padding) + text
  }

  private formatLine(left: string, right: string): string {
    const totalLength = this.config.charactersPerLine
    const rightLength = right.length
    const leftLength = totalLength - rightLength
    const truncatedLeft = left.length > leftLength ? left.substring(0, leftLength - 3) + "..." : left
    const padding = totalLength - truncatedLeft.length - rightLength
    return truncatedLeft + " ".repeat(Math.max(0, padding)) + right
  }

  private createDivider(char = "-"): string {
    return char.repeat(this.config.charactersPerLine)
  }

  public generateReceipt(
    orderItems: OrderItem[],
    totals: {
      subtotal: number
      tax: number
      serviceCharge: number
      discount: number
      total: number
    },
    orderId?: string,
    customerName?: string,
  ): string {
    const now = new Date()
    const dateStr = now.toLocaleDateString()
    const timeStr = now.toLocaleTimeString()

    let receipt = ""

    // Initialize printer
    receipt += this.config.initCommand

    // Header
    receipt += "\n"
    receipt += this.centerText(this.restaurantName.toUpperCase()) + "\n"
    if (this.restaurantAddress) {
      receipt += this.centerText(this.restaurantAddress) + "\n"
    }
    if (this.restaurantPhone) {
      receipt += this.centerText(this.restaurantPhone) + "\n"
    }
    receipt += "\n"

    // Order info
    receipt += this.createDivider() + "\n"
    if (orderId) {
      receipt += this.formatLine("Order:", orderId) + "\n"
    }
    if (customerName) {
      receipt += this.formatLine("Customer:", customerName) + "\n"
    }
    receipt += this.formatLine("Date:", dateStr) + "\n"
    receipt += this.formatLine("Time:", timeStr) + "\n"
    receipt += this.createDivider() + "\n"

    // Items
    receipt += "\n"
    orderItems.forEach((item) => {
      const itemName = item.menuItem.name
      const quantity = `${item.quantity}x`
      const price = `${formatCurrency(item.menuItem.price)}`
      const total = `${formatCurrency(item.quantity * item.menuItem.price)}`

      // Item name and quantity
      receipt += this.formatLine(`${quantity} ${itemName}`, total) + "\n"

      // If item name is too long, show price per unit on next line
      if (itemName.length > 20) {
        receipt += this.formatLine(`   @ ${price} each`, "") + "\n"
      }
    })

    receipt += "\n"
    receipt += this.createDivider() + "\n"

    // Totals
    receipt += this.formatLine("Subtotal:", `${formatCurrency(totals.subtotal)}`) + "\n"

    if (totals.discount > 0) {
      receipt += this.formatLine("Discount:", `-${formatCurrency(totals.discount)}`) + "\n"
    }

    if (totals.serviceCharge > 0) {
      receipt += this.formatLine("Service Charge:", `${formatCurrency(totals.serviceCharge)}`) + "\n"
    }

    if (totals.tax > 0) {
      receipt += this.formatLine("Tax:", `${formatCurrency(totals.tax)}`) + "\n"
    }

    receipt += this.createDivider() + "\n"
    receipt += this.formatLine("TOTAL:", `${formatCurrency(totals.total)}`) + "\n"
    receipt += this.createDivider() + "\n"

    // Footer
    receipt += "\n"
    receipt += this.centerText("Thank you for your visit!") + "\n"
    receipt += this.centerText("Please come again") + "\n"
    receipt += "\n"
    receipt += this.centerText(`Powered by QPOS`) + "\n"
    receipt += "\n\n\n"

    // Cut paper
    receipt += this.config.paperCutCommand

    return receipt
  }

  public async printReceipt(receiptContent: string): Promise<boolean> {
    try {
      // Check if Web Serial API is supported
      if (!("serial" in navigator)) {
        throw new Error("Web Serial API not supported in this browser")
      }

      // Request port access
      const port = await (navigator as any).serial.requestPort()
      await port.open({ baudRate: 9600 })

      // Create writer
      const writer = port.writable.getWriter()

      // Convert string to Uint8Array
      const encoder = new TextEncoder()
      const data = encoder.encode(receiptContent)

      // Write to printer
      await writer.write(data)

      // Close connection
      writer.releaseLock()
      await port.close()

      return true
    } catch (error) {
      console.error("Printing failed:", error)

      // Fallback: Open print dialog with formatted receipt
      this.printToSystemPrinter(receiptContent)
      return false
    }
  }

  private printToSystemPrinter(receiptContent: string): void {
    // Create a new window with the receipt content
    const printWindow = window.open("", "_blank", "width=300,height=600")
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${this.restaurantName}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              margin: 0;
              padding: 10px;
              width: ${this.config.width}mm;
              background: white;
            }
            pre {
              margin: 0;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            @media print {
              body { margin: 0; padding: 5px; }
              @page { margin: 0; size: ${this.config.width}mm auto; }
            }
          </style>
        </head>
        <body>
          <pre>${receiptContent.replace(/\x1B\x40|\x1D\x56\x00/g, "")}</pre>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 1000);
            }
          </script>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  public printOrderReceipt(
    orderItems: OrderItem[],
    totals: {
      subtotal: number
      tax: number
      serviceCharge: number
      discount: number
      total: number
    },
    orderId?: string,
    customerName?: string,
  ): Promise<boolean> {
    const receiptContent = this.generateReceipt(orderItems, totals, orderId, customerName)
    return this.printReceipt(receiptContent)
  }

  public updateRestaurantInfo(name: string, address: string, phone: string): void {
    this.restaurantName = name
    this.restaurantAddress = address
    this.restaurantPhone = phone
  }
}

// Singleton instance
let printerInstance: ThermalPrinterService | null = null

export function getThermalPrinter(): ThermalPrinterService {
  if (!printerInstance) {
    // Load restaurant settings from localStorage
    const settings = JSON.parse(localStorage.getItem("pos-restaurant-settings") || "{}")
    printerInstance = new ThermalPrinterService(
      80, // Default to 80mm
      settings.name || "DonerG",
      settings.address || "",
      settings.phone || "",
    )
  }
  return printerInstance
}

export function updatePrinterSettings(name: string, address: string, phone: string): void {
  if (printerInstance) {
    printerInstance.updateRestaurantInfo(name, address, phone)
  }
}
