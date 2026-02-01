// Mapping of local CSE stock symbols to TradingView symbols
// CSE stocks on TradingView use the .N0000 suffix with CSELK exchange
// Reference: https://www.tradingview.com/symbols/CSELK-JKH.N0000/

export interface StockSymbolMapping {
  local: string;
  tradingView: string;  // TradingView symbol (e.g., "JKH.N0000")
  name: string;
}

export const CSE_STOCK_SYMBOLS: StockSymbolMapping[] = [
  {
    local: "JKH",
    tradingView: "JKH.N0000",
    name: "John Keells Holdings PLC",
  },
  {
    local: "COMB",
    tradingView: "COMB.N0000",
    name: "Commercial Bank of Ceylon PLC",
  },
  {
    local: "NDB",
    tradingView: "NDB.N0000",
    name: "National Development Bank PLC",
  },
  {
    local: "DIAL",
    tradingView: "DIAL.N0000",
    name: "Dialog Axiata PLC",
  },
  {
    local: "LOLC",
    tradingView: "LOLC.N0000",
    name: "LOLC Holdings PLC",
  },
  {
    local: "SAMP",
    tradingView: "SAMP.N0000",
    name: "Sampath Bank PLC",
  },
  {
    local: "CTC",
    tradingView: "CTC.N0000",
    name: "Ceylon Tobacco Company PLC",
  },
  {
    local: "LIOC",
    tradingView: "LIOC.N0000",
    name: "Lanka IOC PLC",
  },
  {
    local: "HNB",
    tradingView: "HNB.N0000",
    name: "Hatton National Bank PLC",
  },
  {
    local: "TOK",
    tradingView: "TKYO.N0000",  // Tokyo Cement uses TKYO on CSE
    name: "Tokyo Cement Company PLC",
  },
  // Note: HEMAS and NEST are not available on TradingView
  // Add them back when you find the correct CSE ticker symbols
];

// Helper functions
export function getTradingViewSymbol(localSymbol: string): string | undefined {
  return CSE_STOCK_SYMBOLS.find((s) => s.local === localSymbol)?.tradingView;
}

export function getLocalSymbol(tradingViewSymbol: string): string | undefined {
  return CSE_STOCK_SYMBOLS.find((s) => s.tradingView === tradingViewSymbol)?.local;
}

export function getAllLocalSymbols(): string[] {
  return CSE_STOCK_SYMBOLS.map((s) => s.local);
}

export function getAllTradingViewSymbols(): string[] {
  return CSE_STOCK_SYMBOLS.map((s) => s.tradingView);
}
