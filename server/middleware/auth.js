import jwt from "jsonwebtoken";
import { CustomerCare } from "../models/customerCare.js";
import { User } from "../models/users.js";
import { getConfig } from "../config.js";

const config = getConfig();

export const isAuthenticated = async (req, res, next) => {
  try {
    const bearerHeader = req.headers["authorization"];
    if (!bearerHeader) {
      return res
        .status(401)
        .json({ success: false, message: "Token not found" });
    }
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Login to access these resource" });
    }
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = await User.findById(decoded._id);
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const isAuthenticatedCustomerAgent = async (req, res, next) => {
  console.log("Called");
  try {
    const bearerHeader = req.headers["authorization"];
    console.log(bearerHeader);
    if (!bearerHeader) {
      return res
        .status(401)
        .json({ success: false, message: "Token not found" });
    }
    const bearer = bearerHeader.split(" ");
    const token = bearer[1];

    if (token == null) {
      return res
        .status(401)
        .json({ success: false, message: "Token not found" });
    }

    const decoded = jwt.verify(token, config.CUSTOMER_JWT_SECRET);
    console.log("jwt :", config.CUSTOMER_JWT_SECRET);
    req.customer = await CustomerCare.findById(decoded._id);
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
