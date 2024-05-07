import { sendNotification } from "./FirebaseNotifications.js";
import { Status } from "./Trips.js";
export const calculateCarRent = (typeOfCar, hour, tip) => {
  try {
    const costType1 = 10;
    const costType2 = 20;
    const costType3 = 30;

    let X;
    let Z = 0.08;
    let T = tip;
    const roundedHour = Math.ceil(hour);
    // Calculate X based on typeOfCar and hour
    switch (typeOfCar) {
      case 10:
        X = costType1 * roundedHour;
        break;
      case 20:
        X = costType2 * roundedHour;
        break;
      case 30:
        X = costType3 * roundedHour;
        break;
      default:
        throw new Error(
          "Invalid typeOfCar. Please choose type1, type2, or type3."
        );
    }

    // Calculate Z (tax) as 8% of X
    Z = Z * X;

    // Calculate total cost
    const totalCost = X + Z + T;

    return { X, Z, T, totalCost: Number(totalCost.toFixed(2)) };
  } catch (error) {
    console.log(error);
    return {};
  }
};

//Notification
export const saveTripNotification = (user) => {
  if (user) {
    let token = user.fcmToken;
    sendNotification(
      token,
      "New trip requested near by!",
      `There is a new trip request for a ride`
    );
  }
};

export const updateDriverTripStatusNum200 = (orderCreator, user) => {
  sendNotification(
    orderCreator.fcmToken,
    "Trip Accepted",
    `${user.firstName} has accepted your request for a ride`
  );
};

export const updateDriverTripStatusNum400 = (orderCreator, user) => {
  sendNotification(
    orderCreator.fcmToken,
    "Driver Reached Pickup Location",
    `${user.firstName} may ask you for the OTP`
  );
};
export const updateDriverTripStatusNum600 = async (
  orderCreator,
  tip,
  trip,
  num
) => {
  console.log(trip);
  let CalculatedFare = calculateCarRent(trip.vehicleType, trip.totalHour, tip);
  trip.Fare = {
    itemsBill: 0,
    deliveryCharges: {
      X: CalculatedFare.X,
      Y: 0,
      Z: CalculatedFare.Z,
      T: CalculatedFare.T,
      totalFare: CalculatedFare.totalCost,
      taxRate: 8,
    },
  };

  trip.tripStatus = Status[num];

  await trip.save();
  
  sendNotification(
    orderCreator.fcmToken,
    `Please Pay for your ride`,
    `Your total bill amount is $ ` + Number(CalculatedFare.totalCost).toFixed(2)
  );
  return CalculatedFare;
};

export const updateDriverTripStatusNum800 = (orderCreator) => {
  sendNotification(
    orderCreator.fcmToken,
    `You have 10 minutes left before your ride concludes.`,
    `Do you want to extend the duration of this ride?`
  );
};

//driver amount transfer
export const updateDriverTripStatusNum900 = (orderCreator) => {
  sendNotification(
    orderCreator.fcmToken,
    `Ride Completed!`,
    `Your Ride has Completed`
  );
};
