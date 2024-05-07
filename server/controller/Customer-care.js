import { CustomerCare } from "../models/customerCare.js";
import { sendOtpv2 } from "../utils/sendOtp.js";
import { verifyOtpv2 } from "../utils/verifyOtp.js";
import { sendCustomerCareToken } from "../utils/sendCustomerCareToken.js";

export const singUp = async (req, res) => {
  try {
    const { fullName, mobileNumber, dob, email, address } = req.body;
    const phoneNumber = "91" + mobileNumber;

    console.log(dob);
    let customerAgent = await CustomerCare.findOne({
      mobileNumber: mobileNumber,
    });

    if (customerAgent) {
      return res.status(400).json({
        success: false,
        message: "Account Already Exists Please Login",
        login: true,
      });
    }

    try {
      sendOtpv2(phoneNumber);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
    customerAgent = await CustomerCare.create({
      fullName,
      email,
      mobileNumber: mobileNumber,
      dob: new Date(dob),
      address,
    });
    sendCustomerCareToken(
      res,
      customerAgent,
      201,
      "OTP sent to your mobile number please verify your account"
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyCustomerAgent = async (req, res) => {
  try {
    const otp = Number(req.body.otp);
    const mobileNumber = Number(req.body.mobileNumber);
    const phoneNumber = "91" + mobileNumber;

    const customerAgent = await CustomerCare.findById(req.customer._id);

    if (verifyOtpv2(phoneNumber, otp) == false) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP or has been Expired" });
    }

    customerAgent.verified = true;

    await customerAgent.save();

    sendCustomerCareToken(
      res,
      customerAgent,
      200,
      "Customer Agent Account Verified"
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    if (mobileNumber == null) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter valid mobile number" });
    }
    const phoneNumber = "91" + mobileNumber;

    const customerAgent = await CustomerCare.findOne({
      mobileNumber: mobileNumber,
    });

    if (!customerAgent) {
      return res.status(400).json({
        success: false,
        message: "It seems you doesn't have an account please Register first ",
      });
    }

    sendOtpv2(phoneNumber);

    sendCustomerCareToken(
      res,
      customerAgent,
      200,
      "OTP sent to your mobile number please verify"
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    console.log("hi");
    res.status(200).cookie("token", null, {}).json({
      success: true,
      message: "Logout Sucessfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUser = async (req, res) => {
  const customer = await req.customer;
  res.status(200).json({
    success: true,
    customer,
  });
};
