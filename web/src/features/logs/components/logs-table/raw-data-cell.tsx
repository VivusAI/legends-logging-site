import { _LEVELS } from "@/lib/constants/level";
import { getLevelColor } from "@/lib/logs/level";
import { cn } from "@/lib/utils";
import { Log } from "@/typings/logs";
import { CellContext } from "@tanstack/react-table";

export function RawDataCell(info: CellContext<Log, unknown>) {
  const data = info.row.original;
  const metadata = data.Metadata as unknown as Record<string, unknown>;

  if (!metadata || typeof metadata !== "object") {
    return <div className="text-xs text-wrap font-logs">null</div>;
  }

  const formatJsonWithBoldKeys = (obj: Record<string, unknown>) => {
    const entries = Object.entries(obj).sort(([a], [b]) => a.localeCompare(b));
    if (entries.length === 0) return "{}";

    const level = info.row.original.Metadata[
      "severity"
    ] as (typeof _LEVELS)[number];

    const isError = info.row.original.Metadata["severity"] === "error";

    return (
      <>
        {entries.map(([key, value], index) => (
          <span key={key}>
            <span
              className={cn("font-bold", isError && getLevelColor(level).text)}
            >
              &quot;{key}&quot;
            </span>
            : {JSON.stringify(value)}
            {index < entries.length - 1 ? ", " : ""}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="text-xs text-wrap font-logs font-normal text-logs-text break-words">
      {formatJsonWithBoldKeys(metadata)}
    </div>
  );
}
