import { config } from "dotenv";

console.log(process.env.ENVIRONMENT);
if (process.env.ENVIRONMENT === "development" || !process.env.ENVIRONMENT) {
  try {
    config({
      path: "./config/config.env",
    });
  } catch (error) {
    console.log("Error File Not Found : " + error);
  }
}

const configENV = {
  development: {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    CUSTOMER_JWT_SECRET: process.env.CUSTOMER_JWT_SECRET,
    ACCESSKEY_ID: process.env.ACCESSKEY_ID,
    SECRETACCESSKEY: process.env.SECRETACCESSKEY,
    REGION: process.env.REGION,
    APPLICATION_ID: process.env.APPLICATION_ID,
    GCP_Key: process.env.GCP_Key,
    STRIPE_API_SECRET: process.env.STRIPE_API_SECRET,
    WEBHOOK_ENDPOINT_SECRET: process.env.WEBHOOK_ENDPOINT_SECRET,
    WEBHOOK_CONNECT_ENDPOINT_SECRET:
      process.env.WEBHOOK_CONNECT_ENDPOINT_SECRET,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
  staging: {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    CUSTOMER_JWT_SECRET: process.env.CUSTOMER_JWT_SECRET,
    ACCESSKEY_ID: process.env.ACCESSKEY_ID,
    SECRETACCESSKEY: process.env.SECRETACCESSKEY,
    REGION: process.env.REGION,
    APPLICATION_ID: process.env.APPLICATION_ID,
    GCP_Key: process.env.GCP_Key,
    STRIPE_API_SECRET: process.env.STRIPE_API_SECRET,
    WEBHOOK_ENDPOINT_SECRET: process.env.WEBHOOK_ENDPOINT_SECRET,
    WEBHOOK_CONNECT_ENDPOINT_SECRET:
      process.env.WEBHOOK_CONNECT_ENDPOINT_SECRET,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
  production: {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    CUSTOMER_JWT_SECRET: process.env.CUSTOMER_JWT_SECRET,
    ACCESSKEY_ID: process.env.ACCESSKEY_ID,
    SECRETACCESSKEY: process.env.SECRETACCESSKEY,
    REGION: process.env.REGION,
    APPLICATION_ID: process.env.APPLICATION_ID,
    GCP_Key: process.env.GCP_Key,
    STRIPE_API_SECRET: process.env.STRIPE_API_SECRET,
    WEBHOOK_ENDPOINT_SECRET: process.env.WEBHOOK_ENDPOINT_SECRET,
    WEBHOOK_CONNECT_ENDPOINT_SECRET:
      process.env.WEBHOOK_CONNECT_ENDPOINT_SECRET,
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
};

export const appVersion = `0.165.0 - ${process.env.ENVIRONMENT}`;

export const getConfig = () => {
  return configENV[process.env.ENVIRONMENT] || configENV.development;
};
