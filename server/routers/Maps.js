import express from "express";
import { nearbyPlaces, gcpDirections } from "../controller/Maps.js";
import { distanceAndTime } from "../utils/PicupToDropOff.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/nearbyPlaces").post(isAuthenticated, nearbyPlaces); // To fetch all the near located areas like bank, stores etc.
router.route("/distanceAndTime").post(isAuthenticated ,distanceAndTime); // To get the required time and distance between two locations
router.route("/directions").post(isAuthenticated, gcpDirections);
export default router;
