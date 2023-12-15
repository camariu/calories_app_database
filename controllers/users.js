const {
  createUser,
  loginUser,
  findUser,
} = require("../services/index.js");

const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET;

const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");

const createUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await createUser({
      email,
      password,
    });
    const payload = { email: result.email };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    res.status(201).json({
      status: "success",
      code: 201,
      data: {
        user: {
          email: result.email,
          token,
        },
      },
    });
  } catch (error) {
    res.status(409).json({
      status: 409,
      error: "Email in use!",
    });
  }
};

const loginUserController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const payload = { email: email };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    const result = await loginUser({
      email,
      password,
      token,
    });
    result.setToken(token);
    res.status(201).json({
      status: "succes",
      code: 201,
      data: {
        token: token,
        user: {
          email: result.email,
          subscription: result.subscription,
        },
      },
    });
  } catch (error) {
    if (error.message === "Wrong email or password") {
      res.status(401).json({
        status: 401,
        message: "Email or password is wrong",
      });
    }
    res.status(400).json({
      status: 400,
      error: error.message,
    });
  }
};

const logoutUserController = async (req, res, next) => {

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ status: 401, message: "Not authorized" });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, secret);
    const user = await findUser(decodedToken);
    user.setToken(null);
    await user.save();
    if (user) {
      res.status(204).json({
        status: "success",
        code: 204,
      });
    } else {
      res.status(404).json({ status: "404", message: "User not found" });
    }
  } catch (error) {
      res.status(401).json({ status: 401, message: "Not authorized" });
    }     
};

const getUsersController = async (req, res, next) => {
   
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ status: 401, message: "Not authorized" });
    }
    const token = authHeader.split(" ")[1];
    const user = jwt.verify(token, secret);
    const result = await findUser({ email: user.email });
    if (result) {
      res.status(200).json({
        status: "success",
        code: 200,
        data: {
          email: result.email,
          subscription: result.subscription,
        },
      });
    } else {
      res.status(404).json({ status: "404", message: "User not found" });
    }
  } catch (error) {
    if (error.message === "invalid token") {
      res.status(401).json({ status: 401, message: "Not authorized" });
    }
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

const uploadAvatarController = async (req, res, next) => {
  console.log("test")
  try {
    if (!req.file) {
      return res.status(404).json({ error: "You must upload an avatar!" });
    }

    const fileName = `${req.user._id}-${Date.now()}${path.extname(
      req.file.originalname
    )}`;

    const tmpFolderPath = path.join(__dirname, "../tmp");
    const destinationFolderPath = path.join(__dirname, `../public/avatars`);
    const destinationPath = path.join(destinationFolderPath, fileName);

    if (!fs.existsSync(tmpFolderPath)) {
      fs.mkdirSync(tmpFolderPath);
    }

    await Jimp.read(req.file.path)
      .then((image) => {
        return image
          .resize(250, 250)
          .writeAsync(tmpFolderPath + "/" + fileName);
      })
      .then(() => {
        fs.renameSync(tmpFolderPath + "/" + fileName, destinationPath);
        fs.unlinkSync(req.file.path);
      })
      .catch((error) => {
        throw error;
      });

    req.user.avatarURL = `http://localhost:3000/avatars/${fileName}`;

    await req.user.save();

    res.status(200).json({ avatarURL: req.user.avatarURL });
  } catch (error) {
    res.status(404).json({ error: error.message });
    next(error);
  }
};





module.exports = {

  createUserController,
  loginUserController,
  logoutUserController,
  getUsersController,
  uploadAvatarController

};