import { DriversLocation } from "../models/driverLocation.js";
import { Trips } from "../models/trips.js";
import { uploadImage } from "../middleware/uploadImage.js";
import { User } from "../models/users.js";
import { Status } from "./Trips.js";
//updating socket id

export const driverLocationSocketUpdate = async (req, res) => {
  try {
    var io = req.app.io;
    if (!req.body) {
      res.status(400);
      res.json({
        error: "Bad data",
      });
      const { driverId } = req.body.driverId;

      const driverLocation = await DriversLocation.findById(driverId);

      driverLocation.socketId = req.body.socketId;

      let updatedLocation = await driverLocation.save();

      if (!updatedLocation) {
        res
          .status(500)
          .json({ success: false, message: "Location not updated" });
      } else {
        res.status(200).json({
          success: true,
          message: "Socket ID Updated Successfully",
          updatedLocation,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//get nearby driver
export const getNearByDrivers = async (req, res) => {
  try {
    const { longitude, latitude, tripId } = req.body; // User's current location
    const trip = await Trips.findById(tripId);
    console.log("nearestDriverstrip", trip);
    let drivers = [];
    let nearestDrivers = await DriversLocation.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: 50000, // Search within a 5 km radius (adjust as needed)
        },
      },
    });
    if (!nearestDrivers) {
      res
        .status(500)
        .json({ success: false, message: "No Drivers Near By Try Again" });
    } else {
      drivers = nearestDrivers.filter((nearestDriver) => {
        return (
          nearestDriver.isUberDriver &&
          nearestDriver.vehicleType === trip.vehicleType
        );
      });

      res.status(200).json({
        success: true,
        message: "list of near by drivers",
        drivers,
        driversCount: drivers.length,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Get Single Driver and emit track by user to driver

export const trackDriverLocation = async (req, res) => {
  try {
    var io = req.app.io;
    let location = await DriversLocation.findOne({ driverId: req.params.id });

    if (!location) {
      res.status(400).json({ success: false, message: "Driver Not Found" });
    } else {
      res.status(500).json({
        success: true,
        message: "Tracking Driver",
        location: location,
      });
      io.emit("trackDriver", location);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Update Location by driver to user

export const driverUpdateLocation = async (req, res) => {
  try {
    var location = req.body.location;
    var latitude = Number(location.latitude);
    var longitude = Number(location.longitude);
    if (!location) {
      res.status(400);
      res.json({
        error: "Bad Data",
      });
    } else {
      let driverLocation = await DriversLocation.findOne({
        driverId: req.user._id,
      });
      console.log("user id", typeof req.user._id);
      console.log(driverLocation);
      driverLocation.currentLocation = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
      console.log(driverLocation);
      await driverLocation.save();

      if (!driverLocation) {
        res.status(400).json({ success: false, message: "Record not found" });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Location updated sucessfully" });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//upload Image
export const imageUpload = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let data = {};
    data = req.files;

    uploadImage.single("file");

    if (req.file) {
      data.image = req.file.location;
    }

    const columnNameMapping = {
      "driver.png": "driver",
      "drivingLicense.png": "drivingLicense",
      "numberPlate.png": "vehicleNumberPlate",
      "vehicle.png": "vehicleImage",
      "driver.jpg": "driver",
      "drivingLicense.jpg": "drivingLicense",
      "numberPlate.jpg": "vehicleNumberPlate",
      "vehicle.jpg": "vehicleImage",
      "driver.jpeg": "driver",
      "drivingLicense.jpeg": "drivingLicense",
      "numberPlate.jpeg": "vehicleNumberPlate",
      "vehicle.jpeg": "vehicleImage",
    };

    data.forEach(async (imageInfo) => {
      const { originalname, location } = imageInfo;
      var columnName = columnNameMapping[originalname];

      if (columnName) {
        let regex = new RegExp(/\.[^/.]+$/);
        let UpdatedfileName = originalname.replace(regex, "");

        switch (UpdatedfileName) {
          case "vehicle":
            user.driverVehicleDetails.vehicleImage.public_Id =
              req.user.id + "." + UpdatedfileName;
            user.driverVehicleDetails.vehicleImage.url = location;
            break;
          case "numberPlate":
            user.driverVehicleDetails.numberPlate.url =
              req.user.id + "." + UpdatedfileName;
            user.driverVehicleDetails.numberPlate.url = location;

            break;
          case "driver":
            user.driverProfilePicture.public_Id =
              req.user.id + "." + UpdatedfileName;
            user.driverProfilePicture.url = location;

            break;
          case "drivingLicense":
            user.driverDrivingLicense.public_Id =
              req.user.id + "." + UpdatedfileName;
            user.driverDrivingLicense.url = location;

            break;
        }
      } else {
        console.error(`No mapping found for ${originalname}.`);
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: "Image Uploaded Successfully",
      data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//verify OTP
export const verifyOtp = async (req, res) => {
  const { OTP, tripId } = req.body;
  try {
    if (!OTP || !tripId) {
      res.status(400).json({
        success: false,
        message: "Invalid request. OTP and tripId are required.",
      });
    }
    const trip = await Trips.findById(tripId);

    if (!trip) {
      res.status(404).json({
        success: false,
        message: "Trip not found with the provided tripId.",
      });
    }
    if (OTP === trip.otp) {
      trip.didDriverVerifyOtp = true;
      await trip.save();
      res.status(200).json({
        success: true,
        message: "OTP verified successfully!",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid OTP!",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Driver reaching Pickup location

export const driverReached = async (req, res) => {
  try {
    const { tripId } = req.body;
    let trip = await Trips.findOne({
      _id: tripId,
    });

    if (
      trip &&
      (trip.tripStatus === Status[700] ||
        trip.tripStatus === Status[800] ||
        trip.tripStatus === Status[900])
    ) {
      res.status(200).json({
        success: true,
        message: "Driver Started Delivery",
        deliveryStarted: true,
      });
    } else {
      res
        .status(200)
        .json({ deliveryStarted: false, message: "Driver Not started Trip" });
    }
  } catch (error) {
    res
      .status(404)
      .json({ success: false, message: error.message, deliveryStarted: false });
  }
};

export const driverAssigned = async (req, res) => {
  try {
    const { tripId } = req.body;

    const trip = await Trips.findById(tripId);
    var driverId = null;
    if (trip && trip.tripStatus !== Status[0]) {
      driverId = trip.driverId;
      var driverInfo = await User.find({
        _id: driverId,
      });
      var driverLocation = await DriversLocation.find({
        driverId: driverId,
      });
      res.status(200).json({
        success: true,
        message: "Driver Found",
        driverInfo: { ...driverInfo, ...driverLocation },
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Driver Not Found",
        driverInfo: null,
      });
    }
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const getDriverLocation = async (req, res) => {
  try {
    const { tripId } = req.body;
    var driverId = "";
    let trip = await Trips.findOne({
      _id: tripId,
    });

    driverId = trip.driverId;

    let driver = await DriversLocation.findOne({
      driverId: driverId,
    });

    if (driver) {
      res.status(200).json({
        success: true,
        location: driver.currentLocation,
      });
    } else {
      res.status(400).json({
        success: false,
      });
    }
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const didUserPay = async (req, res) => {
  try {
    const { tripId } = req.body;

    const trip = await Trips.findOne({ _id: tripId });

    if (!trip) {
      return res.status(400).json({
        success: false,
        message: "No Trip Found",
      });
    } else {
      if (trip.userPaid === true) {
        return res.status(200).json({
          success: true,
          message: "User Paid",
        });
      } else {
        return res.status(200).json({
          success: false,
          message: "User has not Paid",
        });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVehicleInfo = async (req, res) => {
  const driver = await User.findById(req.user._id);
  const { vehicleType, isUberDriver } = req.body;
  try {
    if (!driver) {
      res.status(404).json({ message: "Driver not found" });
    }
    let driverInfo = await DriversLocation.findOne({ driverId: driver._id });
    if (driverInfo) {
      driverInfo.vehicleType = vehicleType;
      driverInfo.isUberDriver = isUberDriver;
      await driverInfo.save();
      res
        .status(200)
        .json({ message: "Vehicle type updated successfully", driverInfo });
    } else {
      res.status(404).json({ message: "Driver not found" });
    }
  } catch (error) {
    // Handle server errors
    console.error("Error updating vehicle info:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateDriverStatus = async (req, res) => {
  try {
    const { driverStatus } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.isDriverModeOn = driverStatus;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Driver Status Updated", user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
