import type { Request, Response } from "express";
import type { Referral } from "../types/referral.js";
import { fetchData } from "../libs/fetchData.js";
import { AppError } from "../libs/AppError.js";
import timestampToDate from "../libs/timestampToDate.js";
import { fetchEvents } from "../libs/fetchEvents.js";
import { fetchEventsAll } from "../libs/fetchEventsAll.js";
import { fetchPrinciples } from "../libs/fetchPrinciples.js";
import { fetchPhoneNumber } from "../libs/fetchPhoneNumber.js";
import { formatPersonStatusId } from "../libs/formatPersonStatusId.js";
import { createExcel } from "../libs/createExcel.js";

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
        last_event: ref.lastEvent ? timestampToDate(ref.lastEvent) : "",
        source: ref.personGuid.includes("-") ? "Missionary" : "Media",
        sacrament: ref.sacrament,
        link: `https://referralmanager.churchofjesuschrist.org/person/${ref.personGuid}`,
      };
    })
  );
}

/**
 * GET /api/referrals/test
 */
export async function getAllTest(req: Request, res: Response) {
  const { refreshToken, missionId } = req.query;

  if (typeof refreshToken !== "string" || typeof missionId !== "string") {
    throw new AppError("Missing Params Error", 400, {
      refreshToken: refreshToken,
      missionId: missionId,
    });
  }

  const url = `https://referralmanager.churchofjesuschrist.org/services/people/mission/${missionId}?includeDroppedPersons=true`;
  const response = await fetchData(url, refreshToken);
  if (!response.ok) {
    throw new AppError(response.statusText, 502, { at: url });
  }
  const data = (await response.json()) as {
    persons: Referral[];
  };

  // filter the ones assigned to an area
  const assigned = data.persons.filter((ref) => ref.areaId);

  // fetch timeline events from all referrals
  const withEvents = await fetchEventsAll(
    assigned.filter(
      (ref) => ref.personStatusId !== 40 && ref.personStatusId !== 6
    ),
    refreshToken
  );

  // filter the ones who attended church at least once
  const filtered = withEvents.filter((ref) =>
    ref.events.some((event) => event.timelineItemType === "SACRAMENT")
  );

  // filter the ones who were invited to bap
  const withLessons = await fetchPrinciples(filtered, refreshToken);
  const filteredLessons = withLessons.filter(
    (ref) =>
      ref.lessons
        .flatMap((lesson) => lesson.principles)
        .find(
          (principle) => principle?.id === "01F7B5C58394796FE063B86B3D0A0799"
        )?.lastTaught
  );

  // fetch phone number
  const withPhoneNumber = await fetchPhoneNumber(filteredLessons, refreshToken);

  const formattedData = withPhoneNumber.map((ref) => {
    return {
      personGuid: ref.personGuid,
      firstName: ref.firstName,
      phoneNumber: ref.phoneNumber,
      areaName: ref.areaName,
      personStatus: formatPersonStatusId(ref.personStatusId),
      inviteDate: timestampToDate(
        Number(
          ref.lessons
            .flatMap((lesson) => lesson.principles)
            .find(
              (principle) =>
                principle?.id === "01F7B5C58394796FE063B86B3D0A0799"
            )?.lastTaught
        )
      ),
    };
  });

  createExcel(
    formattedData.map((ref) => {
      return {
        areaName: ref.areaName || "",
        firstName: ref.firstName || "",
        personGuid: ref.personGuid || "",
        personStatus: ref.personStatus || "",
        phoneNumber: ref.phoneNumber || "",
        inviteDate: ref.inviteDate,
      };
    })
  );

  return res.status(200).json({
    persons: formattedData,
    length: formattedData.length,
  });
}
