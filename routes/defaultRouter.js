const { Router } = require("express");
const getPrint = require("../controllers/default_controllers");

const router = Router();
router.get("/", getPrint);

module.exports = router;
