// backend/models/Device.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const DeviceSchema = new Schema({
  deviceType: { type: String, required: true },
  name: String,
  email: String,
  phone: String,
  condition: String,
  price: Number,
  description: { type: [String] },
  images: [String], // saved filenames
  details: { type: Schema.Types.Mixed }, // device-specific fields
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Device", DeviceSchema);
