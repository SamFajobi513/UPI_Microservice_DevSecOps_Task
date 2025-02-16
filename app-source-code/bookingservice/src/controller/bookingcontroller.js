const { createBooking } = require("../models/bookingModel");
const { publishNewRideRequest } = require("./services/kafkaProducer");
const { invokeDriverMatching } = require("./services/daprClient");


exports.bookRide = async (req, res) => {
  try {
    const { userId, pickup, dropoff } = req.body;
    
  
    const newBooking = await createBooking(userId, pickup, dropoff);

    // Publish event to Kafka
    await publishNewRideRequest(newBooking);

    // Call Driver Matching Service via Dapr
    await invokeDriverMatching(newBooking);

    res.status(201).json({ message: "Ride booked successfully", newBooking });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
