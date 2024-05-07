import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  id: {
    type: String,
  },
  sequenceValue: {
    type: Number,
    default: 0,
  },
});

export const Counter = mongoose.model("Counters", counterSchema);
