import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const tripSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user_Name: {
    type: String,
    require: true,
  },
  user_Id: {
    type: mongoose.Types.ObjectId,
    require: true,
  },
  tripStatus: {
    type: String,
    default: "FindingDrivers",
  },
  stripePayment: {
    type: [mongoose.Schema.Types.Mixed],
    default: [],
  },
  stripePaymentRefund: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  pickup_Location: {
    address: String,
    address_name: String,
    addressId: String,
    latitude: Number,
    longitude: Number,
  },
  dropoff_Location: {
    address: String,
    address_name: String,
    addressId: String,
    latitude: Number,
    longitude: Number,
  },
  Fare: {
    itemsBill: {
      type: Number,
      default: 0,
    },
    deliveryCharges: {
      X: {
        type: Number,
        default: 0,
      },
      Y: {
        type: Number,
        default: 0,
      },
      Z: {
        type: Number,
        default: 0,
      },
      T: {
        type: Number,
        default: 0,
      },
      totalFare: { type: Number, default: 0 },
      taxRate: { type: Number, default: 0 },
    },
  },
  paidToDriver: {
    type: Boolean,
    default: false,
  },
  tripType: {
    type: String,
    default: "",
  },
  driverId: {
    type: mongoose.Types.ObjectId,
    require: true,
  },
  userPaid: {
    type: Boolean,
    default: false,
  },
  orderItems: {
    type: Array,
    require: true,
  },
  tripLocation: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: [Number],
  },
  pickupToDropoff: {
    distance: {
      type: String,
      default: "",
    },
    time: {
      type: String,
      default: "",
    },
  },
  bookingHours: {
    type: Number,
    default: 0,
  },
  extraHours: {
    type: Number,
    default: 0,
  },
  totalHour: {
    type: Number,
    default: 0,
  },
  vehicleType: {
    type: Number,
  },
  otp: {
    type: Number,
    default: 7862,
  },
  didDriverVerifyOtp: {
    type: Boolean,
    default: false,
  },
  carRentTripCreatedAt: {
    type: Number,
    require: true,
  },
  carRentTripEndedAt: {
    type: Number,
    require: true,
  },
  ticketId: {
    type: mongoose.Types.ObjectId,
    require: true,
  },
  ticketCounterId: {
    type: Number,
    require: true,
  },
  ticketStatus: {
    type: String,
    require: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

tripSchema.index({ tripLocation: "2dsphere" });
export const Trips = mongoose.model("Trips", tripSchema);
