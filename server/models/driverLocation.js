import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { getConfig } from "../config.js";

const driversLocationSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  pastLocation: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: [Number],
  },
  currentLocation: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: [Number],
  },
  name: {
    type: String,
    require: true,
  },
  vehicleModel: {
    type: String,
    require: true,
  },
  vehicleNumber: {
    type: String,
    require: true,
  },
  licenseNumber: {
    type: String,
    require: true,
  },
  vehicleType: {
    type: Number,
    require: true,
  },
  isUberDriver: {
    type: Boolean,
    default: false
  }
});

driversLocationSchema.index({ currentLocation: "2dsphere" });

export const DriversLocation = mongoose.model(
  "DriversLocation",
  driversLocationSchema
);
