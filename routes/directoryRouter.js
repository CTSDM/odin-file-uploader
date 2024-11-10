import { Router } from "express";
import directoryControllers from "../controllers/directory_controllers.js";
const router = Router();

// The directory path cannot be used by its own
// In that case we go back to the home directory
router.get("/", directoryControllers.getHomepage);
router.post("/newDir", directoryControllers.createDir);
router.get("/:id", directoryControllers.getDirectory);

export default router;
