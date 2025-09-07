const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    vin: { type: String, unique: true, sparse: true },

    // Specifications
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Hybrid", "Electric"],
      required: true,
    },
    transmission: {
      type: String,
      enum: ["Automatic", "Manual", "CVT"],
      required: true,
    },
    engineCapacity: { type: String },
    mileage: { type: Number, default: 0 },
    color: String,
    doors: { type: Number, min: 2, max: 6 },
    seats: { type: Number, min: 2, max: 20 },
    airConditioning: { type: Boolean, default: true },

    // Rental details
    pricePerDay: { type: Number, required: true, min: 0 },
    pricePerHour: { type: Number, min: 0 },
    depositRequired: { type: Number, default: 0, min: 0 },
    availabilityStatus: {
      type: String,
      enum: ["Available", "Booked", "In Service", "Unavailable"],
      default: "Available",
    },
   availableFrom: {
   type: Date,
    },
   availableUntil: {
   type: Date,
   default: Date.now
    },
    pickupLocation: { type: String, required: true },
    dropoffOptions: [String],

    // Features
    features: {
      gps: { type: Boolean, default: false },
      bluetooth: { type: Boolean, default: false },
      usbSupport: { type: Boolean, default: false },
      childSeatAvailable: { type: Boolean, default: false },
      insuranceIncluded: { type: Boolean, default: true },
      extras: [{ type: String }],
    },

    // Media
    imageUrls: [{ type: String, required: true }],

    // Administrative
    insuranceExpiryDate: Date,
    serviceDueDate: Date,
  },
  { timestamps: true }
);

const Car = mongoose.model("Car", carSchema);

module.exports = Car;
