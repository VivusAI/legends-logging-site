"use client";

import {
  addDays,
  endOfDay,
  format,
  startOfDay,
  subDays,
  subHours,
  subMinutes,
} from "date-fns";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { CalendarIcon, CheckIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { type DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
//import { ExportLogsDrawer } from "./ExportLogsDrawer";
//import { LogsColumnsSettingsDropdown } from "./LogsColumnsSettingsDropdown";
//import { AutoRefresh } from "./auto-refresh";
import { useLocation, useSearchParams } from "react-router";

dayjs.extend(utc);
dayjs.extend(timezone);

enum TimeDuration {
  Minutes,
  Hours,
  Days,
}

interface TimeOption {
  label: string;
  type: TimeDuration;
  duration: number;
}

const TIME_OPTIONS: TimeOption[] = [
  {
    label: "5 mins",
    type: TimeDuration.Minutes,
    duration: 5,
  },
  {
    label: "15 mins",
    type: TimeDuration.Minutes,
    duration: 15,
  },
  {
    label: "30 mins",
    type: TimeDuration.Minutes,
    duration: 30,
  },
  {
    label: "1 hr",
    type: TimeDuration.Hours,
    duration: 1,
  },
  {
    label: "3 hrs",
    type: TimeDuration.Hours,
    duration: 3,
  },
  {
    label: "6 hrs",
    type: TimeDuration.Hours,
    duration: 6,
  },
  {
    label: "1 day",
    type: TimeDuration.Days,
    duration: 1,
  },
  {
    label: "2 days",
    type: TimeDuration.Days,
    duration: 2,
  },
  {
    label: "7 days",
    type: TimeDuration.Days,
    duration: 7,
  },
  {
    label: "15 days",
    type: TimeDuration.Days,
    duration: 15,
  },
  {
    label: "30 days",
    type: TimeDuration.Days,
    duration: 30,
  },
  {
    label: "60 days",
    type: TimeDuration.Days,
    duration: 60,
  },
  {
    label: "90 days",
    type: TimeDuration.Days,
    duration: 90,
  },
];

export const LogsFilter = ({
  levels,
}: {
  levels: string[] | null | undefined;
  organizationId: string | undefined;
}) => {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState<TimeOption | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();

  const hasRange = searchParams?.has("from") && searchParams?.has("to");
  const hasLevel = searchParams?.has("level");
  const urlLevel = searchParams?.get("level");

  const [selectedDays, setSelectedDays] = useState<DateRange | undefined>(
    hasRange
      ? {
          from: new Date(searchParams?.get("from") ?? Date.now()),
          to: new Date(searchParams?.get("to") ?? addDays(Date.now(), 1)),
        }
      : {
          from: new Date(Date.now()),
          to: new Date(addDays(Date.now(), 1)),
        },
  );

  const [selectedValues, setSelectedValues] = useState<string[]>(
    hasLevel && urlLevel ? urlLevel.split(",") : [],
  );

  const handleRangeChange = (range: DateRange | undefined) => {
    setSelectedDays(range);

    const params = new URLSearchParams(searchParams);

    if (range?.from && range?.to) {
      params.set("from", range.from.toUTCString());
      params.set("to", range.to.toUTCString());
    } else {
      params.delete("from");
      params.delete("to");
    }

    setSearchParams(params);
  };

  const handleChangeDuration = ({ type, duration, label }: TimeOption) => {
    const params = new URLSearchParams(searchParams);
    const now = new Date();

    setSelectedDays({
      from: undefined,
      to: undefined,
    });

    switch (type) {
      case TimeDuration.Minutes: {
        const rangeMinutes = subMinutes(now, duration);

        params.set("from", rangeMinutes.toUTCString());
        params.set("to", new Date().toUTCString());

        setDuration({ type, duration, label });
        setSearchParams(params);
        break;
      }
      case TimeDuration.Hours: {
        const rangeHours = subHours(now, duration);

        params.set("from", rangeHours.toUTCString());
        params.set("to", new Date().toUTCString());

        setDuration({ type, duration, label });
        setSearchParams(params);
        break;
      }
      case TimeDuration.Days: {
        const rangeDays = subDays(now, duration);

        params.set("from", rangeDays.toUTCString());
        params.set("to", new Date().toUTCString());

        setDuration({ type, duration, label });
        setSearchParams(params);
        break;
      }
    }
  };

  const handleItemSelect = (value: string) => {
    const params = new URLSearchParams(searchParams);
    const isSelect = selectedValues.includes(value);

    if (isSelect) {
      setSelectedValues((prev) => [...prev.filter((v) => v !== value)]);

      const cpLevels = [...selectedValues];
      const newLevels = cpLevels.filter((v) => v !== value);

      if (newLevels.length === 0) {
        params.delete("level");
      } else {
        params.set("level", newLevels.join(","));
      }
    } else {
      setSelectedValues((prev) => [...prev, value]);

      const cpLevels = [...selectedValues];
      const newLevels = [...cpLevels, value];

      params.set("level", newLevels.join(","));
    }

    setSearchParams(params);
  };

  useEffect(() => {
    if (duration) return;

    const params = new URLSearchParams(searchParams);

    if (selectedDays?.from && selectedDays?.to) {
      params.set("from", startOfDay(selectedDays.from).toUTCString());
      params.set("to", endOfDay(selectedDays.to).toUTCString());
    } else {
      params.delete("from");
      params.delete("to");
    }

    setSearchParams(params);
  }, [pathname, searchParams, selectedDays, duration, setSearchParams]);

  return (
    <div className="mb-2 flex items-center justify-between">
      <div className="flex items-center justify-between space-x-4">
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <span>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                </span>
                {duration
                  ? duration.label
                  : selectedDays?.from && selectedDays?.to
                    ? `${format(selectedDays.from, "PP")} - ${format(
                        selectedDays.to,
                        "PP",
                      )}`
                    : "Select date range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="grid grid-cols-3 gap-3 p-2">
                {TIME_OPTIONS.map((time) => {
                  const isActive = duration?.label === time.label;

                  return (
                    <Button
                      size="sm"
                      variant="outline"
                      key={time.label}
                      className={cn(isActive && "bg-accent")}
                      onClick={() => handleChangeDuration(time)}
                    >
                      {time.label}
                    </Button>
                  );
                })}
              </div>
              <Calendar
                mode="range"
                initialFocus
                selected={selectedDays}
                onSelect={(e) => handleRangeChange(e)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                {selectedValues ? (
                  <div className="flex space-x-2">
                    <>+ Set level</>
                    <div className="ml-2 flex space-x-2">
                      {selectedValues.map((value) => (
                        <Badge variant="secondary" key={value}>
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>+ Set level</>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" side="bottom" align="start">
              <Command>
                <CommandInput placeholder="Change level..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {levels?.map((level: string) => {
                      const isSelected = selectedValues.includes(level);

                      return (
                        <CommandItem
                          key={level}
                          onSelect={(value) => {
                            handleItemSelect(value);
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible",
                            )}
                          >
                            <CheckIcon className={cn("h-4 w-4")} />
                          </div>
                          <span>{level}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="flex flex-row gap-1">
        {/*<AutoRefresh />*/}
        {/*<ExportLogsDrawer teamId={teamId} />*/}
        {/*<LogsColumnsSettingsDropdown />*/}
      </div>
    </div>
  );
};
