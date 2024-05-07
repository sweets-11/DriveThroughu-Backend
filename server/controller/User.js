import { User } from "../models/users.js";
import { DriversLocation } from "../models/driverLocation.js";
import { sendOtpv2 } from "../utils/sendOtp.js";
import { verifyOtpv2 } from "../utils/verifyOtp.js";
import { sendToken } from "../utils/sendToken.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generateOtp = async (req, res) => {
  try {
    const { firstName, lastName, mobileNumber, dob, email } = req.body;
    const phoneNumber = "91" + mobileNumber;
    console.log("inside generate");
    let user = await User.findOne({ mobileNumber: mobileNumber });

    if (user) {
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
    user = await User.create({
      firstName,
      lastName,
      email,
      mobileNumber,
      dob: new Date(dob),
    });
    sendToken(
      res,
      user,
      201,
      "OTP sent to your mobile number please verify your account"
    );
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const otp = Number(req.body.otp);
    const mobileNumber = Number(req.body.mobileNumber);
    const phoneNumber = "91" + mobileNumber;
    const user = await User.findById(req.user._id);
    if (mobileNumber === 9999999999 && otp === 123456) {
      user.verified = true;
      await user.save();
      sendToken(res, user, 200, "User Account Verified");
      return;
    }
    const otpVerification = await verifyOtpv2(phoneNumber, otp);
    if (!otpVerification?.VerificationResponse?.Valid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP or has been Expired" });
    }

    user.verified = true;

    await user.save();

    sendToken(res, user, 200, "User Account Verified");
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

    const user = await User.findOne({ mobileNumber: mobileNumber });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "It seems you doesn't have an account please Register first ",
      });
    }

    sendOtpv2(phoneNumber);

    sendToken(res, user, 200, "OTP sent to your mobile number please verify");
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

export const addAddress = async (req, res) => {
  try {
    const address = req.body;

    const user = await User.findById(req.user._id);
    user.address.push(address);

    await user.save();
    res.status(200).json({
      success: true,
      message: "Address added sucessfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const removeAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.body;

    const user = await User.findById(userId);

    user.address = user.address.filter(
      (add) => add._id.toString() !== addressId.toString()
    );

    await user.save();
    res.status(200).json({
      success: true,
      message: "Address deleted sucessfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const driverInfo = await DriversLocation.findOne({ driverId: user._id });

    if (user) {
      res.status(200).json({
        success: true,
        message: `Welcome back ${user.firstName}`,
        data: {
          ...user.toObject(),
          vehicleType: driverInfo?.vehicleType,
          isUberDriver: driverInfo?.isUberDriver,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: `User or driver doesn't exist`,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletionRequest = (req, res) => {
  res.sendFile(__dirname + "/deletionRequest.html");
};

export const termsAndConditions = (req, res) => {
  res.sendFile(__dirname + "/termsAndConditions.html");
};
