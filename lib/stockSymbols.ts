// Mapping of local CSE stock symbols to Yahoo Finance symbols
// CSE stocks on Yahoo Finance use the .CMB suffix

export interface StockSymbolMapping {
  local: string;
  yahoo: string;
  name: string;
}

export const CSE_STOCK_SYMBOLS: StockSymbolMapping[] = [
  {
    local: "JKH",
    yahoo: "JKH.CMB",
    name: "John Keells Holdings PLC",
  },
  {
    local: "COMB",
    yahoo: "COMB.CMB",
    name: "Commercial Bank of Ceylon PLC",
  },
  {
    local: "NDB",
    yahoo: "NDB.CMB",
    name: "National Development Bank PLC",
  },
  {
    local: "DIAL",
    yahoo: "DIAL.CMB",
    name: "Dialog Axiata PLC",
  },
  {
    local: "LOLC",
    yahoo: "LOLC.CMB",
    name: "LOLC Holdings PLC",
  },
  {
    local: "SAMP",
    yahoo: "SAMP.CMB",
    name: "Sampath Bank PLC",
  },
  {
    local: "CTC",
    yahoo: "CTC.CMB",
    name: "Ceylon Tobacco Company PLC",
  },
  {
    local: "LIOC",
    yahoo: "LIOC.CMB",
    name: "Lanka IOC PLC",
  },
  {
    local: "HNB",
    yahoo: "HNB.CMB",
    name: "Hatton National Bank PLC",
  },
  {
    local: "HEMAS",
    yahoo: "HEMAS.CMB",
    name: "Hemas Holdings PLC",
  },
  {
    local: "NEST",
    yahoo: "NEST.CMB",
    name: "Nestle Lanka PLC",
  },
  {
    local: "TOK",
    yahoo: "TOK.CMB",
    name: "Tokyo Cement Company PLC",
  },
];

// Helper functions
export function getYahooSymbol(localSymbol: string): string | undefined {
  return CSE_STOCK_SYMBOLS.find((s) => s.local === localSymbol)?.yahoo;
}

export function getLocalSymbol(yahooSymbol: string): string | undefined {
  return CSE_STOCK_SYMBOLS.find((s) => s.yahoo === yahooSymbol)?.local;
}

export function getAllLocalSymbols(): string[] {
  return CSE_STOCK_SYMBOLS.map((s) => s.local);
}

export function getAllYahooSymbols(): string[] {
  return CSE_STOCK_SYMBOLS.map((s) => s.yahoo);
}
