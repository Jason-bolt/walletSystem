import mongoose from "mongoose";
import User from "./User";

const { Schema } = mongoose;

const account = new Schema({
  accountNumber: {
    type: Number,
    required: true,
  },
  amount: {
    type: Number,
    default: 0.0,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: User,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

const Account = mongoose.model("Account", account);

export default Account;
