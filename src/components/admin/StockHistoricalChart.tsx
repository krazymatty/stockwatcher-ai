import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

interface StockHistoricalChartProps {
  ticker: string;
}

export const StockHistoricalChart = ({ ticker }: StockHistoricalChartProps) => {
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

  // Format the data to ensure proper numeric values
  const formattedData = historicalData.map(record => ({
    ...record,
    close: Number(record.close),
    open: Number(record.open),
    high: Number(record.high),
    low: Number(record.low),
    volume: Number(record.volume),
    date: new Date(record.date).toISOString(),
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
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
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};