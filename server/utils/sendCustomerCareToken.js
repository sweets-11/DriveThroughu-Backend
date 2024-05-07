import { getConfig } from "../config.js";

const config = getConfig();

export const sendCustomerCareToken = (res, customer, statusCode, message) => {
  const token = customer.getJWTToken();

  const customerData = {
    _id: customer._id,
    fullName: customer.fullName,
    email: customer.email,
    mobileNumber: customer.mobileNumber,
    address: customer.address,
    dob: customer.dob,
  };

  const options = {
    httpOnly: true,
    expires: new Date(Date.now() + 100 * 24 * 60 * 60 * 300),
    secure: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, message, customer: customerData, token: token });
};
