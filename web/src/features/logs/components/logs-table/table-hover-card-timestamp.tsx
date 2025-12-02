import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { UTCDate } from "@date-fns/utc";
import { HoverCardPortal } from "@radix-ui/react-hover-card";
import { format, formatDistanceToNowStrict } from "date-fns";
import type { ComponentPropsWithoutRef } from "react";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useProfileTimezone } from "@/hooks/use-profile-timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type HoverCardContentProps = ComponentPropsWithoutRef<typeof HoverCardContent>;

interface LogsTableColumnTimestampProps {
  date: string;
  side?: HoverCardContentProps["side"];
  sideOffset?: HoverCardContentProps["sideOffset"];
  align?: HoverCardContentProps["align"];
  alignOffset?: HoverCardContentProps["alignOffset"];
  className?: string;
}

export function LogsTableColumnTimestamp({
  date,
  side = "right",
  align = "start",
  alignOffset = -4,
  sideOffset,
  className,
}: LogsTableColumnTimestampProps) {
  const [profileTz] = useProfileTimezone();
  const fallbackTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezone = profileTz ?? fallbackTimezone;

  const realDate = dayjs.utc(date).tz(timezone);
  const formattedDate = realDate.format("MMM DD, HH:mm:ss");

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        <div className={cn("whitespace-nowrap font-mono text-xs", className)}>
          {formattedDate}
        </div>
      </HoverCardTrigger>
      {/* REMINDER: allows us to port the content to the document.body, which is helpful when using opacity-50 on the row element */}
      <HoverCardPortal>
        <HoverCardContent
          className="z-10 w-auto p-2"
          {...{ side, align, alignOffset, sideOffset }}
        >
          <dl className="flex flex-col gap-1">
            <Row
              value={String(realDate.toDate().getTime())}
              label="Timestamp"
            />
            <Row
              value={format(new UTCDate(realDate.toDate()), "LLL dd, HH:mm:ss")}
              label="UTC"
            />
            <Row value={formattedDate} label={timezone} />
            <Row
              value={formatDistanceToNowStrict(realDate.toDate(), {
                addSuffix: true,
              })}
              label="Relative"
            />
          </dl>
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCard>
  );
}

function Row({ value, label }: { value: string; label: string }) {
  //const { copy, isCopied } = useCopyToClipboard();

  return (
    <div
      className="group flex items-center justify-between gap-4 text-sm"
      onClick={(e) => {
        e.stopPropagation();
        //copy(value);
      }}
    >
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-1 truncate font-mono">
        <span className="invisible group-hover:visible">
          {/*!isCopied ? (
            <Copy className="h-3 w-3" />
          ) : (
            <Check className="h-3 w-3" />
          )*/}
        </span>
        {value}
      </dd>
    </div>
  );
}
