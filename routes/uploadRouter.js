const { Router } = require("express");
const uploadController = require("../controllers/upload_controllers.js");

const router = new Router();

router.get("/", uploadController.getHomepageUpload);
router.post("/", uploadController.postUploadFile);

module.exports = router;
