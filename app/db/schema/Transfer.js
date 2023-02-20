import mongoose from "mongoose";
import Account from "./Account";

const { Schema } = mongoose;

const transfer = new Schema({
  currency: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    default: 0.0,
  },
  senderAccount: {
    type: Number,
    ref: Account,
  },
  recipientAccount: {
    type: Number,
    ref: Account,
  },
  type: {
    type: String,
    default: "transfer",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Transfer = mongoose.model("Transfer", transfer);

export default Transfer;
