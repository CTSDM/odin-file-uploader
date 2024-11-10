const { Router } = require("express");
const directoryController = require("../controllers/directoryController'js");
const fileController = require("../controllers/fileController.js");
const router = new Router();

router.get("/", directoryController.showDirectories);
router.get("/:identifier", directoryController.showDirectories);
router.post("/newDirectory", directoryController.create);
router.post("/newFile", fileController.create);

module.exports = router;
