import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  stripePayment,
  stripeWebhook,
  stripeRefund,
  ConnectAcc,
  transferFund,
  onBoardingReturnUrl,
  onBoardingRefreshUrl,
  verifyOnboarding,
  transferData,
  payoutData,
  payoutPaid,
  transferFundUpdated
} from "../controller/Stripe.js";

const router = express.Router();

router.route("/processPayment").post(isAuthenticated, stripePayment);
router.route("/postwebhook").post(stripeWebhook);
router.route("/payoutPaid").post(payoutPaid);
router.route("/stripeRefund").post(isAuthenticated, stripeRefund);
router.route("/connectAcc").post(isAuthenticated, ConnectAcc);
router.route("/transferFund").get(transferFund);
router.route("/return").get(onBoardingReturnUrl);
router.route("/reauth").get(onBoardingRefreshUrl);
router.route("/verifyOnboarding").post(isAuthenticated, verifyOnboarding);
router.route("/transferData").post(isAuthenticated, transferData);
router.route("/payoutData").post(isAuthenticated ,payoutData);
router.route("/transferFundUpdated").post(isAuthenticated, transferFundUpdated);

export default router;
