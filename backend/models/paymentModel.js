const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    paymentID: {
      type: String,
      required: true,
    },
    cart: {
      type: Array,
      default: [],
    },
    address: {
      type: Object,
      required: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payments", paymentSchema);
