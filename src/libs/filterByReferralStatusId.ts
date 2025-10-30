import type { Referral } from "../types/referral.js";

export const filterByReferralStatusId = (
  persons: Referral[],
  referralStatusId: number
) => {
  return persons.filter((ref) => ref.referralStatusId === referralStatusId);
};
