import mongoose from "mongoose";
import { getConfig } from "../config.js";

const config = getConfig();

export const connectDataBase = async () => {
  try {
    const { connection } = await mongoose.connect(config.MONGO_URI);
    console.log(`MongoDB Connected : ${connection.host}`);
  } catch (error) {
    console.log("Error Connecting Database" + error);
    process.exit(1);
  }
};
