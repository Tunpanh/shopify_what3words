import { afterEach, describe, expect, it, vi } from "vitest";
import { scheduleDebounce } from "./debounce";

describe("scheduleDebounce", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("runs callback after delay", () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    scheduleDebounce(callback, 300);

    vi.advanceTimersByTime(299);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("cancels pending callback", () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    const cancel = scheduleDebounce(callback, 300);
    cancel();

    vi.advanceTimersByTime(300);
    expect(callback).not.toHaveBeenCalled();
  });
});
