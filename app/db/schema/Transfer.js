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
  account: {
    type: Number,
    ref: Account,
  }
});

const Transfer = mongoose.model("Transfer", transfer);

export default Transfer;
