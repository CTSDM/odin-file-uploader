import { Router } from "express";
import fileControllers from "../controllers/file_controllers.js";

const router = Router();

router.post("/upload", fileControllers.uploadFile);

export default router;
