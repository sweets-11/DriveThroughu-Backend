import express from "express";
import {
  createSupportTicket,
  updateChat,
  getAllChats,
  getSupportTickets,
  getTicket,
  getAllChatsSupportSide,
  updateChatSupportSide,
  toCloseTickets,
  myCompletedTickets,
  featuredTickets,
  myAssignedTickets,
} from "../controller/supportTicket.js";
import {
  isAuthenticated,
  isAuthenticatedCustomerAgent,
} from "../middleware/auth.js";

const router = express.Router();

router.route("/createTicket").post(isAuthenticated, createSupportTicket);
router.route("/updateChat").post(isAuthenticated, updateChat);
router.route("/getAllChats").post(isAuthenticated, getAllChats);
router
  .route("/getAllSupportTickets")
  .post(isAuthenticatedCustomerAgent, getSupportTickets);
router.route("/getTicket").post(isAuthenticatedCustomerAgent, getTicket);
router
  .route("/getAllSupportSideChats")
  .post(isAuthenticatedCustomerAgent, getAllChatsSupportSide);
router
  .route("/updateChatSupportSide")
  .post(isAuthenticatedCustomerAgent, updateChatSupportSide);
router
  .route("/toCloseTickets")
  .post(isAuthenticatedCustomerAgent, toCloseTickets);
router
  .route("/myCompletedTickets")
  .post(isAuthenticatedCustomerAgent, myCompletedTickets);
router
  .route("/myAssignedTickets")
  .post(isAuthenticatedCustomerAgent, myAssignedTickets);
router
  .route("/featuredTickets")
  .post(isAuthenticatedCustomerAgent, featuredTickets);

export default router;
