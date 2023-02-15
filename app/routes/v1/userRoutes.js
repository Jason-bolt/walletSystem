import { Router } from "express";
import Controllers from "../../controllers";
import middlewares from "../../middlewares";

const { UserMiddleware } = middlewares;
const { UserController } = Controllers;

const router = new Router();

router.get("/", (req, res) => {
  res.send("Welcome to wallet system");
});
router.post("/signup", [
  UserMiddleware.validateUser,
  UserController.createUser,
]);

export default router;
