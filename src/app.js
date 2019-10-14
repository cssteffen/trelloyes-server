require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const uuid = require("uuid/v4");
const cardRouter = require("./card/card-router");
const listRouter = require("./list/list-router");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common"; //or use dev in place of common

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
//app.use(express.json()); //must be applied to parse the JSON data in the request body.

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: "Unauthorized request" });
  }
  next();
});

//USING cardRouter
app.use(cardRouter);

//USING listRouter
app.use(listRouter);

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

//production app hides error messages from users & malicious parties
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
