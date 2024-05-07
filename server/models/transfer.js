import mongoose from "mongoose";

const transferSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Types.ObjectId,
    require: true,
  },
  stripeConnectedId: {
    type: String,
    default: "",
  },
  stripeTransfers: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  status: {
    type: String,
    enum: ["not", "success"],
    default: "not",
  },
  tripId: {
    type: String,
    default: ""
  }
});

export const Transfer = mongoose.model("Transfers", transferSchema);
