import { CustomerCare } from "../models/customerCare.js";
import jwt from "jsonwebtoken";
import { getConfig } from "../config.js";

const config = getConfig();

export const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ success: false, message: "Token not found" });
  }
  const decoded = jwt.verify(token, "adajdbjfyuttgtahahhhahhahhao");

  req.customer = await CustomerCare.findById(decoded.id);

  next();
};
