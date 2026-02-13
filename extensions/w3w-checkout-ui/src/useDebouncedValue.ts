import { useEffect, useState } from "react";
import { scheduleDebounce } from "./debounce";

export function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    return scheduleDebounce(() => setDebouncedValue(value), delayMs);
  }, [value, delayMs]);

  return debouncedValue;
}
