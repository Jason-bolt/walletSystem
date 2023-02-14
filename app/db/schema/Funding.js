import mongoose from "mongoose";

const { Schema } = mongoose;

const funding = new Schema({
  currency: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: User,
  },
});

const Funding = mongoose.model("Funding", funding);

export default Funding;
