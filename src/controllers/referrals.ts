import type { Request, Response } from "express";
import { fetchData } from "../libs/fetchData.js";
import { AppError } from "../libs/AppError.js";
import type { Referral, Event } from "../types/referral.js";
import timestampToDate from "../libs/timestampToDate.js";
import filterUniqueEvent from "../libs/filterUniqueEvent.js";
import pLimit from "p-limit";

/**
 * GET /referrals/uncontacted/all
 */

const limit = pLimit(10);

const fetchEvents = async (referrals: Referral[], refreshToken: string) => {
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

      return {
        ...ref,
        lastEvent: Math.max(...filteredEvents.map((event) => event.itemDate)),
        events: filteredEvents,
        referralDate,
      };
    })
  );

  const results = await Promise.all(tasks);
  return results;
};

export async function getAllUncontactedReferrals(req: Request, res: Response) {
  const { refreshToken, missionId } = req.query;

  if (typeof refreshToken !== "string" || typeof missionId !== "string") {
    throw new AppError("Missing Params Error", 400, {
      refreshToken: refreshToken,
      missionId: missionId,
    });
  }

  const url = `https://referralmanager.churchofjesuschrist.org/services/people/mission/${missionId}`;
  const response = await fetchData(url, refreshToken);
  if (!response.ok) {
    throw new AppError(response.statusText, 502, { at: url });
  }
  const data = (await response.json()) as {
    persons: Referral[];
  };
  const uncontacted = data.persons.filter(
    (ref) =>
      ref.areaId &&
      (ref.referralStatusId === 10 || ref.referralStatusId === 20) &&
      ref.personStatusId !== 40 &&
      !ref.baptismDate
  );

  const uncontactEvents = await fetchEvents(uncontacted, refreshToken);

  return res.status(200).json(
    uncontactEvents.map((ref) => {
      return {
        id: ref.personGuid,
        zone: ref.zoneName,
        district: ref.districtName,
        teaching_area: ref.areaName,
        referral_name: ref.lastName
          ? `${ref.firstName} ${ref.lastName} `
          : ref.firstName,
        create_date: timestampToDate(ref.referralDate),
        total_events: ref.events.length,
        in_person_events: ref.events.filter(
          (event) => event.contactTypeCode === "PERSON"
        ).length,
        last_event: timestampToDate(ref.lastEvent),
      };
    })
  );
}
