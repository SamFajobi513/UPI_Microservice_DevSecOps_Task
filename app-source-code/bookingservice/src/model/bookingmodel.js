const pool = require("../config/database");

const createBooking = async (userId, pickup, dropoff) => {
  const query = `
    INSERT INTO bookings (user_id, pickup_location, dropoff_location, status) 
    VALUES ($1, $2, $3, $4) RETURNING *;
  `;
  const values = [userId, pickup, dropoff, "pending"];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = { createBooking };
