import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Rectangle
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface StockHistoricalChartProps {
  ticker: string;
}

// Custom candlestick component
const CustomCandlestick = (props: any) => {
  const { x, y, width, height, payload } = props;
  const open = payload.open;
  const close = payload.close;
  const high = payload.high;
  const low = payload.low;

  // Calculate positions
  const centerX = x + width / 2;
  const bodyTop = Math.min(open, close);
  const bodyBottom = Math.max(open, close);
  const bodyHeight = Math.abs(close - open);
  
  // Determine if it's a bullish (green) or bearish (red) candlestick
  const fill = close >= open ? "#22c55e" : "#ef4444";
  const stroke = fill;

  return (
    <g>
      {/* Draw the wick (high to low) */}
      <line
        x1={centerX}
        y1={high}
        x2={centerX}
        y2={low}
        stroke={stroke}
        strokeWidth={1}
      />
      {/* Draw the body (open to close) */}
      <rect
        x={x}
        y={bodyTop}
        width={width}
        height={Math.max(1, bodyHeight)} // Ensure minimum height of 1px
        fill={fill}
        stroke={stroke}
      />
    </g>
  );
};

export const StockHistoricalChart = ({ ticker }: StockHistoricalChartProps) => {
  const [showCandlesticks, setShowCandlesticks] = useState(true);

  const { data: historicalData, isLoading } = useQuery({
    queryKey: ["historical-data", ticker],
    queryFn: async () => {
      console.log(`Fetching historical data for ${ticker}`);
      const { data, error } = await supabase
        .from("stock_historical_data")
        .select("*")
        .eq("ticker", ticker)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching historical data:", error);
        throw error;
      }

      console.log(`Retrieved ${data?.length} records for ${ticker}:`, data);
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  if (!historicalData?.length) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No historical data available for {ticker}
      </div>
    );
  }

  // Format and filter the data
  const formattedData = historicalData
    .map(record => ({
      ...record,
      close: Number(record.close),
      open: Number(record.open),
      high: Number(record.high),
      low: Number(record.low),
      volume: Number(record.volume),
      date: new Date(record.date).toISOString()
    }))
    // Filter out weekends
    .filter(record => {
      const date = new Date(record.date);
      const day = date.getDay();
      return day !== 0 && day !== 6; // 0 is Sunday, 6 is Saturday
    })
    // Filter out records with zero volume (typically indicates a holiday)
    .filter(record => record.volume > 0)
    // Sort by date to ensure proper ordering
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-2 shadow-lg">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          {showCandlesticks ? (
            <>
              <p>Open: ${data.open.toFixed(2)}</p>
              <p>High: ${data.high.toFixed(2)}</p>
              <p>Low: ${data.low.toFixed(2)}</p>
              <p>Close: ${data.close.toFixed(2)}</p>
            </>
          ) : (
            <p>Close: ${data.close.toFixed(2)}</p>
          )}
          <p>Volume: {data.volume.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="chart-type"
          checked={showCandlesticks}
          onCheckedChange={setShowCandlesticks}
        />
        <Label htmlFor="chart-type">
          {showCandlesticks ? "Candlestick" : "Line"} Chart
        </Label>
      </div>

      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {showCandlesticks ? (
            <ComposedChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="high"
                shape={<CustomCandlestick />}
                name="Stock Price"
              />
            </ComposedChart>
          ) : (
            <LineChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis 
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#8884d8"
                name="Close Price"
                dot={false}
                connectNulls={true}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};