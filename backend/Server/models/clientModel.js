const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  status: { type: String, default: "New" } // Great for your dashboard "eye feast"
}, { 
  timestamps: true // Automatically adds 'createdAt' and 'updatedAt'
});

module.exports = mongoose.model("Client", clientSchema);