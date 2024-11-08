const { Router } = require("express");
const loginController = require("../controllers/login_controller.js");
const router = Router();

router.get("/", loginController.getLogin);
router.post("/", loginController.postLogin);

module.exports = router;
