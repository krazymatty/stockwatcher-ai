import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log(`Fetching historical data for ${ticker}`)

    // This is a mock implementation - replace with actual API call
    // Simulate random failures for testing error handling
    if (Math.random() < 0.2) { // 20% chance of failure for testing
      throw new Error(`Failed to fetch data for ${ticker} (simulated failure)`)
    }
    
    const mockData = generateMockHistoricalData(ticker)
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: insertError } = await supabaseClient
      .from('stock_historical_data')
      .upsert(mockData, { 
        onConflict: 'ticker,date',
        ignoreDuplicates: true 
      })

    if (insertError) {
      console.error('Error inserting historical data:', insertError)
      throw insertError
    }

    return new Response(
      JSON.stringify({ success: true, count: mockData.length }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        ticker: error.ticker || null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

// Helper function to generate mock data
function generateMockHistoricalData(ticker: string) {
  const data = []
  const today = new Date()
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const basePrice = 100 + Math.random() * 100
    data.push({
      ticker,
      date: date.toISOString().split('T')[0],
      open: basePrice,
      high: basePrice * (1 + Math.random() * 0.02),
      low: basePrice * (1 - Math.random() * 0.02),
      close: basePrice * (1 + (Math.random() - 0.5) * 0.02),
      volume: Math.floor(Math.random() * 1000000) + 100000
    })
  }
  
  return data
}