import { StockStatus } from "@/utils/stockStatus";

interface StatusIndicatorProps {
  status: StockStatus;
}

export const StockStatusIndicator = ({ status }: StatusIndicatorProps) => {
  const colors = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500"
  };

  return (
    <div className={`w-3 h-3 rounded-full ${colors[status]}`} />
  );
};