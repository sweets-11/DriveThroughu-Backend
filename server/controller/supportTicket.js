import { User } from "../models/users.js";
import { Trips } from "../models/trips.js";
import { SupportTicket } from "../models/supportTicket.js";
import { ApiFeatures } from "../utils/apiFeatures.js";

import { Counter } from "../models/counter.js";
export const Status = {
  10: "Open",
  20: "Assigned",
  30: "Closed",
};

export const createSupportTicket = async (req, res) => {
  try {
    const { tripId, message } = req.body;
    const customerId = await User.findById(req.user._id);
    const trip = await Trips.findById(tripId);
    let sequenceValueId;
    if (customerId && trip) {
      let countCheck = await Counter.findOne({ id: "trackTicket" });

      if (countCheck == null) {
        const Count = new Counter({ id: "trackTicket", sequenceValue: 1000 });
        await Count.save();
        sequenceValueId = 1000;
      } else {
        countCheck = await Counter.findOneAndUpdate(
          { id: "trackTicket" },
          { $inc: { sequenceValue: 1 } },
          { new: true }
        );
        sequenceValueId = countCheck.sequenceValue;
      }
      const ticket = await SupportTicket.create({
        customerId: customerId._id,
        customerName: `${customerId.firstName} ${customerId.lastName}`,
        customerEmail: customerId.email,
        customerMobileNumber: customerId.mobileNumber,
        tripId,
        status: Status[10],
        chats: [
          {
            isUser: true,
            text: message,
            createdAt: Date.now(),
          },
        ],
        tripType: trip.tripType,
        ticketCounterId: sequenceValueId,
      });
      await ticket.save();
      trip.ticketId = ticket._id;
      trip.ticketStatus = Status[10];
      trip.ticketCounterId = sequenceValueId;
      await trip.save();
      res.status(200).json({
        success: true,
        message: "Ticket generated successfully!",
        ticket,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateChat = async (req, res) => {
  try {
    const { ticketId, isUser, message } = req.body;
    const ticket = await SupportTicket.findById(ticketId);
    if (ticket) {
      ticket.chats.push({
        isUser: isUser,
        text: message,
        createdAt: Date.now(),
      });
      await ticket.save();
      res.status(200).json({
        success: true,
        message: ticket.chats[ticket.chats.length - 1],
      });
    } else {
      res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const ticket = await SupportTicket.findById(ticketId);
    if (ticket) {
      res.status(200).json({
        success: true,
        message: "Chat updated successfully",
        chats: ticket.chats,
      });
    } else {
      res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FOR CUSTOMER CARE
export const getSupportTickets = async (req, res) => {
  try {
    const resultPerPage = 5;
    const apiFeatures = new ApiFeatures(SupportTicket.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);

    let Tickets = await apiFeatures.query;
    const filterTickets = Tickets.filter((ticket) => {
      console.log(
        "ticket",
        ticket.status === Status[10],
        typeof ticket.assignedTo
      );
      return ticket.status === Status[10];
    });

    res.status(200).json({
      sucess: true,
      filterTickets,
      TicketCount: filterTickets.length,
    });
  } catch (error) {
    console.error("Error in getSupportTickets:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTicket = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const ticket = await SupportTicket.findById(ticketId);
    if (ticket) {
      res.status(200).json({
        success: true,
        message: "Chat updated successfully",
        ticket,
      });
    } else {
      res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllChatsSupportSide = async (req, res) => {
  try {
    const { ticketId } = req.body;
    const ticket = await SupportTicket.findById(ticketId);
    if (ticket) {
      res.status(200).json({
        success: true,
        message: "Chat updated successfully",
        chats: ticket.chats,
      });
    } else {
      res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateChatSupportSide = async (req, res) => {
  //ticket assignment and chat update
  try {
    const { ticketId, isUser, message } = req.body;
    const ticket = await SupportTicket.findById(ticketId);
    if (ticket) {
      if (!ticket.assignedTo && isUser == false) {
        ticket.assignedTo = req.customer._id;
        ticket.status = Status[20];
      }
      ticket.chats.push({
        isUser: isUser,
        text: message,
        createdAt: Date.now(),
      });
      await ticket.save();
      res.status(200).json({
        success: true,
        message: ticket.chats[ticket.chats.length - 1],
      });
    } else {
      res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toCloseTickets = async (req, res) => {
  //Api to close tickets
  try {
    const { ticketId } = req.body;
    const ticket = await SupportTicket.findById(ticketId);
    if (ticket) {
      ticket.status = Status[30];
      await ticket.save();
      res.status(200).json({
        success: true,
        message: "Ticket get closed successfully",
        ticket,
      });
    } else {
      res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const myCompletedTickets = async (req, res) => {
  try {
    const ticket = await SupportTicket.find({
      assignedTo: req.customer._id,
      status: Status[30],
    }).sort({ createdAt: -1 });
    if (ticket) {
      res.status(200).json({
        success: true,
        message: "Successfully fetch myCompletedTickets",
        ticket,
      });
    } else {
      res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const myAssignedTickets = async (req, res) => {
  try {
    const ticket = await SupportTicket.find({
      assignedTo: req.customer._id,
      status: Status[20],
    }).sort({ createdAt: -1 });
    if (ticket) {
      res.status(200).json({
        success: true,
        message: "Successfully fetch myAssignedTickets",
        ticket,
      });
    } else {
      res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const featuredTickets = async (req, res) => {
  try {
    const ticket = await SupportTicket.find({
      status: Status[10],
    })
      .sort({ createdAt: -1 })
      .limit(5);
    if (ticket) {
      res.status(200).json({
        success: true,
        message: "Successfully fetch featuredTickets",
        ticket,
      });
    } else {
      res.status(404).json({ message: "Ticket not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
