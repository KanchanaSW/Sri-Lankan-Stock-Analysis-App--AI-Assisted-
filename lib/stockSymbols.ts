// Utility functions for working with CSE stock symbols
// CSE stocks on TradingView use the .N0000 suffix with CSELK exchange
// Reference: https://www.tradingview.com/symbols/CSELK-JKH.N0000/
//
// Note: The stock list is now dynamically fetched from TradingView
// and stored in the Convex database. This file provides utility
// functions for symbol format conversions.

export interface StockSymbolMapping {
  local: string;
  tradingView: string;  // TradingView symbol (e.g., "JKH.N0000")
  name: string;
}

// Helper functions for symbol format conversion
export function toTradingViewSymbol(localSymbol: string): string {
  // Most CSE stocks use .N0000 suffix
  // Some exceptions may apply (e.g., TKYO for Tokyo Cement)
  return `${localSymbol}.N0000`;
}

export function toLocalSymbol(tradingViewSymbol: string): string {
  // Remove the .N0000 suffix
  return tradingViewSymbol.replace(".N0000", "");
}

export function toTradingViewTickerFormat(tradingViewSymbol: string): string {
  // Format for TradingView API: "CSELK:JKH.N0000"
  return `CSELK:${tradingViewSymbol}`;
}

