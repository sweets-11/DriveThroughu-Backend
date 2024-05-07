import express from "express";
import {
  saveTripRequest,
  getAllTrips,
  updateTripStatus,
  calculateTripFare,
  updateDriverTripStatus,
  pastCompledtedTrips,
  pastCompledtedOrders,
  getTrip,
  extraHoursAdd,
} from "../controller/Trips.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/saveTripRequest").post(isAuthenticated, saveTripRequest);

router.route("/getAllTrips").post(isAuthenticated, getAllTrips);

router.route("/updateTripStatus").post(isAuthenticated, updateDriverTripStatus);

router.route("/calculateTripFare").post(isAuthenticated, calculateTripFare);

router.route("/getDriverPastTrips").post(isAuthenticated, pastCompledtedTrips);

router.route("/getUserPastOrders").post(isAuthenticated, pastCompledtedOrders);

router.route("/getTrip").post(isAuthenticated, getTrip);
router.route("/extraHoursAdd").post(isAuthenticated, extraHoursAdd);

export default router;
