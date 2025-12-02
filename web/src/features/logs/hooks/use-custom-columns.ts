import { useAtom } from "jotai/react";

import {
  type CustomColumn,
  customColumnsAtom,
  rawDataColumnAtom,
  rawDataColumnWidthAtom,
} from "../store/custom-columns-store";
import { useCallback } from "react";

export const useCustomColumns = () => {
  const [customColumns, setCustomColumns] = useAtom(customColumnsAtom);

  const addColumn = useCallback(
    (column: CustomColumn) => {
      setCustomColumns((prev) => {
        if (prev.some((c) => c.name === column.name)) return prev;
        return [...prev, column];
      });
    },
    [setCustomColumns],
  );

  const removeColumn = (columnName: string) => {
    setCustomColumns((prev) => prev.filter((c) => c.name !== columnName));
  };

  const updateColumnWidth = useCallback(
    (column: CustomColumn) => {
      setCustomColumns((prev) =>
        prev.map((c) => (c.name === column.name ? column : c)),
      );
    },
    [setCustomColumns],
  );

  return {
    columns: customColumns,
    addColumn,
    updateColumnWidth,
    removeColumn,
  };
};

export const useRawDataColumn = () => {
  const [rawDataColumn, setRawDataColumn] = useAtom(rawDataColumnAtom);

  const toogleRawDataColumn = () => {
    setRawDataColumn((prev) => !prev);
  };

  return {
    rawDataColumn,
    toogleRawDataColumn,
  };
};

export const useRawDataColumnWidth = () => {
  const [rawDataColumnWidth, setRawDataColumnWidth] = useAtom(
    rawDataColumnWidthAtom,
  );

  /*const updateRawDataColumnWidth = (width: number) => {
    setRawDataColumnWidth(width);
  }; */

  const updateRawDataColumnWidth = useCallback(
    (width: number) => {
      setRawDataColumnWidth(width);
    },
    [setRawDataColumnWidth],
  );

  return {
    rawDataColumnWidth,
    updateRawDataColumnWidth,
  };
};
