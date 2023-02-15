import mongoose from "mongoose";

const { Schema } = mongoose;

const user = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  pin: {
    type: Number,
  },
  otp: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", user);

export default User;
