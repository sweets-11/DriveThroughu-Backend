import { app } from "./app.js";
import { connectDataBase } from "./config/database.js";
import { getConfig } from "./config.js";
// import { Server } from "socket.io";
// import { createServer } from "http";
import Stripe from "stripe";
import admin from "firebase-admin";
import serviceAccount from "../server/firebase.json" assert { type: "json" };
// import AWS from "aws-sdk";

// const httpServer = createServer();
// const io = new Server(httpServer, {
//   // ...
// });
const config = getConfig();
// config.GOOGLE_APPLICATION_CREDENTIALS;
console.log(config)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const stripe = new Stripe(config.STRIPE_API_SECRET);
connectDataBase();
// httpServer.listen(5000);

app.listen(config.PORT, () => {
  console.log("Server is running on PORT " + config.PORT);
});

// app.io = io.on("connection", function (socket) {
//   console.log("Socket connected: " + socket.id);
// });

export { admin };
