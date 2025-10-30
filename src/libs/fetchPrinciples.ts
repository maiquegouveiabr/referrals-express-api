import type { Event, Lesson, Referral } from "../types/referral.js";
import { AppError } from "./AppError.js";
import { fetchData } from "./fetchData.js";
import pLimit from "p-limit";

const limit = pLimit(30);

/**
 * Fetch principles for referrals in batches to avoid memory overload
 */
export const fetchPrinciples = async (
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
        const url = `https://referralmanager.churchofjesuschrist.org/services/progress/principles/person/${ref.personGuid}`;
        try {
          const response = await fetchData(url, refreshToken);
          if (!response.ok) {
            const text = await response.text();
            throw new AppError(
              `Failed to fetch principles for ${ref.personGuid}. HTTP ${
                response.status
              } — ${text?.slice(0, 200) ?? "no body"}`,
              502,
              { at: "fetchPrinciples" }
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
              { at: "fetchPrinciples" }
            );
          }

          const lessons = (await response.json()) as Lesson[];

          return { ...ref, lessons };
        } catch (err) {
          console.error(
            `Error fetching principles for ${ref.personGuid}:`,
            err
          );
          // Return referral without events to avoid stopping the batch
          return { ...ref, lessons: [] };
        }
      })
    );

    // Wait for batch to complete before moving to next batch
    const batchResults = await Promise.all(tasks);
    results.push(...batchResults);
  }

  return results;
};
