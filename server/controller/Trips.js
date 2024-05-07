import { Trips } from "../models/trips.js";
import { User } from "../models/users.js";
import { DriversLocation } from "../models/driverLocation.js";
import { pickupToDropOff } from "../utils/PicupToDropOff.js";
import { stripe } from "../server.js";
import { sendNotification } from "./FirebaseNotifications.js";
import {
  saveTripNotification,
  updateDriverTripStatusNum200,
  updateDriverTripStatusNum400,
  updateDriverTripStatusNum600,
  updateDriverTripStatusNum800,
  updateDriverTripStatusNum900,
} from "./carhelper.js";

export const Status = {
  0: "FindingDrivers",
  100: "WaitingForDriverToAccept",
  200: "TripAccepted", //user - notify
  300: "GoingToPickupLocation",
  400: "ReachedPickupLocation", //user - notify
  450: "RideStarted", //user - notify
  500: "PickingItems",
  600: "WaitingForUserPayment", //user - notify
  700: "GoingToDeliveryLocation",
  800: "ReachedDeliveryLocation", //user - notify
  900: "Delivered", //user - notify
  950: "RideCompleted", //user - notify
  1000: "OpenForTrips",
};

export const saveTripRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let result;
    console.log("1");
    const {
      pickup_Location,
      dropoff_Location = {},
      orderItems = [],
      tripType,
      hours = 0,
      vehicleType = 0,
    } = req.body;

    if (tripType !== "Car Rent") {
      result = await pickupToDropOff(
        [pickup_Location.latitude, pickup_Location.longitude],
        [dropoff_Location.latitude, dropoff_Location.longitude]
      );
    }

    const OTP = Math.floor(1000 + Math.random() * 9000);

    let trip = await Trips.create({
      user_Name: user.firstName,
      user_Id: req.user._id,
      pickup_Location,
      dropoff_Location,
      tripStatus: Status[0],
      Fare: 100,
      userPaid: false,
      tripType: tripType,
      orderItems: orderItems,
      bookingHours: hours,
      totalHour: hours,
      otp: OTP,
      vehicleType,
      tripLocation: {
        type: "Point",
        coordinates: [pickup_Location.longitude, pickup_Location.latitude],
      },
      "pickupToDropoff.distance": result?.distance,
      "pickupToDropoff.time": result?.duration,
    });

    console.log("2");

    let nearestDrivers = await DriversLocation.find({
      currentLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              parseFloat(pickup_Location.longitude),
              parseFloat(pickup_Location.latitude),
            ],
          },
          $maxDistance: 50000, // Search within a 5 km radius (adjust as needed)
        },
      },
    });
    console.log("nearestDrivers", nearestDrivers, nearestDrivers.length);
    nearestDrivers = nearestDrivers.filter(
      (driver) => driver.driverId?.toString() !== req.user._id?.toString()
    );
    console.log(
      "nearestDriversafterFilter",
      nearestDrivers,
      nearestDrivers.length
    );

    // console.log(nearestDrivers);

    nearestDrivers?.forEach(async (driver) => {
      var DriversId = driver?.driverId;
      var user = await User.findById(DriversId);
      console.log(user);
      if (user && trip.tripType !== "Car Rent") {
        let token = user.fcmToken;
        sendNotification(
          token,
          "New trip requested near by!",
          `There is a new trip for delivery`
        );
      }
      if (user && trip.tripType === "Car Rent") {
        saveTripNotification(user);
      }
    });

    // console.log("3");
    // if (!nearestDrivers) {
    //   res
    //     .status(500)
    //     .json({ success: false, message: "No Drivers Near By Try Again" });
    // } else {
    //   let x = Math.floor(Math.random() * 3 + 1);
    //   let assignedDriver = nearestDrivers[x];
    //   trip.tripStatus = "Driver Assigned";
    //   trip.driverId = assignedDriver._id;
    //   await trip.save();
    res.status(200).json({
      success: true,
      message: "Trip Created",
      triprequest: trip,
      nearestDrivers,
    });

    //   console.log("4");
    // }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllTrips = async (req, res) => {
  let trips = [];
  //   let filteredTrips;
  try {
    const { pickup_Location } = req.body;
    const driverId = req.user._id.toString();
    // const driverId = "65b3c83f4c62a80017f62f25"; //req.user._id.toString();
    const driverInfo = await DriversLocation.findOne({ driverId });

    let nearestTrips = await Trips.find({
      tripLocation: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [
              parseFloat(pickup_Location.longitude),
              parseFloat(pickup_Location.latitude),
            ],
          },
          $maxDistance: 50000, // Search within a 5 km radius (adjust as needed)
        },
      },
    });
    // console.log("nearest trips :- ", nearestTrips);
    if (!nearestTrips) {
      res.status(200).json({ success: false, message: "No Trips Near By " });
    } else {
      //Send ongoing trip to particular driver.
      // Case 2: Driver_Id matches trip and trip status is not "Delivered": Send that particular trip
      var case2Trip = nearestTrips.find((nearestTrips) => {
        return (
          nearestTrips.driverId?.toString() == driverId &&
          nearestTrips.tripStatus?.toLowerCase() != "delivered" &&
          nearestTrips.tripStatus?.toLowerCase() != Status[950].toLowerCase()
        );
      });
      // console.log("case2Trip", case2Trip);

      if (case2Trip) {
        trips = [case2Trip];
      } else {
        // Case 3: Driver_Id matches trip and trip status is "Delivered": Send all trips
        var case3Trips = nearestTrips.filter((nearestTrips) => {
          //   console.log(nearestTrips.tripStatus?.toLowerCase(), Status[0]);
          return (
            nearestTrips.tripType !== "Car Rent" &&
            nearestTrips.user_Id?.toString() !== driverId &&
            nearestTrips.tripStatus?.toLowerCase() === Status[0].toLowerCase()
          );
        });

        if (driverInfo.isUberDriver) {
          const filterTrips = nearestTrips.filter((nearestTrips) => {
            //   console.log(nearestTrips.tripStatus?.toLowerCase(), Status[0]);
            return (
              nearestTrips.tripType === "Car Rent" &&
              nearestTrips.user_Id?.toString() !== driverId &&
              nearestTrips.vehicleType === driverInfo.vehicleType &&
              nearestTrips.tripStatus?.toLowerCase() === Status[0].toLowerCase()
            );
          });
          case3Trips.push(...filterTrips);
          console.log("filterTrips", filterTrips.length);
        }

        if (case3Trips.length > 0) {
          trips = case3Trips;
        } else {
          res
            .status(200)
            .json({ success: false, message: "No Trips Near By " });
          return;
        }
      }

      res.status(200).json({
        success: true,
        message: `All Bookings of `,
        data: trips,
        tripsCount: trips.length,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Driver  Update Booking status confirm on driver side

export const updateTripStatus = async (req, res) => {
  try {
    var io = req.app.io;
    var driverbooking = req.body.trip;

    if (!req.body.status) {
      res.status(400).json({
        success: false,
        message: "Bad Data",
      });
    } else {
      const trip = await Trips.findById(driverbooking.bookingId);
      trip.driverId = driverbooking.driverId;
      trip.Status = req.body.status;

      await trip.save();

      if (!trip) {
        res.status(400).json({
          success: false,
          message: "Trip not updated",
        });
      } else {
        const confirmedTrip = await Trips.findById(driverbooking.bookingId);
        res.status(200).json({
          success: true,
          message: "Trip Confirmed",
          confirmedTrip,
        });
        io.emit("action", {
          type: "TRIP_CONFIRMED",
          payload: confirmedTrip,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const calculateTripFare = (miles, tip) => {
  try {
    console.log(miles, tip);
    let totalFare = 0;
    let X = 0; //based on distance and traffic
    let Y = 0; //DTu service cost
    let Z = 0; //tax
    let T = tip; //tip

    let priceAfterTax = 0;
    let taxRate = 8;

    X = miles * 0.5;

    if (miles) {
      if (miles >= 21) {
        Y = 20;
      } else if (miles >= 10 && miles <= 20) {
        Y = 10;
      } else {
        Y = 5;
      }

      priceAfterTax = ((X + Y) * taxRate) / 100;
      console.log("priceAfterTax", priceAfterTax);
      Z = Number(priceAfterTax.toFixed(2));
      console.log("log Z", Z);
      totalFare = X + Y + Z + T;

      console.log(X);
      console.log(Y);
      console.log(Z);
      // console.log();
      return { X, Y, Z, T, totalFare: Number(totalFare.toFixed(2)), taxRate };
    } else {
      return {};
    }
  } catch (error) {
    console.log(error);

    return {};
  }
};

export const updateDriverTripStatus = async (req, res) => {
  try {
    console.log(1);
    const { trip_id, num, amount, tip = 0 } = req.body;
    const trip = await Trips.findById(trip_id);
    const user = await User.findOne({
      _id: req.user._id,
    });
    const orderCreator = await User.findOne({
      _id: trip.user_Id,
    });
    const OrderOrParcel = trip.tripType.includes("Parcel") ? "Parcel" : "Order";

    if (num === 200) {
      trip.driverId = req.user._id;
      trip.tripStatus = Status[num];
      await trip.save();
      if (
        orderCreator &&
        (trip.tripType === "Parcel Delivery" ||
          trip.tripType === "Grocery Delivery")
      ) {
        sendNotification(
          orderCreator.fcmToken,
          "Trip Accepted",
          `${user.firstName} has accepted ${OrderOrParcel} Delivery`
        );
      }
      if (orderCreator && trip.tripType === "Car Rent") {
        updateDriverTripStatusNum200(orderCreator, user);
      }
      res.status(200).json({
        success: true,
        message: "Driver assigned successfully",
        trip,
      });

      return;
    }
    if (num === 400) {
      if (
        orderCreator &&
        (trip.tripType === "Parcel Delivery" ||
          trip.tripType === "Grocery Delivery")
      ) {
        sendNotification(
          orderCreator.fcmToken,
          "Driver Reached Pickup Location",
          `${user.firstName} may ask you for payment anytime for the ${OrderOrParcel} delivery`
        );
      }
      if (orderCreator && trip.tripType === "Car Rent") {
        updateDriverTripStatusNum400(orderCreator, user);
      }
    }

    if (num === 450) {
      if (trip.didDriverVerifyOtp) {
        trip.tripStatus = Status[num];
        trip.carRentTripCreatedAt = Date.now();
        await trip.save();
        sendNotification(
          orderCreator.fcmToken,
          "RideStarted",
          `You are riding with ${user.firstName}`
        );
      }
    }

    if (num === 600) {
      const driver_Id = trip.driverId;
      const driverInfo = await DriversLocation.findOne({ driverId: driver_Id });
      let CalculatedFare = {};
      if (
        orderCreator &&
        (trip.tripType === "Parcel Delivery" ||
          trip.tripType === "Grocery Delivery")
      ) {
        let miles = String(trip.pickupToDropoff.distance);
        console.log(miles, typeof miles);
        if (miles.indexOf("mi") > -1) {
          miles = Number(miles.split("mi")[0].trim());
        } else if (miles.indexOf("km") > -1) {
          miles = Number(miles.split("km")[0].trim());
        }
        CalculatedFare = calculateTripFare(miles, tip);
        console.log(CalculatedFare);
        trip.Fare = {
          itemsBill: amount || 0,
          deliveryCharges: {
            ...CalculatedFare,
          },
        };
        trip.tripStatus = Status[num];
        console.log(amount);
        await trip.save();
        sendNotification(
          orderCreator.fcmToken,
          `Please Pay for your ${OrderOrParcel} delivery`,
          `Your total bill amount is $ ` +
            (Number(amount) + Number(CalculatedFare.totalFare)).toFixed(2)
        );
      }

      if (orderCreator && trip.tripType === "Car Rent") {
        CalculatedFare = updateDriverTripStatusNum600(
          orderCreator,
          tip,
          trip,
          num
        );
      }

      res.status(200).json({
        success: true,
        CalculatedFare,
        trip,
      });
      return;
    }

    if (num === 800) {
      if (
        orderCreator &&
        (trip.tripType === "Parcel Delivery" ||
          trip.tripType === "Grocery Delivery")
      ) {
        sendNotification(
          orderCreator.fcmToken,
          `Driver has Reached your Delivery Location`,
          `Please collect your ${OrderOrParcel}`
        );
      }
      if (orderCreator && trip.tripType === "Car Rent") {
        updateDriverTripStatusNum800(orderCreator);
      }
    }

    if (num === 900) {
      const destinationId = await User.findById(trip.driverId);
      let statusNum =
        orderCreator && trip.tripType === "Car Rent"
          ? Status[950]
          : Status[900];
      let payableAmount = trip.Fare.deliveryCharges.X;
      let finalAmount =
        orderCreator && trip.tripType === "Car Rent"
          ? payableAmount / 2
          : payableAmount;
      if (trip && destinationId && trip.Fare) {
        const transfer = await stripe.transfers.create({
          amount: Math.round(finalAmount * 100),
          currency: "usd",
          destination: destinationId.stripeInfo.stripeConnectedId,
          description: trip_id,
        });
        trip.paidToDriver = true;
        trip.tripStatus = statusNum;
        trip.carRentTripEndedAt = Date.now();
        await trip.save();
        if (
          orderCreator &&
          (trip.tripType === "Parcel Delivery" ||
            trip.tripType === "Grocery Delivery")
        ) {
          sendNotification(
            orderCreator.fcmToken,
            `Delivered!`,
            `Your ${OrderOrParcel} has delivered`
          );
        }

        if (orderCreator && trip.tripType === "Car Rent") {
          updateDriverTripStatusNum900(orderCreator);
        }

        res.status(200).json({
          transfer: `Transfers processed successfully`,
          success: true,
          message: "Trip Status Updated Successfully",
          trip,
        });
      } else {
        res.status(400).send("Invalid request or missing data");
      }

      return;
    }
    if (trip) {
      trip.tripStatus = Status[num];
      await trip.save();
      res.status(200).json({
        success: true,
        message: "Trip Status Updated Successfully",
        trip,
      });
    } else {
      res.status(400).json({ success: false, message: "No Trip Found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const pastCompledtedTrips = async (req, res) => {
  try {
    let past_trips =
      (await Trips.find({
        driverId: req.user._id,
        tripStatus: "Delivered",
      })) || [];
    let past_Rides =
      (await Trips.find({
        driverId: req.user._id,
        tripStatus: "RideCompleted",
      })) || [];

    res.status(200).json({
      success: true,
      past_trips: [...past_trips, ...past_Rides],
      tripCount: past_trips.length + past_Rides.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const pastCompledtedOrders = async (req, res) => {
  try {
    let past_orders = await Trips.find({
      user_Id: req.user._id,
      tripStatus: "Delivered",
    });
    let past_Rides = await Trips.find({
      user_Id: req.user._id,
      tripStatus: "RideCompleted",
    });

    let ongoing_order = await Trips.find({
      user_Id: req.user._id,
    });

    ongoing_order = ongoing_order.filter(
      (order) =>
        order.tripStatus?.toLowerCase() !== "delivered" &&
        order.tripStatus?.toLowerCase() !== "ridecompleted"
    );

    res.status(200).json({
      success: true,
      past_orders: [...past_orders, ...past_Rides],
      ongoing_order,
      OrderCount: past_orders.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTrip = async (req, res) => {
  try {
    const { tripId } = req.body;
    var trip = await Trips.find({
      _id: tripId,
    });

    res.status(200).json({
      success: true,
      trip,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const extraHoursAdd = async (req, res) => {
  try {
    const { extraHour, tripId } = req.body;
    let trip = await Trips.findById(tripId);
    trip.extraHours += extraHour;
    trip.totalHour = trip.extraHours + trip.bookingHours;
    await trip.save();
    res.status(200).json({
      success: true,
      message: "Extra hour added",
    });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
