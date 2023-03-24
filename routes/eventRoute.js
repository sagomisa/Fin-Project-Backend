// Create event route

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

router.post("/createEvent", createEvent);
router.get("/getAllEvents", protect, getAllEvents);
router.get("/getEventById/:id", protect, getEventById);
router.put("/updateEvent/:id", updateEvent);
router.delete("/deleteEvent/:id", deleteEvent);

module.exports = router;
