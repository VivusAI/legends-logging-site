export const LEVELS = [
  "success",
  "warning",
  "warn",
  "critical",
  "error",
] as const;

export const _LEVELS = [...LEVELS, "info"] as const;
