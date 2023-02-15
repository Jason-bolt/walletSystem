import { Router } from "express";
import Controllers from "../../controllers";

const router = new Router();

router.get("/", [Controllers.createUser]);

export default router;
