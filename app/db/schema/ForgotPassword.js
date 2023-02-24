import mongoose from 'mongoose';
import User from './User';

const { Schema } = mongoose;

const forgot_password = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: User,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  expireAt: {
    type: Date,
    default: Date.now() + 600000, // Plus 10 minutes (600000), 1 hour (3600000)
  },
});

const Forgot_Password = mongoose.model('Forgot_Password', forgot_password);

export default Forgot_Password;
