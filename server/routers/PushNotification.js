import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  saveFcmToken,
  sendNotification,
} from "../controller/FirebaseNotifications.js";

const router = express.Router();

router.route("/registerFcmToken").post(isAuthenticated, saveFcmToken);

export default router;
