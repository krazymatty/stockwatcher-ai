// Map of common futures contracts to their TradingView symbols
export const futuresMap: Record<string, { symbol: string; exchange: string }> = {
  'ES': { symbol: 'CME_MINI:ES1!', exchange: 'CME' },
  '/ES': { symbol: 'CME_MINI:ES1!', exchange: 'CME' },
  'NQ': { symbol: 'CME_MINI:NQ1!', exchange: 'CME' },
  '/NQ': { symbol: 'CME_MINI:NQ1!', exchange: 'CME' },
  'YM': { symbol: 'CBOT_MINI:YM1!', exchange: 'CBOT' },
  '/YM': { symbol: 'CBOT_MINI:YM1!', exchange: 'CBOT' },
  'RTY': { symbol: 'CME_MINI:RTY1!', exchange: 'CME' },
  '/RTY': { symbol: 'CME_MINI:RTY1!', exchange: 'CME' },
};

// Map of stocks to their correct exchanges
const stockExchangeMap: Record<string, string> = {
  'TSLA': 'NASDAQ',
  'AAPL': 'NASDAQ',
  'MSFT': 'NASDAQ',
  'GOOGL': 'NASDAQ',
  'AMZN': 'NASDAQ',
  'META': 'NASDAQ',
  'SPY': 'NYSE ARCA',
  'QQQ': 'NASDAQ',
  'IWM': 'NYSE ARCA',
};

export const getTradingViewSymbol = (ticker: string): { symbol: string; exchange: string } => {
  // Check if it's a futures contract
  const futuresSymbol = futuresMap[ticker.toUpperCase()];
  if (futuresSymbol) {
    return futuresSymbol;
  }

  // Get the exchange from our map, default to NYSE if not found
  const exchange = stockExchangeMap[ticker.toUpperCase()] || 'NYSE';
  
  return {
    symbol: ticker.toUpperCase(),
    exchange
  };
};