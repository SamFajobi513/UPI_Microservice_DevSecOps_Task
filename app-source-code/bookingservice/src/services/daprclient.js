const axios = require("axios");

exports.invokeDriverMatching = async (booking) => {
  const daprUrl = `http://localhost:3500/v1.0/invoke/driver-matching-service/method/matchDriver`;

  try {
    const response = await axios.post(daprUrl, booking);
    console.log("Driver assigned:", response.data);
  } catch (error) {
    console.error("Failed to assign driver:", error);
  }
};
