import type { Event } from "../types/referral";
import timestampToDate from "./timestampToDate";

export default (events: Event[]) => {
  const eventDays = new Set<string>();
  const filtered = events.filter(({ itemDate }) => {
    const dayKey = timestampToDate(itemDate - 3 * 60 * 60 * 1000);
    if (eventDays.has(dayKey)) return false;
    eventDays.add(dayKey);
    return true;
  });
  return { eventDays, filtered };
};
