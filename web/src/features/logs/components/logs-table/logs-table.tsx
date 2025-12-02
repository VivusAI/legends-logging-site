// welcome to hell

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import {
  Cell,
  //type CellContext,
  type ColumnDef,
  type ColumnSizingState,
  type Row,
  type RowSelectionState,
  Header,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getLevelRowClassName } from "@/lib/logs/level";
import { cn } from "@/lib/utils";
import { QueryBuilder } from "../search/query-builder";
//import { StarredSearchDrawer } from "./Search/StarredSearchDrawer";
import { LogsFilter } from "./logs-filter";
import { LogsTableProvider } from "../../providers/logs-table-provider";
import { TableColumnLevelIndicator } from "./table-level-indicator";

//import { useDatasetSettings } from "@/hooks/use-dataset-settings";
import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";
//import { DatasetSelect } from "../[datasetId]/_components/dataset-select";
import { RawDataCell } from "./raw-data-cell";
import { MemoTableBodyRow, TableBodyRow } from "./table-body-row";
//import { TraceDataSheet } from "./trace-data-sheet";
import { Field } from "@/typings/logs";
import { useParams, useSearchParams } from "react-router";
import { type Log } from "@/typings/logs";
import { _LEVELS } from "@/lib/constants/level";
import { VALID_INTERVALS } from "@/lib/constants/interval";
import { useCustomColumns } from "../../hooks/use-custom-columns";
import { LogsTableColumnTimestamp } from "./table-hover-card-timestamp";
import { useQueryLogs } from "../../api/logs-api";

dayjs.extend(utc);
dayjs.extend(timezone);

//const MAX_COL_WIDTH = 2_000;
//const DEFAULT_COL_WIDTH = 150;

interface LogsTableProps {
  organizationId: string | undefined;
  datasetId: string | undefined;
  levels: string[] | null | undefined;
  defaultRowSelection?: RowSelectionState;
  defaultColumnSizing?: ColumnSizingState;
  defaultColumnVisibility?: VisibilityState;
  fields: Field[] | null | undefined;
}

function findCustomColumns(
  headers: Header<Log, unknown>[] | Cell<Log, unknown>[],
) {
  return headers.filter((h) => !["level", "data"].includes(h.id));
}

export function LogsTable({
  organizationId,
  datasetId,
  levels,
  fields,
  defaultRowSelection,
  defaultColumnSizing,
  defaultColumnVisibility,
}: LogsTableProps) {
  const [containerWidth, setContainerWidth] = useState(1200);
  const [hasActualWidth, setHasActualWidth] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    defaultRowSelection ?? {},
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    defaultColumnVisibility ?? {},
  );
  const [columnSizing, setColumnSizing] = useState<
    ColumnSizingState | undefined
  >(defaultColumnSizing ?? {});

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();

  const selectedLevels = searchParams.get("level")!;
  const fromDate = searchParams.get("from")!;
  const toDate = searchParams.get("to")!;
  const metadata = searchParams.get("metadata")!;
  const filter = searchParams.get("filter")!;

  //const { toggleRawData } = useDatasetSettings();
  const { columns: customColumns, updateColumnWidth } = useCustomColumns();

  const { mutateAsync } = useQueryLogs(organizationId, datasetId);

  /*const getCustomColumns = useMemo(
    () =>
      (isHydrated ? customColumns : []).map((column): ColumnDef<Log> => {
        return {
          id: column.name,
          accessorKey: column.name,
          enableResizing: true,
          size: column.width,
          maxSize: MAX_COL_WIDTH,
          minSize: DEFAULT_COL_WIDTH,
          header: () => {
            return <MemoizedColumnSettingsMenu columnName={column.name} />;
          },
          cell: (value: CellContext<Log, unknown>) => {
            const metadata = value.row.original.Metadata as unknown as Record<
              string,
              string
            >;
            const columnValue = metadata?.[column.name] ?? "<nil>";

            return (
              <div className="text-xs font-logs font-normal text-logs-text break-words text-wrap">
                {columnValue}
              </div>
            );
          },
        };
      }),
    [isHydrated, customColumns],
  ); */

  const toogleRawDataColumn = useCallback(() => {
    setColumnVisibility((prev) => {
      return {
        ...prev,
        data: !prev.data,
      };
    });
    //toggleRawData();
  }, [setColumnVisibility]);

  const columns: ColumnDef<Log>[] = useMemo(
    () => [
      {
        accessorKey: "Level",
        id: "level",
        header: "",
        cell: ({ row }) => {
          const severity =
            (row.original?.Metadata["severity"] as (typeof _LEVELS)[number]) ??
            "info";

          return <TableColumnLevelIndicator value={severity} />;
        },
        size: 40,
        minSize: 40,
        maxSize: 40,
        enableHiding: false,
        enableResizing: false,
      },
      {
        accessorKey: "Timestamp",
        id: "timestamp",
        header: "_time",
        enableResizing: false,
        cell: (info) => {
          const date = info?.getValue() as string;
          return <LogsTableColumnTimestamp date={date} />;
        },
        size: 180,
        minSize: 180,
        maxSize: 180,
      },
      //...getCustomColumns,
      {
        header: () => {
          return (
            <div className="flex items-center gap-2">
              <span>Raw Data</span>
              <ArrowRightFromLine
                className="w-4 h-4"
                onClick={toogleRawDataColumn}
              />
            </div>
          );
        },
        enableResizing: false,
        enableHiding: true,
        id: "data",
        accessorKey: "data",
        cell: RawDataCell,
        size: 0,
        minSize: 0,
      },
    ],
    [toogleRawDataColumn],
  );

  const handleOpenLog = (logId: string) => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams);
    params.set("logId", logId);

    setSearchParams(params);
  };

  let refreshInterval = searchParams.get("refresh") ?? "0";
  if (!VALID_INTERVALS.includes(refreshInterval)) {
    refreshInterval = "0";
  }

  const { data, fetchNextPage, isFetching } = useInfiniteQuery({
    queryKey: ["logs", selectedLevels, fromDate, toDate, metadata, filter],
    enabled: true,
    queryFn: async ({ pageParam = 0 }) => {
      const data = await mutateAsync({
        organizationId: params.teamId as string,
        datasetId: params.datasetId as string,
        metadata: metadata,
        fromDate: fromDate,
        toDate: toDate,
        levels: selectedLevels,
        filter: filter,
        cursor: pageParam,
      });

      return data;
    },
    initialPageParam: 0,
    getNextPageParam: (_lastGroup, groups) => groups.length,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    refetchInterval:
      refreshInterval !== "0" ? parseInt(refreshInterval) : false,
    refetchIntervalInBackground: false,
  });

  const flatData: Log[] = React.useMemo(
    () => data?.pages?.flatMap((page) => page!.data) ?? [],
    [data],
  );

  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        if (
          scrollHeight - scrollTop - clientHeight < 500 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          void fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
  );

  function getRowClassName(row: Row<Log>) {
    const severity = row.original?.Metadata["severity"] ?? "info";
    return getLevelRowClassName(severity as (typeof _LEVELS)[number]);
  }

  const handleTableColumnSizing = React.useCallback(
    (
      updater:
        | ColumnSizingState
        | ((old: ColumnSizingState) => ColumnSizingState),
    ) => {
      if (typeof updater === "function") {
        setColumnSizing((prev) => updater(prev ?? {}));
      } else {
        setColumnSizing(updater);
      }
    },
    [],
  );

  const table = useReactTable<Log>({
    data: flatData,
    columns: columns,
    columnResizeMode: "onEnd",
    columnResizeDirection: "ltr",
    enableColumnResizing: true,
    getCoreRowModel: getCoreRowModel(),
    enableMultiRowSelection: false,
    onColumnSizingChange: handleTableColumnSizing,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnSizing: columnSizing ?? {},
      rowSelection,
      columnVisibility,
    },
    initialState: {
      columnVisibility: columnVisibility,
    },
    onRowSelectionChange: setRowSelection,
    meta: {
      getRowClassName,
    },
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: rows.length,
    estimateSize: () => 33,
    getScrollElement: () => tableContainerRef.current,
    measureElement:
      typeof window !== "undefined" &&
      navigator.userAgent.indexOf("Firefox") === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
    overscan: 5,
  });

  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colSizes[`--header-${header.id}-size`] = header.getSize();
      colSizes[`--col-${header.column.id}-size`] = header.column.getSize();
    }
    return colSizes;
    // sometimes, fuck eslint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table.getState().columnSizingInfo, table.getState().columnSizing]);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
        setHasActualWidth(true);
      }
    });

    resizeObserver.observe(container);

    if (container.clientWidth > 0) {
      setContainerWidth(container.clientWidth);
      setHasActualWidth(true);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // now this is....really really fucked up, lord forgive me
  // this updates local storage with the column sizes for custom columns
  useEffect(() => {
    if (!columnSizing || !isHydrated) return;

    const headers = table.getFlatHeaders();
    const customHeaders = headers.filter(
      (h) => !["level", "timestamp", "data"].includes(h.id),
    );

    const lastCustomColumnId =
      customHeaders.length > 0
        ? customHeaders[customHeaders.length - 1]!.id
        : null;

    Object.entries(columnSizing).forEach(([columnId, width]) => {
      if (!["level", "timestamp", "data"].includes(columnId)) {
        if (!columnVisibility.data && columnId === lastCustomColumnId) {
          return;
        }

        const existingColumn = customColumns.find(
          (col) => col.name === columnId,
        );
        if (existingColumn && existingColumn.width !== width) {
          updateColumnWidth({
            ...existingColumn,
            width: width,
          });
          return;
        }

        // for later -- fuck this for now
        /*if (columnId === "data") {
          updateRawDataColumnWidth(width);
          return;
        } */
      }
    });
  }, [
    columnSizing,
    customColumns,
    updateColumnWidth,
    isHydrated,
    table,
    columnVisibility.data,
  ]);

  // this just keeps track of the column sizes and updates the table
  useEffect(() => {
    if (!hasActualWidth && containerWidth <= 0) {
      return;
    }

    const headers = table.getFlatHeaders();
    if (headers.length === 0) {
      return;
    }

    let fixedWidth = 0;
    let otherWidth = 0;
    let lastCustomColumnId: string | null = null;

    const customHeaders = headers.filter(
      (h) => !["level", "timestamp", "data"].includes(h.id),
    );
    if (customHeaders.length > 0) {
      lastCustomColumnId = customHeaders[customHeaders.length - 1]!.id;
    }

    // fuuuuuuuuuck
    headers.forEach((header) => {
      if (header.id === "level" || header.id === "timestamp") {
        fixedWidth += header.getSize();
      } else if (header.id !== "data") {
        if (!columnVisibility.data && header.id === lastCustomColumnId) {
          otherWidth += 800;
        } else {
          otherWidth += header.getSize();
        }
      }
    });

    const safeContainerWidth = Math.max(containerWidth, 800);
    const availableSpace = Math.max(
      safeContainerWidth - fixedWidth - otherWidth,
      200,
    );

    setColumnSizing((prev) => {
      if (columnVisibility.data) {
        if (prev?.data !== availableSpace) {
          return {
            ...prev,
            data: availableSpace,
          };
        }
      } else {
        if (
          lastCustomColumnId &&
          prev?.[lastCustomColumnId] !== availableSpace
        ) {
          return {
            ...prev,
            [lastCustomColumnId]: availableSpace,
          };
        }
      }
      return prev ?? {};
    });
  }, [
    table,
    containerWidth,
    hasActualWidth,
    columnVisibility.data,
    columnSizing,
  ]);

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    if (virtualItems.length === 0) return;

    const lastItem = virtualItems[virtualItems.length - 1];
    if (!lastItem) return;

    if (
      lastItem.index >= rows.length - 5 &&
      !isFetching &&
      totalFetched < totalDBRowCount
    ) {
      void fetchNextPage();
    }
  }, [
    rowVirtualizer,
    rows.length,
    isFetching,
    totalFetched,
    totalDBRowCount,
    fetchNextPage,
  ]);

  return (
    <LogsTableProvider
      table={table}
      columns={columns}
      rowSelection={rowSelection}
    >
      <div className="h-full w-full flex flex-col">
        <div
          className={cn(
            "flex flex-col gap-4 bg-background p-2",
            "sticky top-0 z-10",
          )}
        >
          {/*<QueryModeSwitcher />*/}
          <div>
            <div className="flex flex-row items-center gap-2">
              {/*<DatasetSelect teamId={teamId} />*/}
              <QueryBuilder fields={fields} />
              {/*<StarredSearchDrawer />*/}
            </div>
          </div>
          <LogsFilter organizationId={organizationId} levels={levels} />
        </div>
        <div className="flex-1 border border-border w-full relative overflow-hidden">
          <div className="sticky top-0 z-20 bg-background border-b border-border">
            <table
              className="w-full"
              style={{
                ...columnSizeVars,
                width: "100%",
                display: "grid",
              }}
            >
              <thead
                style={{
                  display: "grid",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                {table.getHeaderGroups().map((headerGroup) => {
                  return (
                    <tr
                      key={headerGroup.id}
                      style={{ display: "flex", width: "100%" }}
                      className="hover:bg-transparent bg-background"
                    >
                      {headerGroup.headers.map((header) => {
                        const headers = headerGroup.headers;
                        const customColumns = findCustomColumns(headers);
                        const lastCustomColumn =
                          customColumns[customColumns.length - 1];
                        const isLastColumn = lastCustomColumn?.id === header.id;
                        // this is so fucked up
                        // i need to find a better way to do this
                        const shouldFlex =
                          (header.id === "data" && columnVisibility.data) ||
                          (isLastColumn && !columnVisibility.data);

                        return (
                          <th
                            key={header.id}
                            style={{
                              display: "flex",
                              width: shouldFlex ? "auto" : header.getSize(),
                              minWidth: shouldFlex ? "200px" : header.getSize(),
                              ...(shouldFlex
                                ? { flex: "1 1 auto" }
                                : { maxWidth: header.getSize() }),
                            }}
                            className={cn(
                              "relative px-3 py-2 text-xs font-medium text-muted-foreground bg-background",
                              "[&:not(:last-child)]:border-r border-border",
                            )}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}

                                {header.column.getCanResize() && (
                                  <div
                                    onDoubleClick={() =>
                                      header.column.resetSize()
                                    }
                                    onMouseDown={header.getResizeHandler()}
                                    onTouchStart={header.getResizeHandler()}
                                    className={cn(
                                      "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none hover:bg-primary/50 z-10",
                                      header.column.getIsResizing() &&
                                        "bg-blue-500",
                                    )}
                                    style={{
                                      transform: `translateX(${
                                        (table.options.columnResizeDirection ===
                                        "rtl"
                                          ? -1
                                          : 1) *
                                        (table.getState().columnSizingInfo
                                          .deltaOffset ?? 0)
                                      }px)`,
                                    }}
                                  />
                                )}
                              </div>
                              {shouldFlex && isLastColumn && (
                                <div className="absolute right-2">
                                  <ArrowLeftFromLine
                                    className="w-4 h-4"
                                    onClick={toogleRawDataColumn}
                                  />
                                </div>
                              )}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  );
                })}
              </thead>
            </table>
          </div>

          <div
            ref={tableContainerRef}
            className="flex-1 overflow-auto"
            onScroll={(e) => fetchMoreOnBottomReached(e.currentTarget)}
            style={{
              height: "calc(100% - 41px)",
            }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {/* why I am wrapping a table in a table? it worked, its just really bad */}
              <table
                ref={tableRef}
                className="w-full"
                style={{
                  ...columnSizeVars,
                  width: "100%",
                  display: "grid",
                }}
              >
                <tbody
                  style={{
                    display: "grid",
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    position: "relative",
                  }}
                >
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index] as Row<Log>;

                    return (
                      <React.Fragment key={row.id}>
                        {table.getState().columnSizingInfo.isResizingColumn ? (
                          <MemoTableBodyRow
                            table={table}
                            row={row}
                            virtualRow={virtualRow}
                            rowVirtualizer={rowVirtualizer}
                            handleOpenLog={handleOpenLog}
                            columnVisibility={columnVisibility}
                          />
                        ) : (
                          <TableBodyRow
                            table={table}
                            row={row}
                            virtualRow={virtualRow}
                            rowVirtualizer={rowVirtualizer}
                            handleOpenLog={handleOpenLog}
                            columnVisibility={columnVisibility}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>

              {isFetching && (
                <div
                  style={{
                    position: "absolute",
                    top: `${rowVirtualizer.getTotalSize()}px`,
                    left: 0,
                    width: "100%",
                    height: "64px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    color: "var(--muted-foreground)",
                  }}
                >
                  Loading more logs...
                </div>
              )}

              {!isFetching &&
                totalFetched >= totalDBRowCount &&
                totalFetched > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: `${rowVirtualizer.getTotalSize()}px`,
                      left: 0,
                      width: "100%",
                      height: "64px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    All logs loaded ({totalFetched} of {totalDBRowCount})
                  </div>
                )}

              {!isFetching && flatData.length === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "128px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    color: "var(--muted-foreground)",
                  }}
                >
                  No logs found
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/50 text-xs text-muted-foreground">
          <div>
            Showing {totalFetched} of {totalDBRowCount} logs
          </div>
          {isFetching && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          )}
        </div>
      </div>
      {/*<TraceDataSheet />*/}
    </LogsTableProvider>
  );
}
