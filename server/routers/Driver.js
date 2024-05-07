import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { uploadImage } from "../middleware/uploadImage.js";
import {
  driverLocationSocketUpdate,
  getNearByDrivers,
  imageUpload,
  driverReached,
  driverAssigned,
  getDriverLocation,
  driverUpdateLocation,
  verifyOtp,
  didUserPay,
  updateVehicleInfo,
  updateDriverStatus,
} from "../controller/Driver.js";

const router = express.Router();

router
  .route("/driverLocationSocket")
  .post(isAuthenticated, driverLocationSocketUpdate);

router
  .route("/driverUpdateLocation")
  .post(isAuthenticated, driverUpdateLocation);

router.route("/getNearByDrivers").post(isAuthenticated, getNearByDrivers);

router
  .route("/imageUpload")
  .post(isAuthenticated, uploadImage.array("files", 5), imageUpload);

router.route("/didDriverStartDelivery").post(isAuthenticated, driverReached);

router.route("/didDriverAccept").post(isAuthenticated, driverAssigned);

router.route("/getDriverLocation").post(isAuthenticated, getDriverLocation);

router.route("/didUserPay").post(didUserPay);
router.route("/verifyOtp").post(isAuthenticated, verifyOtp);

router.route("/updateVehicleInfo").post(isAuthenticated, updateVehicleInfo);
router.route("/updateDriverStatus").post(isAuthenticated, updateDriverStatus);

export default router;
