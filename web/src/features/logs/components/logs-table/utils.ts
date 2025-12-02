import { Log } from "@/typings/logs";
import { Cell, Header } from "@tanstack/react-table";

export function findCustomColumns(
  headers: Header<Log, unknown>[] | Cell<Log, unknown>[],
) {
  return headers.filter(
    (h) => !["level", "timestamp", "data", "showRawData"].includes(h.id),
  );
}
