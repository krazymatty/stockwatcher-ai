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
  Candlestick
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface StockHistoricalChartProps {
  ticker: string;
}

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

  // Format and filter the data to remove weekends and holidays
  const formattedData = historicalData
    .map(record => ({
      ...record,
      close: Number(record.close),
      open: Number(record.open),
      high: Number(record.high),
      low: Number(record.low),
      volume: Number(record.volume),
      date: new Date(record.date).toISOString(),
    }))
    // Filter out records with zero volume (typically indicates a non-trading day)
    .filter(record => record.volume > 0)
    // Sort by date to ensure proper ordering
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [`$${Number(value).toFixed(2)}`]}
              />
              <Candlestick
                name="Price"
                yAccessor={(data) => [data.open, data.high, data.low, data.close]}
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
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value) => [`$${Number(value).toFixed(2)}`]}
              />
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