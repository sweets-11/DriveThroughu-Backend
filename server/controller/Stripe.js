import { stripe } from "../server.js";
import { User } from "../models/users.js";
import { Trips } from "../models/trips.js";
import { DriversLocation } from "../models/driverLocation.js";
import { getConfig } from "../config.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Transfer } from "../models/transfer.js";
import { Payout } from "../models/payout.js";
import { sendNotification } from "./FirebaseNotifications.js";

const config = getConfig();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const stripePayment = async (req, res) => {
  const { totalAmount, tripId } = req.body; //current login user id

  try {
    const user = await User.findById(req.user._id);
    if (user.stripeInfo.stripeCustomerId == "") {
      const customer = await stripe.customers.create({
        name: user.firstName + " " + user.lastName,
        phone: user.mobileNumber,
        email: user.email,
        description: user.id,
      });
      user.stripeInfo.stripeCustomerId = customer.id;
      await user.save();
    }

    const customerId = user.stripeInfo.stripeCustomerId;
    // Generate client secret

    const { client_secret } = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "usd",
      customer: customerId,
      description: tripId,
    });

    // Generate ephemeral key
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: "2023-08-16" }
    );

    res
      .status(200)
      .json({ ephemeralKey, success: true, client_secret, customerId });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const stripeRefund = async (req, res) => {
  const { tripId } = req.body;
  try {
    const user = await Trips.findById(tripId);
    const chargeId = user.stripePayment
      .filter((event) => event.data.object.status === "succeeded")
      .map((event) => event.data.object.latest_charge);

    if (!user.stripePaymentRefund.status) {
      const refund = await stripe.refunds.create({
        charge: chargeId[0],
      });

      user.stripePaymentRefund = refund;
      await user.save();
    }
    res.status(200).json({ refund: user.stripePaymentRefund.status });
  } catch (error) {
    res.status(500).json({ error: "Error refunding charge:", error });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      config.WEBHOOK_ENDPOINT_SECRET
    );
  } catch (err) {
    res.status(500).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event

  if (event.type == "payment_intent.succeeded") {
    const paymentIntentSucceeded = event;
    try {
      const user = await Trips.findById(
        paymentIntentSucceeded.data.object.description
      );
      if (user) {
        user.stripePayment.push(paymentIntentSucceeded);
        user.userPaid = true;
        await user.save();
        let Id = user.driverId;
        let driver = await User.findById(Id);
        let token = driver.fcmToken;

        sendNotification(
          token,
          `User has paid for their order`,
          `Please start delivery`
        );
      }
    } catch (err) {
      res.status(500).send(`Webhook Error: ${err.message}`);
    }
  }

  if (event.type == "payment_intent.payment_failed") {
    const paymentIntentFailed = event;
    try {
      const user = await Trips.findById(
        paymentIntentFailed.data.object.description
      );
      if (user) {
        user.stripePayment.push(paymentIntentFailed);
        await user.save();
      }
    } catch (err) {
      res.status(500).send(`Webhook Error: ${err.message}`);
    }
  }

  if (event.type == "transfer.created") {
    const transferCreated = event;
    try {
      const userid = await User.findOne({
        "stripeInfo.stripeConnectedId": transferCreated.data.object.destination,
      });
      if (userid) {
        const transfer = new Transfer({
          userID: userid._id,
          stripeConnectedId: transferCreated.data.object.destination,
          stripeTransfers: transferCreated,
          status: "success",
          tripId: transferCreated.data.object.description
            ? transferCreated.data.object.description
            : Math.random().toString(36).split(".")[1],
        });
        await transfer.save();
      }
    } catch (err) {
      res.status(500).send(`Webhook Error: ${err.message}`);
    }
  }
  res.json({ received: true, webhook: `${event.type} happend successfully` });
};

export const payoutPaid = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      config.WEBHOOK_CONNECT_ENDPOINT_SECRET
    );
  } catch (err) {
    res.status(500).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  if (event.type == "payout.paid") {
    const payoutPaid = event;
    try {
      const userid = await User.findOne({
        "stripeInfo.stripeConnectedId": payoutPaid.account,
      });
      if (userid) {
        const payout = new Payout({
          userID: userid._id,
          stripeConnectedId: userid.stripeInfo.stripeConnectedId,
          stripePayouts: payoutPaid,
          status: payoutPaid.data.object.status,
        });
        await payout.save();
      }
    } catch (err) {
      res.status(500).send(`Webhook Error: ${err.message}`);
    }
  }

  if (event.type == "payout.failed") {
    const payoutFailed = event;
    try {
      const userid = await User.findOne({
        "stripeInfo.stripeConnectedId": payoutFailed.account,
      });
      if (userid) {
        const payout = new Payout({
          userID: userid._id,
          stripeConnectedId: userid.stripeInfo.stripeConnectedId,
          stripePayouts: payoutFailed,
          status: payoutFailed.data.object.status,
        });
        await payout.save();
      }
    } catch (err) {
      res.status(500).send(`Webhook Error: ${err.message}`);
    }
  }

  res.json({ received: true, webhook: `${event.type} happend successfully` });
};

export const ConnectAcc = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const email = user.email;

    //create connected account
    if (user.stripeInfo.stripeConnectedId == "") {
      const account = await stripe.accounts.create({
        type: "express",
        email: email,
      });
      user.stripeInfo.stripeConnectedId = account.id;
      await user.save();
    }

    //It'll get you to payout page where you can add bank account details
    const accountLink = await stripe.accountLinks.create({
      account: user.stripeInfo.stripeConnectedId,
      refresh_url: "https://api-staging.drivethroughu.com/api/v1/order/reauth",
      return_url: "https://api-staging.drivethroughu.com/api/v1/order/return",
      type: "account_onboarding",
    });

    if (user) {
      user.stripeInfo.stripeOnBoardingStatus = "initiated";
      await user.save();
    }

    res.status(200).json({ accountLink });
  } catch (err) {
    res.status(500).send(`Onboarding Error: ${err.message}`);
  }
};

export const transferFund = async (req, res) => {
  try {
    const users = await User.find({}).exec();

    for (const user of users) {
      const transfer = await stripe.transfers.create({
        amount: 1000,
        currency: "usd",
        destination: user.stripeInfo.stripeConnectedId,
        // description: "anket_14s5sd45",
      });
    }
    res.send({ transfer: `Transfers processed successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export const transferFundUpdated = async (req, res) => {
  try {
    const { tripId, num } = req.body;
    const trip = await Trips.findById(tripId);
    const destinationId = await User.findById(trip.user_Id);
    if (trip && destinationId && trip.Fare) {
      if (num === 900) {
        const transfer = await stripe.transfers.create({
          amount:
            Math.round(trip.Fare.itemsBill + trip.Fare.deliveryCharges) * 100,
          currency: "usd",
          destination: destinationId.stripeInfo.stripeConnectedId,
          description: tripId,
        });
        trip.paidToDriver = true;
        res.send({ transfer: `Transfers processed successfully` });
      } else {
        res.status(400).send("Invalid num value");
      }
    } else {
      res.status(400).send("Invalid request or missing data");
    }
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

export const onBoardingReturnUrl = (req, res) => {
  res.sendFile(__dirname + "/index.html");
};

export const onBoardingRefreshUrl = (req, res) => {
  res.sendFile(__dirname + "/refresh.html");
};

export const verifyOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const {
      vehicleNumber,
      licenseNumber,
      vehicleType = 0,
      location,
      isUberDriver,
    } = req.body;
    const driverInfo = await DriversLocation.findOne({ driverId: user._id });

    if (user && user.stripeInfo.stripeConnectedId) {
      const { details_submitted } = await stripe.accounts.retrieve(
        user.stripeInfo.stripeConnectedId
      );

      user.stripeInfo.stripeOnBoardingStatus = details_submitted;
      user.isDeliveryAgent = details_submitted;
      await user.save();

      let newDriver;

      if (!driverInfo) {
        newDriver = await DriversLocation.create({
          driverId: req.user._id,
          name: user.firstName + " " + user.lastName,
          vehicleNumber,
          licenseNumber,
          currentLocation: {
            type: "Point",
            coordinates: [location.longitude, location.latitude],
          },
          vehicleType,
          isUberDriver,
        });
      } else {
        newDriver = "Driver Already Exists!";
      }

      return res.status(200).json({ success: details_submitted, newDriver });
    } else {
      return res
        .status(400)
        .json({ error: "User or Stripe Connected ID not found" });
    }
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    return res
      .status(500)
      .json({ error: "Error during onboarding verification" });
  }
};

export const transferData = async (req, res) => {
  try {
    const pageNumber = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (pageNumber - 1) * limit;

    const transfer = await Transfer.find({ userID: req.user._id })
      .sort({ "stripeTransfers.data.object.created": -1 })
      .skip(startIndex)
      .limit(limit);
    const totalTransfer = await Transfer.countDocuments({
      userID: req.user._id,
    });

    const totalPages = Math.ceil(totalTransfer / limit);

    const responseData = transfer.map((transferData, i) => ({
      Date: transferData.stripeTransfers.data.object.created,
      Amount: `${(
        transferData.stripeTransfers.data.object.amount / 100
      ).toFixed(2)}`,
      Status: transferData.status,
      tripId: transferData.tripId,
    }));

    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
    res.json({
      responseData,
      totalTransfer,
      currentPage: pageNumber,
      nextPage,
    });
  } catch (error) {
    console.error("Error in getUserPage:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const payoutData = async (req, res) => {
  try {
    const pageNumber = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (pageNumber - 1) * limit;

    const payout = await Payout.find({ userID: req.user._id })
      .sort({ "stripePayouts.data.object.created": -1 })
      .skip(startIndex)
      .limit(limit);
    const totalPayout = await Payout.countDocuments({
      userID: req.user._id,
    });
    const totalPages = Math.ceil(totalPayout / limit);

    const responseData = payout.map((payoutData, i) => ({
      Date: payoutData.stripePayouts.data.object.created,
      Amount: `${(payoutData.stripePayouts.data.object.amount / 100).toFixed(
        2
      )}`,
      Status: payoutData.stripePayouts.data.object.status,
    }));

    const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;

    res.json({
      responseData,
      totalPayout,
      currentPage: pageNumber,
      nextPage,
    });
  } catch (error) {
    console.error("Error in getUserPage:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
