import Schemas from "../db/schema";
import bcrypt from "bcrypt";

const { User } = Schemas;

class UserService {
  static async createUser(user) {
    const { firstName, lastName, email, phone, password } = user;
    const hashed_password = await bcrypt.hash(password);
    const newUser = await User.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      password: hashed_password,
      pin: null,
      otp: 1234,
    });
  }
}

export default UserService;
