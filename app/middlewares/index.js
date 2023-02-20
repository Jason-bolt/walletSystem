import UserMiddleware from "./userMiddleware.js";
import AuthMiddleware from "./auth/index.js";
import AccountMiddleware from "./accountMiddleware.js";

const middlewares = {
  UserMiddleware,
  AuthMiddleware,
  AccountMiddleware,
};

export default middlewares;
