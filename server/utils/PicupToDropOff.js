import axios from "axios";
import { getConfig } from "../config.js";
import { Trips } from "../models/trips.js";

const config = getConfig();
const GCP_Key = config.GCP_Key;

export const pickupToDropOff = async (origin, destination) => {
  try {
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&units=imperial&key=${GCP_Key}`
    );

    if (data.status === "OK") {
      const distance = data.rows[0].elements[0].distance.text;
      const duration = data.rows[0].elements[0].duration.text;

      return { distance, duration };
    } else {
      return { error: "Error fetching data from Destination API" };
    }
  } catch (error) {
    return { error: "Error in getting distance and time", details: error };
  }
};

export const distanceAndTime = async (req, res) => {
  try {
    // const {trip_id} =req.body;
    const trip = await Trips.findById(req.body.trip_id);
    const origin = [
      trip.pickup_Location.latitude,
      trip.pickup_Location.longitude,
    ];
    const destination = [
      trip.dropoff_Location.latitude,
      trip.dropoff_Location.longitude,
    ];

    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&units=imperial&key=${GCP_Key}`
    );
    if (data.status === "OK") {
      const distance = data.rows[0].elements[0].distance.text;
      const time = data.rows[0].elements[0].duration.text;

      trip.pickupToDropoff.distance = distance;
      trip.pickupToDropoff.time = time;

      await trip.save();
      res
        .status(200)
        .json({
          distance: distance,
          time: time,
        });
    } else {
      return { error: "Error fetching data from Destination API" };
    }
  } catch (error) {
    return { error: "Error in getting distance and time", details: error };
  }
};
