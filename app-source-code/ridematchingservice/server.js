const express = require("express");
const { Pool } = require("pg");
const kafka = require("kafka-node");
const Dapr = require("dapr-client");
require("dotenv").config();

const app = express();
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const daprClient = new Dapr.DaprClient({
  daprHost: "http://localhost",
  daprPort: process.env.DAPR_HTTP_PORT,
});

const kafkaClient = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BROKER });
const consumer = new kafka.Consumer(kafkaClient, [{ topic: "new-ride-requests", partition: 0 }], { autoCommit: true });

consumer.on("message", async (message) => {
  console.log("New Ride Request Received:", message.value);
  
  const rideRequest = JSON.parse(message.value);
  const { rideId, pickupLocation } = rideRequest;

  try {
    const driver = await findNearestDriver(pickupLocation);

    if (!driver) {
      console.log("No available drivers found.");
      return;
    }

    await assignDriverToRide(rideId, driver.id);

    console.log(`Driver ${driver.id} assigned to Ride ${rideId}`);

    await notifyBookingService(rideId, driver.id);
  } catch (error) {
    console.error("Error processing ride request:", error);
  }
});

async function findNearestDriver(location) {
  const { rows } = await pool.query("SELECT * FROM drivers WHERE status = 'available' LIMIT 1");
  return rows.length ? rows[0] : null;
}

async function assignDriverToRide(rideId, driverId) {
  await pool.query("UPDATE rides SET driver_id = $1, status = 'assigned' WHERE id = $2", [driverId, rideId]);
  await pool.query("UPDATE drivers SET status = 'busy' WHERE id = $1", [driverId]);
}

async function notifyBookingService(rideId, driverId) {
  const payload = { rideId, driverId, status: "assigned" };
  await daprClient.invoker.invoke(process.env.BOOKING_SERVICE_APP_ID, "update-ride-status", "POST", payload);
}

app.listen(process.env.PORT, () => {
  console.log(`🚀 Driver Matching Service running on port ${process.env.PORT}`);
});
