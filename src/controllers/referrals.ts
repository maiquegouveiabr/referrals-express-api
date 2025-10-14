import type { Request, Response } from "express";
import type { Referral } from "../types/referral.js";
import { fetchData } from "../libs/fetchData.js";
import { AppError } from "../libs/AppError.js";
import timestampToDate from "../libs/timestampToDate.js";
import { fetchEvents } from "../libs/fetchEvents.js";

/**
 * GET /api/referrals/uncontacted/all
 */

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
