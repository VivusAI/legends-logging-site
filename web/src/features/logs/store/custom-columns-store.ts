import { atomWithStorage } from "jotai/utils";

const LS_CUSTOM_COLUMNS_KEY = "customLogsColumns";

export interface CustomColumn {
  name: string;
  width: number;
}

export const customColumnsAtom = atomWithStorage<CustomColumn[]>(
  LS_CUSTOM_COLUMNS_KEY,
  [],
  {
    getItem(key) {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    },
    setItem(key, newValue) {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    },
    removeItem(key) {
      window.localStorage.removeItem(key);
    },
  },
);

export const rawDataColumnAtom = atomWithStorage<boolean>(
  "rawDataColumn",
  true,
  {
    getItem(key) {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : false;
    },
    setItem(key, newValue) {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    },
    removeItem(key) {
      window.localStorage.removeItem(key);
    },
  },
);

export const rawDataColumnWidthAtom = atomWithStorage<number>(
  "rawDataColumnWidth",
  500,
  {
    getItem(key) {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : 500;
    },
    setItem(key, newValue) {
      window.localStorage.setItem(key, JSON.stringify(newValue));
    },
    removeItem(key) {
      window.localStorage.removeItem(key);
    },
  },
);
