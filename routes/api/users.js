const express = require("express");
const { auth } = require("../../middewares/auth.js");
const router = express.Router();
const controller = require("../../controllers/users.js");

const path = require("path")
const multer = require("multer")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/avatars");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post("/users/register", controller.createUserController);

router.post("/users/login", controller.loginUserController);

router.get("/users/logout", auth, controller.logoutUserController);

router.get("/users/current", auth, controller.getUsersController);

router.patch("/users/avatars", auth, upload.single("avatar"), controller.uploadAvatarController);


module.exports = router;