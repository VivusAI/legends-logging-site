import { cn } from "@/lib/utils";
import { Log } from "@/typings/logs";
import {
  type Row,
  type Table as TTable,
  VisibilityState,
  flexRender,
} from "@tanstack/react-table";
import { VirtualItem, Virtualizer } from "@tanstack/react-virtual";
import { memo } from "react";
import { findCustomColumns } from "./utils";

interface TableBodyRowProps {
  table: TTable<Log>;
  row: Row<Log>;
  virtualRow: VirtualItem;
  rowVirtualizer: Virtualizer<HTMLDivElement, HTMLTableRowElement>;
  handleOpenLog: (logId: string) => void;
  columnVisibility: VisibilityState;
}

export function TableBodyRow({
  table,
  row,
  rowVirtualizer,
  virtualRow,
  handleOpenLog,
  columnVisibility,
}: TableBodyRowProps) {
  return (
    <tr
      key={row.id}
      data-index={virtualRow.index}
      ref={(node) => rowVirtualizer.measureElement(node)}
      style={{
        display: "flex",
        position: "absolute",
        transform: `translateY(${virtualRow.start}px)`,
        width: "100%",
      }}
      tabIndex={0}
      data-state={row.getIsSelected() && "selected"}
      onClick={() => {
        row.toggleSelected();
        handleOpenLog(row.original.TraceId);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          row.toggleSelected();
        }
      }}
      className={cn(
        "[&>:not(:last-child)]:border-r text-logs-text select-none",
        "transition-colors focus-visible:bg-muted/50 focus-visible:outline data-[state=selected]:outline-1 outline-0 -outline-offset-1 outline-primary",
        table.options.meta?.getRowClassName?.(row),
      )}
    >
      {row.getVisibleCells().map((cell) => {
        const cells = row.getVisibleCells();
        const customColumns = findCustomColumns(cells);
        const lastCustomColumn = customColumns[customColumns.length - 1];
        const isLastColumn = lastCustomColumn?.id === cell.id;
        const shouldFlex =
          (cell.id === "data" && columnVisibility.data) ||
          (isLastColumn && !columnVisibility.data);

        return (
          <td
            key={cell.id}
            style={{
              display: "flex",
              width: shouldFlex ? "auto" : cell.column.getSize(),
              minWidth: shouldFlex ? "200px" : cell.column.getSize(),
              ...(shouldFlex
                ? { flex: "1 1 auto" }
                : { maxWidth: cell.column.getSize() }),
            }}
            className={cn(
              "px-3 py-2 border-b border-border",
              cell.column.columnDef.meta?.cellClassName,
            )}
          >
            <div className="overflow-hidden min-w-0">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

export const MemoTableBodyRow = memo(
  (props: TableBodyRowProps) => {
    return <TableBodyRow {...props} />;
  },
  (prevProps, nextProps) => {
    return prevProps.row.id === nextProps.row.id;
  },
);

MemoTableBodyRow.displayName = "TableBodyRow";
