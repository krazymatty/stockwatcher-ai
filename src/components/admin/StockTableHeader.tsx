import { Button } from "@/components/ui/button";
import { TableHead } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { MasterStock, SortField } from "./types";

interface SortButtonProps {
  field: SortField;
  children: React.ReactNode;
  onSort: (field: SortField) => void;
}

const SortButton = ({ field, children, onSort }: SortButtonProps) => (
  <Button
    variant="ghost"
    onClick={() => onSort(field)}
    className="h-8 flex items-center gap-1"
  >
    {children}
    <ArrowUpDown className="h-4 w-4" />
  </Button>
);

interface StockTableHeaderProps {
  onSort: (field: SortField) => void;
}

export const StockTableHeader = ({ onSort }: StockTableHeaderProps) => {
  return (
    <>
      <TableHead className="w-[50px]">Status</TableHead>
      <TableHead>
        <SortButton field="ticker" onSort={onSort}>Ticker</SortButton>
      </TableHead>
      <TableHead>
        <SortButton field="created_by_email" onSort={onSort}>Added By</SortButton>
      </TableHead>
      <TableHead>
        <SortButton field="created_at" onSort={onSort}>Created At</SortButton>
      </TableHead>
      <TableHead>
        <SortButton field="last_updated" onSort={onSort}>Last Updated</SortButton>
      </TableHead>
      <TableHead className="w-[150px]">Actions</TableHead>
    </>
  );
};