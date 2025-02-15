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


