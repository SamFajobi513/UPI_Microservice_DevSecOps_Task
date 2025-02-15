const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "booking-service",
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();
producer.connect();

exports.publishNewRideRequest = async (booking) => {
  await producer.send({
    topic: "new_ride_requests",
    messages: [{ value: JSON.stringify(booking) }],
  });
  console.log("Published new ride request:", booking);
};
