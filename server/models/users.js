import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { getConfig } from "../config.js";

const config = getConfig();

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  mobileNumber: {
    type: String,
    require: true,
  },
  dob: {
    type: Date,
    require: true,
  },
  address: [
    {
      addressTitle: String,
      house: String,
      address: {},
      coords: {},
      floor: Number,
      apartment: String,
      instructions: String,
    },
  ],

  stripeInfo: {
    stripeCustomerId: {
      type: String,
      default: "",
    },
    stripeConnectedId: {
      type: String,
      default: "",
    },
    stripeOnBoardingStatus: {
      type: String,
      enum: ["false", "initiated", "true"],
      default: "false",
    },
  },
  verified: {
    type: Boolean,
    default: false,
  },
  fcmToken: {
    type: String,
    require: true,
  },
  isDeliveryAgent: {
    type: Boolean,
    default: false,
  },
  isDriverModeOn: {
    type: Boolean,
    default: false,
  },
  driverStatus: {
    type: String,
    require: true,
  },
  driverBankDetails: {
    accountNumber: String,
    accountHolderName: String,
  },
  driverVehicleDetails: {
    vehicleName: String,
    vehicleNumber: String,
    vehicleImage: {
      public_Id: String,
      url: String,
    },
    numberPlate: {
      public_Id: String,
      url: String,
    },
  },
  driverProfilePicture: {
    public_Id: String,
    url: String,
  },
  driverDrivingLicense: {
    public_Id: String,
    url: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, config.JWT_SECRET, {
    expiresIn: 100 * 24 * 60 * 60 * 1000,
  });
};

userSchema.index({ verified: 1 }, { expireAfterSeconds: 0 });
export const User = mongoose.model("User", userSchema);
