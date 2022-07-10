const { computeSplitPayment } = require("./Controllers/appController");
const express = require("express");
const app = express();

app.use(express.json());

app.post("/split-payments/compute", (req, res) => {
  try {
    const payload = req.body;
    const response = computeSplitPayment(payload);
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(400).json(error.message);
  }
});

app.all("*", (req, res) => {
  res.status(404).json({ error: "404", message: "Resource Not Found" });
});

module.exports = app;
