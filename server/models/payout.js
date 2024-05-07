import mongoose from "mongoose";

const payoutSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Types.ObjectId,
    require: true,
  },
  stripeConnectedId: {
    type: String,
    default: "",
  },
  stripePayouts: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  status: {
    type: String,
    enum: ["paid", "in_transit", "pending"],
    default: "pending",
  }
});

export const Payout = mongoose.model("Payouts", payoutSchema);
