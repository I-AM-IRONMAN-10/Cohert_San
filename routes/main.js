const express = require("express");
const router = express.Router();
const controller = require("../controllers/mainController");

router.post("/", controller.create);
router.get("/", controller.list);
router.delete("/:id", controller.remove);

module.exports = router;
