import type { Event, Lesson, Referral } from "../types/referral.js";
import { AppError } from "./AppError.js";
import { fetchData } from "./fetchData.js";
import pLimit from "p-limit";

const limit = pLimit(30);

/**
 * Fetch phone number for referrals in batches to avoid memory overload
 */
export const fetchPhoneNumber = async (
  referrals: Referral[],
  refreshToken: string,
  batchSize = 100 // process 100 referrals at a time
): Promise<Referral[]> => {
  const results: Referral[] = [];

  for (let i = 0; i < referrals.length; i += batchSize) {
    const batch = referrals.slice(i, i + batchSize);
    console.log(`batch = ${i}`);

    // Map batch to limited tasks
    const tasks = batch.map((ref, index) =>
      limit(async () => {
        console.log(`count = ${index}`);
        const url = `https://referralmanager.churchofjesuschrist.org/services/people/${ref.personGuid}`;
        try {
          const response = await fetchData(url, refreshToken);
          if (!response.ok) {
            const text = await response.text();
            throw new AppError(
              `Failed to fetch phone number for ${ref.personGuid}. HTTP ${
                response.status
              } — ${text?.slice(0, 200) ?? "no body"}`,
              502,
              { at: "fetchPhoneNumber" }
            );
          }

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            throw new AppError(
              `Expected JSON but got "${contentType}" for ${
                ref.personGuid
              }. Body starts with: ${text?.slice(0, 200)}`,
              502,
              { at: "fetchPhoneNumber" }
            );
          }

          const data = await response.json();
          const phoneNumber =
            data?.person?.contactInfo?.phoneNumbers[0]?.number;

          return { ...ref, phoneNumber };
        } catch (err) {
          console.error(
            `Error fetching phone numbers for ${ref.personGuid}:`,
            err
          );
          // Return referral without phone number to avoid stopping the batch
          return { ...ref, phoneNumber: "" };
        }
      })
    );

    // Wait for batch to complete before moving to next batch
    const batchResults = await Promise.all(tasks);
    results.push(...batchResults);
  }

  return results;
};
