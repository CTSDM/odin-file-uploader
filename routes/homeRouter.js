const { Router } = require("express");
const filesControllers = require("../controllers/file_controllers");
const directoryControllers = require("../controllers/directory_controllers.js");

const router = new Router();

router.get("/", directoryControllers.getHomepage);
router.post("/", filesControllers.postUploadFile);

module.exports = router;
