const { request } = require("express");
const express = require("express");
const app = express();

app.post("/", (req, res) => {
  res.status(200).end();
});

module.exports = app;
