import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // https://github.com/TanStack/table/issues/44#issuecomment-1377024296
  interface TableMeta<TData> {
    getRowClassName?: (row: Row<TData>) => string;
  }

  interface ColumnMeta {
    headerClassName?: string;
    cellClassName?: string;
    label?: string;
  }
}
