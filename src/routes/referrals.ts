import { Router } from "express";
import {
  getAllTest,
  getAllUncontactedReferrals,
} from "../controllers/referrals.js";

const router = Router();

router.get("/uncontacted/all", getAllUncontactedReferrals);
router.get("/test", getAllTest);

export default router;
