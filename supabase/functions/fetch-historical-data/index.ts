import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InstrumentInfo {
  type: 'stock' | 'etf' | 'future' | 'forex' | 'option' | 'crypto';
  symbol: string;
  displayName?: string;
  basePrice?: number;
}

const ETF_BASE_PRICES: Record<string, number> = {
  'SPY': 595.01,  // Current SPY price
  'QQQ': 409.52,  // Current QQQ price
  'IWM': 201.94,  // Current IWM price
  'DIA': 376.61,  // Current DIA price
  'VTI': 239.23   // Current VTI price
};

async function validateAndIdentifyInstrument(symbol: string): Promise<InstrumentInfo> {
  // Common ETFs with their current prices
  const commonEtfs = Object.keys(ETF_BASE_PRICES);
  
  if (symbol.startsWith('/')) {
    return {
      type: 'future',
      symbol,
      displayName: `Futures: ${symbol}`,
      basePrice: 4500
    };
  }
  
  if (commonEtfs.includes(symbol.toUpperCase())) {
    return {
      type: 'etf',
      symbol: symbol.toUpperCase(),
      displayName: `ETF: ${symbol.toUpperCase()}`,
      basePrice: ETF_BASE_PRICES[symbol.toUpperCase()]
    };
  }
  
  return {
    type: 'stock',
    symbol: symbol.toUpperCase(),
    displayName: `Stock: ${symbol.toUpperCase()}`,
    basePrice: 100 + Math.random() * 100
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { ticker } = await req.json()
    if (!ticker) {
      throw new Error('Ticker is required')
    }

    console.log(`Validating and fetching data for ${ticker}`)
    
    const instrumentInfo = await validateAndIdentifyInstrument(ticker);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    const { error: updateError } = await supabaseClient
      .from('master_stocks')
      .update({
        instrument_type: instrumentInfo.type,
        display_name: instrumentInfo.displayName,
        metadata: { validated: true }
      })
      .eq('ticker', ticker);

    if (updateError) {
      console.error('Error updating instrument info:', updateError);
      throw updateError;
    }

    const mockData = generateMockHistoricalData(ticker, instrumentInfo);
    
    const { error: insertError } = await supabaseClient
      .from('stock_historical_data')
      .upsert(mockData, { 
        onConflict: 'ticker,date',
        ignoreDuplicates: true 
      });

    if (insertError) {
      console.error('Error inserting historical data:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        count: mockData.length,
        instrumentInfo 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        ticker: error.ticker || null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

function generateMockHistoricalData(ticker: string, instrumentInfo: InstrumentInfo) {
  const data = [];
  const today = new Date();
  
  // Use the provided base price or fallback to defaults
  let basePrice = instrumentInfo.basePrice || 100;
  let volatility = 0.02;
  
  switch (instrumentInfo.type) {
    case 'future':
      volatility = 0.03; // Higher volatility for futures
      break;
    case 'etf':
      volatility = 0.015; // Lower volatility for ETFs
      break;
    default:
      volatility = 0.02;
  }
  
  // Generate historical data starting from the base price
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // For the most recent day (i=0), use exactly the base price for ETFs
    const isETF = instrumentInfo.type === 'etf';
    const isLatestDay = i === 0;
    
    const dayClose = isETF && isLatestDay 
      ? basePrice 
      : basePrice * (1 + (Math.random() - 0.5) * volatility);
      
    data.push({
      ticker,
      date: date.toISOString().split('T')[0],
      open: basePrice * (1 + (Math.random() - 0.5) * volatility),
      high: Math.max(dayClose, basePrice * (1 + Math.random() * volatility)),
      low: Math.min(dayClose, basePrice * (1 - Math.random() * volatility)),
      close: dayClose,
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
    
    // Update base price for next day (going backwards in time)
    if (!isLatestDay) {
      basePrice *= (1 + (Math.random() - 0.5) * volatility);
    }
  }
  
  return data;
}