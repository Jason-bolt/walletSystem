import Services from "../services";

const { createUser } = Services;

class UserController {
  static createUser(req, res) {
    res.send("Welcome to Wallet System App!");
  }
}

export default UserController;
