const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const path = require("path")


const contactsRouter = require("./routes/api/users.js");

require("./middewares/passportConfig.js");

const dotenv = require("dotenv");
dotenv.config();

const app = express();
const formatsLogger = app.get("env") === "development" ? "dev" : "short";

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use("/api", contactsRouter);

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res) => {
  res.status(404).json({ message: "Nu este gasit" });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
