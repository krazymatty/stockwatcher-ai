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

export const getTradingViewSymbol = (ticker: string): { symbol: string; exchange: string } => {
  // Check if it's a futures contract
  const futuresSymbol = futuresMap[ticker.toUpperCase()];
  if (futuresSymbol) {
    return futuresSymbol;
  }

  // For regular stocks, assume US exchange
  return {
    symbol: ticker.toUpperCase(),
    exchange: 'NYSE'  // Default to NYSE, but this could be enhanced with more accurate exchange data
  };
};