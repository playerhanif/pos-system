"use client"

export interface Currency {
  code: string
  symbol: string
  name: string
  position: "before" | "after"
  decimals: number
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    position: "before",
    decimals: 2,
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    position: "before",
    decimals: 2,
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    position: "before",
    decimals: 2,
  },
  {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    position: "before",
    decimals: 2,
  },
  {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    position: "before",
    decimals: 0,
  },
  {
    code: "CNY",
    symbol: "¥",
    name: "Chinese Yuan",
    position: "before",
    decimals: 2,
  },
  {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    position: "before",
    decimals: 2,
  },
  {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    position: "before",
    decimals: 2,
  },
  {
    code: "CHF",
    symbol: "CHF",
    name: "Swiss Franc",
    position: "after",
    decimals: 2,
  },
  {
    code: "SEK",
    symbol: "kr",
    name: "Swedish Krona",
    position: "after",
    decimals: 2,
  },
]

export class CurrencyService {
  private static instance: CurrencyService
  private currentCurrency: Currency

  private constructor() {
    // Load currency from localStorage or default to USD
    const saved = localStorage.getItem("pos-currency")
    if (saved) {
      try {
        const currencyCode = JSON.parse(saved)
        this.currentCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0]
      } catch {
        this.currentCurrency = SUPPORTED_CURRENCIES[0]
      }
    } else {
      this.currentCurrency = SUPPORTED_CURRENCIES[0]
    }
  }

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService()
    }
    return CurrencyService.instance
  }

  public getCurrentCurrency(): Currency {
    return this.currentCurrency
  }

  public setCurrency(currencyCode: string): void {
    const currency = SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode)
    if (currency) {
      this.currentCurrency = currency
      localStorage.setItem("pos-currency", JSON.stringify(currencyCode))
    }
  }

  public formatAmount(amount: number): string {
    const { symbol, position, decimals } = this.currentCurrency
    const formattedAmount = amount.toFixed(decimals)

    if (position === "before") {
      return `${symbol}${formattedAmount}`
    } else {
      return `${formattedAmount} ${symbol}`
    }
  }

  public getSymbol(): string {
    return this.currentCurrency.symbol
  }

  public getCurrencyCode(): string {
    return this.currentCurrency.code
  }

  public getCurrencyName(): string {
    return this.currentCurrency.name
  }
}

// Global currency formatter function
export function formatCurrency(amount: number): string {
  return CurrencyService.getInstance().formatAmount(amount)
}

export function getCurrencySymbol(): string {
  return CurrencyService.getInstance().getSymbol()
}

export function getCurrentCurrency(): Currency {
  return CurrencyService.getInstance().getCurrentCurrency()
}
