import type {
  ColumnDef,
  RowSelectionState,
  Table,
} from "@tanstack/react-table";
import { createContext, useContext, useMemo } from "react";

interface DataTableStateContextType {
  rowSelection: RowSelectionState;
}

interface DataTableBaseContextType<TData = unknown, TValue = unknown> {
  table: Table<TData>;
  columns: ColumnDef<TData, TValue>[];
  isLoading?: boolean;
}

interface DataTableContextType<TData = unknown, TValue = unknown>
  extends DataTableStateContextType,
    DataTableBaseContextType<TData, TValue> {}

export const DataTableContext = createContext<DataTableContextType<
  // im sorry cwide, but I have no clue at all what to put here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any
> | null>(null);

export function LogsTableProvider<TData, TValue>({
  children,
  rowSelection,
  table,
  columns,
  isLoading,
}: Partial<DataTableStateContextType> &
  DataTableBaseContextType<TData, TValue> & {
    children: React.ReactNode;
  }) {
  const value = useMemo(
    () => ({
      table,
      columns,
      isLoading,
      rowSelection: rowSelection ?? {},
    }),
    [rowSelection, table, columns, isLoading],
  );

  return (
    <DataTableContext.Provider value={value}>
      {children}
    </DataTableContext.Provider>
  );
}

export function useDataTable<TData, TValue>() {
  const context = useContext(DataTableContext);

  if (!context) {
    throw new Error("useDataTable must be used within a DataTableProvider");
  }

  return context as DataTableContextType<TData, TValue>;
}
