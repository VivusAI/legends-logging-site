import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

const LS_TIMEZONE_KEY = "userProfileTimezone";

export const useProfileTimezone = (): [
  string | null,
  Dispatch<SetStateAction<string | null>>,
] => {
  const [timezone, setTimezone] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(LS_TIMEZONE_KEY);
    if (stored) {
      setTimezone(stored);
    }
  }, []);

  useEffect(() => {
    if (timezone?.trim()) {
      window.localStorage.setItem(LS_TIMEZONE_KEY, timezone);
    }
  }, [timezone]);

  return [timezone, setTimezone];
};
