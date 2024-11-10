import { Router } from "express";
import filesControllers from "../controllers/file_controllers.js";
import directoryControllers from "../controllers/directory_controllers.js";

const router = Router();

router.get("/", directoryControllers.getHomepage);
router.post("/", filesControllers.uploadFile);

export default router;
