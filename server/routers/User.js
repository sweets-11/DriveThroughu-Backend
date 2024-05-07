import express from "express";
import {
  addAddress,
  generateOtp,
  login,
  logout,
  removeAddress,
  verifyUser,
  getMyProfile,
  deletionRequest,
  termsAndConditions,
} from "../controller/User.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/generateOtp").post(generateOtp); //it otp generate and register user.

router.route("/verifyUser").post(isAuthenticated, verifyUser); // verify user provided otp is correct or not

router.route("/login").post(login); // user login

router.route("/logout").get(logout); //logout the user

router.route("/newaddress").post(isAuthenticated, addAddress); // add new user address

router.route("/removeaddress").delete(isAuthenticated, removeAddress); // remove user address

router.route("/getmyprofile").post(isAuthenticated, getMyProfile);
router.route("/deletionRequest").get(deletionRequest);
router.route("/termsAndConditions").get(termsAndConditions);
export default router;
