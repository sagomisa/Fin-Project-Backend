const User = require("../models/userModel");
const Event = require("../models/eventModel");

//Create Event
const createEvent = async (req, res) => {
  try {
    const { id, title, description, date } = req.body;

    // Validation
    if (!title || !description || !date) {
      res.status(400);
      throw new Error("Please fill in all the required fields.");
    }

    const user = await User.findById(id);

    const event = new Event({
      title,
      date,
      description,
    });

    // Save the event to the database
    const newEvent = await event.save();

    res.status(201).json(newEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Retrieve and return all events from the database.
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json(events);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Find a single event with a EventId
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an event identified by the EventId in the request
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date } = req.body;

    // Validation
    if (!title || !description || !date) {
      res.status(400);
      throw new Error("Please fill in all the required fields.");
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { title, description, date },
      { new: true }
    );

    res.status(200).json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

// Delete an event with the specified EventId
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
