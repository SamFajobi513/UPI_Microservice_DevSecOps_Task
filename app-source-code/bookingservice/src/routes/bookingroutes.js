const express = require("express");
const router = express.Router();
const { bookRide } = require("../controllers/bookingController");

router.post("/book", bookRide);

module.exports = router;
