const express = require("express");
const dotenv = require("dotenv");
const bookingRoutes = require("../routes/bookingRoutes");

dotenv.config();
const app = express();

app.use(express.json());
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));
