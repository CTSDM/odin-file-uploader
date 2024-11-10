const { Router } = require("express");
const signUpController = require("../controllers/signup_controller.js");

const router = Router();
router.get("/", signUpController.getCreateUser);
router.post("/", signUpController.postCreateUser);

module.exports = router;
