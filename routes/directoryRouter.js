const { Router } = require("express");
const directoryControllers = require("../controllers/directory_controllers.js");
const router = new Router();

// The directory path cannot be used by its own
// In that case we go back to the home directory
router.get("/", directoryControllers.getHomepage);
router.post("/newDir", directoryControllers.createDir);

module.exports = router;
