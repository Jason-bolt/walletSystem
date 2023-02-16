import mongoose from "mongoose";
import User from "./User";

const { Schema } = mongoose;

const otp_records = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: User,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  expireAt: {
    type: Date,
    default: Date.now() + 600000, // Plus 10 minutes
  },
});

const Otp = mongoose.model("Otp", otp_records);

export default Otp;
