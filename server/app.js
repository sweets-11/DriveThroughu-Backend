import express, { urlencoded } from "express";
import User from "./routers/User.js";
import Test from "./routers/Test.js";
import Trip from "./routers/Trips.js";
import Maps from "./routers/Maps.js";
import Driver from "./routers/Driver.js";
import Payment from "./routers/Stripe.js";
import Notifications from "./routers/PushNotification.js";
import CustomerCare from "./routers/CustomerCare.js";
import SupportTicket from "./routers/supportTicket.js";
import cookieParser from "cookie-parser";

import cors from "cors";

export const app = express();

app.use(
  express.urlencoded({
    extended: false, // Whether to use algorithm that can handle non-flat data strutures
    limit: 10000, // Limit payload size in bytes
    parameterLimit: 2, // Limit number of form items on payload
  })
);
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(cookieParser());
app.use(cors());

app.use("/api/v1", User);
app.use("/api/v1/", Trip);
app.use("/api/v1/test", Test);
app.use("/api/v1", Maps);
app.use("/api/v1/order", Payment);
app.use("/api/v1", Driver);
app.use("/api/v1/", Notifications);
app.use("/api/v1/customer/", CustomerCare);
app.use("/api/v1/customer/", SupportTicket);
