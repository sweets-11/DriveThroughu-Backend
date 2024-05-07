import { User } from "../models/users.js";
import { admin } from "../server.js";

export const saveFcmToken = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id);
    if (user) {
      user.fcmToken = token;
      await user.save();
      res.status(200).json({ message: "Successfully registered FCM Token!" });
    } else {
      res.status(400).json({ message: "Error Saving FCM Token!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendNotification = async (token, title, body) => {
  try {
    await admin.messaging().send({
      token,
      notification: {
        title,
        body,
      },
    });
  } catch (error) {
    console.log("notif: ", error);
  }
};
