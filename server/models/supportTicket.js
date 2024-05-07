import mongoose from "mongoose";

const supportTicket = new mongoose.Schema({
  customerId: { type: mongoose.Types.ObjectId, require: true },
  customerName: String,
  customerEmail: String,
  customerMobileNumber: String,
  tripId: {
    type: mongoose.Types.ObjectId,
    require: true,
  },
  status: {
    type: String,
    enum: ["Open", "Closed", "Assigned"],
    default: "Open",
  },
  assignedTo: {
    type: mongoose.Types.ObjectId,
    require: true,
  }, // Support agent or team assigned to the ticket

  chats: [
    {
      isUser: { type: Boolean },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  tripType: {
    type: String,
    require: true,
  },
  ticketCounterId: {
    type: Number,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

export const SupportTicket = mongoose.model("SupportTicket", supportTicket);
