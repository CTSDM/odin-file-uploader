import { Router } from "express";
import { getPrint } from "../controllers/default_controllers.js";

const router = Router();
router.get("/", getPrint);

export default router;
