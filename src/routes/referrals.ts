import { Router } from "express";
import { getAllUncontactedReferrals } from "../controllers/referrals.js";

const router = Router();

router.get("/uncontacted/all", getAllUncontactedReferrals);

export default router;
