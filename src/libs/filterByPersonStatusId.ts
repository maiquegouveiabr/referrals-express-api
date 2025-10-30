import type { Referral } from "../types/referral.js";

export const filterByPersonStatusId = (
  persons: Referral[],
  personStatusId: number
) => {
  return persons.filter((ref) => ref.personStatusId === personStatusId);
};
