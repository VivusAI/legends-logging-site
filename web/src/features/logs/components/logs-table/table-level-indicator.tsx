import { _LEVELS } from "@/lib/constants/level";
import { getLevelColor } from "@/lib/logs/level";
import { cn } from "@/lib/utils";

export function TableColumnLevelIndicator({
  value,
  className,
}: {
  value: (typeof _LEVELS)[number];
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn("h-2.5 w-2.5 rounded-[2px]", getLevelColor(value).bg)}
      />
    </div>
  );
}
