import mongoose from "mongoose";

import jwt from "jsonwebtoken";
import { getConfig } from "../config.js";

const config = getConfig();

const customerCare = new mongoose.Schema({
  user: {
    type: String,
    enum: ["admin", "normal"],
    default: "normal",
  },
  fullName: {
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
  address: String,
  verified: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

customerCare.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, config.CUSTOMER_JWT_SECRET, {
    expiresIn: 100 * 24 * 60 * 60 * 1000,
  });
};

export const CustomerCare = mongoose.model("CustomerCare", customerCare);
