import express from "express";
import {
  login,
  singUp,
  logout,
  verifyCustomerAgent,
  getUser,
} from "../controller/Customer-care.js";
import { isAuthenticatedCustomerAgent } from "../middleware/auth.js";
import { isAuthenticated } from "../middleware/authv2.js";
const router = express.Router();

router.route("/login").post(login); // user login

router.route("/signup").post(singUp); //logout the user

router.route("/logout").get(logout); //logout the user

router.route("/getuser").get(isAuthenticatedCustomerAgent, getUser);

router
  .route("/verifyCustomerCare")
  .post(isAuthenticatedCustomerAgent, verifyCustomerAgent); //logout the user

export default router;
