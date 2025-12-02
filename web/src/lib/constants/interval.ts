export const REFRESH_INTERVALS = [
  { label: "No refresh", value: "0" },
  { label: "15 seconds", value: "15000" },
  { label: "30 seconds", value: "30000" },
  { label: "1 minute", value: "60000" },
  { label: "5 minutes", value: "300000" },
] as const;

export const VALID_INTERVALS: string[] = REFRESH_INTERVALS.map((i) => i.value);
