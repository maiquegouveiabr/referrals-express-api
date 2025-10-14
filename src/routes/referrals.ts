import { Router, type Request, type Response } from "express";
import { getAllUncontactedReferrals } from "../controllers/referrals";

const router = Router();

router.get("/uncontacted/all", getAllUncontactedReferrals);

export default router;
