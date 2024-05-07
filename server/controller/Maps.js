import axios from "axios";
import { getConfig } from "../config.js";

const config = getConfig();
const GCP_Key = config.GCP_Key;

export const nearbyPlaces = async (req, res) => {
  try {
    const { location, keyword } = req.body;
    const radius = 50000;

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=${GCP_Key}&location=${location}&radius=${radius}&keyword=${encodeURIComponent(
        keyword
      )}`
    );

    const places = response.data.results;
    res.status(200).send(places);
  } catch (error) {
    res.status(500).json({ error: "Error fetching nearby place", error });
  }
};


export const gcpDirections = async (req, res) => {
  try {
    const { origin, destination } = req.body;
    const polyline = [];
    const [latitude, longitude] = origin.split(",");
    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);
    
    const getPlaceId = async (latLng) => {
      try {
        const response = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latLng}&key=${GCP_Key}`
        );
        if (response.data.results && response.data.results.length > 0) {
          return response.data.results[0].place_id;
        } else {
          return null;
        }
      } catch (error) {
        console.error("Error during geocoding:", error.message);
        return null;
      }
    };

    const originPlaceId = await getPlaceId(origin);
    const destinationPlaceId = await getPlaceId(destination);

    if (!originPlaceId || !destinationPlaceId) {
      res.status(500).json({ error: "Failed to retrieve place IDs" });
      return;
    }
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?destination=place_id:${destinationPlaceId}&origin=place_id:${originPlaceId}&key=${GCP_Key}`
    );

    const distanceText = data.routes[0].legs[0].distance.text;
    const distanceValue = data.routes[0].legs[0].duration.text;

    polyline.push({latitude: parsedLatitude, longitude: parsedLongitude });
    if (data.status === "OK") {
      data.routes[0].legs[0].steps.forEach((step, stepIndex) => {
        const element = step.end_location;
        polyline.push({
          latitude: element.lat,
          longitude: element.lng,
        });
      });
    }
    res.status(200).json({ distanceText, distanceValue, polyline });
  } catch (error) {
    res.status(500).json({ error: "An error occurred" });
  }
};
