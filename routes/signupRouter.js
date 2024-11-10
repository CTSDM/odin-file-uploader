import { Router } from "express";
import signUpController from "../controllers/signup_controller.js";

const router = Router();
router.get("/", signUpController.getCreateUser);
router.post("/", signUpController.postCreateUser);

export default router;
