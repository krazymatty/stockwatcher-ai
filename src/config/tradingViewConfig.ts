export const createDatafeedConfig = (fetchBars: any) => ({
  onReady: (callback: any) => {
    console.log('TradingView datafeed onReady called');
    callback({
      supported_resolutions: ["1D", "1W", "1M"],
      exchanges: [{ value: "", name: "All Exchanges", desc: "" }],
      symbols_types: [{ name: "Stock", value: "stock" }],
    });
  },
  searchSymbols: () => {},
  resolveSymbol: (symbolName: string, onResolve: any) => {
    console.log('Resolving symbol:', symbolName);
    onResolve({
      name: symbolName,
      full_name: symbolName,
      description: symbolName,
      type: "stock",
      session: "0930-1630",
      timezone: "America/New_York",
      exchange: "",
      minmov: 1,
      pricescale: 100,
      has_intraday: false,
      has_daily: true,
      has_weekly_and_monthly: true,
      supported_resolutions: ["1D", "1W", "1M"],
    });
  },
  getBars: async (symbolInfo: any, resolution: string, from: number, to: number, onResult: any) => {
    console.log('Fetching bars for:', symbolInfo.name, 'from:', new Date(from * 1000), 'to:', new Date(to * 1000));
    const { bars, noData } = await fetchBars(symbolInfo, from, to);
    if (noData) {
      onResult([], { noData: true });
    } else {
      onResult(bars);
    }
  },
  subscribeBars: () => {},
  unsubscribeBars: () => {},
});