import { TradingViewChart } from "./TradingViewChart";

interface StockHistoricalChartProps {
  ticker: string;
}

export const StockHistoricalChart = ({ ticker }: StockHistoricalChartProps) => {
  return <TradingViewChart ticker={ticker} />;
};