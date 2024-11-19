import { Router } from "express";
import fileControllers from "../controllers/file_controllers.js";

const router = Router();

router.post("/upload", fileControllers.uploadFile);
router.get("/download/:id", fileControllers.downloadFile);
router.get("/delete/:id", fileControllers.deleteFile);
router.post("/update/:id", fileControllers.updateFileName);

export default router;
