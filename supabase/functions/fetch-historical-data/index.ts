import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function fetchAlphaVantageData(symbol: string) {
  console.log(`Fetching Alpha Vantage data for ${symbol}`);
  const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
  if (!apiKey) {
    throw new Error('ALPHA_VANTAGE_API_KEY is not set');
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}&outputsize=compact`;
  console.log('Making request to Alpha Vantage API...');
  const response = await fetch(url);
  const data = await response.json();
  console.log('Alpha Vantage response:', JSON.stringify(data));

  if (data['Error Message']) {
    throw new Error(`Alpha Vantage error: ${data['Error Message']}`);
  }

  if (data['Note']) {
    // This usually means we've hit the API rate limit
    throw new Error(`Alpha Vantage API limit reached: ${data['Note']}`);
  }

  if (!data['Time Series (Daily)']) {
    console.error('Unexpected Alpha Vantage response:', data);
    throw new Error('Invalid response from Alpha Vantage');
  }

  return data['Time Series (Daily)'];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker } = await req.json();
    if (!ticker) {
      throw new Error('Ticker is required');
    }

    console.log(`Processing request for ${ticker}`);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Determine if it's an ETF
    const isETF = ['SPY', 'QQQ', 'IWM', 'DIA', 'VTI'].includes(ticker.toUpperCase());
    
    // Update master_stocks table with instrument type
    const { error: updateError } = await supabaseClient
      .from('master_stocks')
      .update({
        instrument_type: isETF ? 'etf' : 'stock',
        display_name: `${isETF ? 'ETF' : 'Stock'}: ${ticker.toUpperCase()}`,
        metadata: { validated: true }
      })
      .eq('ticker', ticker);

    if (updateError) {
      console.error('Error updating instrument info:', updateError);
      throw updateError;
    }

    // Fetch real market data
    const marketData = await fetchAlphaVantageData(ticker);
    
    // Transform the data for our database
    const historicalData = Object.entries(marketData).map(([date, values]: [string, any]) => ({
      ticker,
      date,
      open: Number(values['1. open']),
      high: Number(values['2. high']),
      low: Number(values['3. low']),
      close: Number(values['4. close']),
      volume: Number(values['5. volume'])
    }));

    console.log(`Processed ${historicalData.length} records for ${ticker}`);

    // Insert the data into our database
    const { error: insertError } = await supabaseClient
      .from('stock_historical_data')
      .upsert(historicalData, {
        onConflict: 'ticker,date',
        ignoreDuplicates: false // We want to update existing records
      });

    if (insertError) {
      console.error('Error inserting historical data:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: historicalData.length,
        lastPrice: historicalData[0]?.close
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
        success: false,
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