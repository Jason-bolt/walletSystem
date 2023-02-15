import mongoose from "mongoose";
import User from "./User.js";

const { Schema } = mongoose;

const transfer = new Schema({
  currency: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  accountNumber: {
    type: Number,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: User,
  },
});

const Transfer = mongoose.model("Transfer", transfer);

export default Transfer;
