import { Router } from "express";
import loginController from "../controllers/login_controller.js";
const router = Router();

router.get("/", loginController.getLogin);
router.post("/", loginController.postLogin);

export default router;
