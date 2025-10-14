import type { Event, Referral } from "../types/referral.js";
import { AppError } from "./AppError.js";
import { fetchData } from "./fetchData.js";
import filterUniqueEvent from "./filterUniqueEvent.js";
import timestampToDate from "./timestampToDate.js";
import pLimit from "p-limit";

const limit = pLimit(10);

export const fetchEvents = async (
  referrals: Referral[],
  refreshToken: string
) => {
  const tasks = referrals.map((ref) =>
    limit(async () => {
      const url = `https://referralmanager.churchofjesuschrist.org/services/progress/timeline/${ref.personGuid}`;
      const response = await fetchData(url, refreshToken);
      if (!response.ok) {
        throw new AppError(response.statusText, 502, { at: "fetchEvents" });
      }
      const events = (await response.json()) as Event[];
      const referralDate =
        events.find((event) => event.timelineItemType === "NEW_REFERRAL")
          ?.itemDate || ref.createDate;

      const { eventDays: inPersonSet, filtered: inPersonEvents } =
        filterUniqueEvent(
          events.filter(
            (event) =>
              event.contactTypeCode === "PERSON" &&
              event.itemDate > referralDate
          )
        );
      const { eventDays: notInPersonSet, filtered: notInPersonEvents } =
        filterUniqueEvent(
          events.filter(
            (event) =>
              event.contactTypeCode !== "PERSON" &&
              event.itemDate > referralDate
          )
        );
      const filteredEvents = inPersonEvents.slice(0, 2);
      notInPersonEvents.forEach((event) => {
        const date = timestampToDate(event.itemDate);
        if (!inPersonSet.has(date)) {
          filteredEvents.push(event);
        }
      });
      const filteredKeys = new Set(
        filteredEvents.map((event) => timestampToDate(event.itemDate))
      );
      const filteredEventsCopy = filteredEvents.slice();
      filteredEventsCopy.forEach((event) => {
        const date = timestampToDate(event.itemDate);
        if (!filteredKeys.has(date)) {
          filteredEvents.push(event);
        }
      });
      // remove unreported events
      const reportedEvents = filteredEvents.filter(
        (event) => event.eventStatus !== null
      );

      // return referral with added data (events)
      return {
        ...ref,
        lastEvent: Math.max(...reportedEvents.map((event) => event.itemDate)),
        events: reportedEvents,
        referralDate,
      };
    })
  );

  const results = await Promise.all(tasks);
  return results;
};
