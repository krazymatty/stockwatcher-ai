import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InstrumentInfo {
  type: 'stock' | 'etf' | 'future' | 'forex' | 'option' | 'crypto';
  symbol: string;
  displayName?: string;
}

async function validateAndIdentifyInstrument(symbol: string): Promise<InstrumentInfo> {
  // This is a mock implementation - in reality, you'd want to use a proper financial API
  // to validate and identify instruments
  
  // Basic pattern matching
  if (symbol.startsWith('/')) {
    return {
      type: 'future',
      symbol,
      displayName: `Futures: ${symbol}`
    };
  }
  
  // Common ETFs (this should be expanded or replaced with API validation)
  const commonEtfs = ['SPY', 'QQQ', 'IWM', 'DIA', 'VTI'];
  if (commonEtfs.includes(symbol.toUpperCase())) {
    return {
      type: 'etf',
      symbol: symbol.toUpperCase(),
      displayName: `ETF: ${symbol.toUpperCase()}`
    };
  }
  
  // Default to stock if no other patterns match
  return {
    type: 'stock',
    symbol: symbol.toUpperCase(),
    displayName: `Stock: ${symbol.toUpperCase()}`
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
    
    // Validate and identify the instrument type
    const instrumentInfo = await validateAndIdentifyInstrument(ticker);
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Update the master_stocks table with instrument info
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

    // Mock data generation based on instrument type
    const mockData = generateMockHistoricalData(ticker, instrumentInfo.type);
    
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

function generateMockHistoricalData(ticker: string, instrumentType: string) {
  const data = [];
  const today = new Date();
  
  // Adjust base price and volatility based on instrument type
  let basePrice = 100;
  let volatility = 0.02;
  
  switch (instrumentType) {
    case 'future':
      basePrice = 4500; // Higher base price for futures
      volatility = 0.03; // Higher volatility
      break;
    case 'etf':
      basePrice = 350; // Typical ETF price range
      volatility = 0.015; // Lower volatility
      break;
    default:
      basePrice = 100 + Math.random() * 100;
      volatility = 0.02;
  }
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      ticker,
      date: date.toISOString().split('T')[0],
      open: basePrice * (1 + (Math.random() - 0.5) * volatility),
      high: basePrice * (1 + Math.random() * volatility),
      low: basePrice * (1 - Math.random() * volatility),
      close: basePrice * (1 + (Math.random() - 0.5) * volatility),
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
    
    // Update base price for next day
    basePrice *= (1 + (Math.random() - 0.5) * volatility);
  }
  
  return data;
}