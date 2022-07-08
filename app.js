const { request } = require("express");
const express = require("express");
const app = express();

app.use(express.json());

app.post("/split-payments/compute", (req, res) => {
  const payload = req.body;
  const { Amount, ID, SplitInfo } = payload;

  let finalAmount = Amount;
  let response = {
    ID,
    Balance: 0,
    SplitBreakdown: [],
  };

  const flatSplit = SplitInfo.filter(
    (e) => e.SplitType.toLowerCase() === "flat"
  );

  const percentageSplit = SplitInfo.filter(
    (e) => e.SplitType.toLowerCase() === "percentage"
  );

  const ratioSplit = SplitInfo.filter(
    (e) => e.SplitType.toLowerCase() == "ratio"
  );

  if (flatSplit.length > 0) {
    // Compute flat calculations
    flatSplit.forEach((element) => {
      const { SplitEntityId, SplitValue } = element;

      // Flat calculations have their amount equal to their splitvalue
      finalAmount -= SplitValue;
      response.SplitBreakdown.push({ SplitEntityId, Amount: SplitValue });
    });
  }

  if (percentageSplit.length > 0) {
    percentageSplit.forEach((element) => {
      const { SplitEntityId, SplitValue } = element;

      //Percentage calculations
      const amount = (SplitValue * finalAmount) / 100;
      finalAmount -= amount;

      response.SplitBreakdown.push({ SplitEntityId, Amount: amount });
    });
  }

  if (ratioSplit.length > 0) {
    const openingRatioBalance = finalAmount;
    const totalRatio = ratioSplit.reduce(ratioReducer, 0);

    ratioSplit.forEach((element) => {
      console.log("in ratio split");
      const { SplitEntityId, SplitValue } = element;

      //Ratio calculations
      const amount = (openingRatioBalance * SplitValue) / totalRatio;
      finalAmount -= amount;

      response.SplitBreakdown.push({ SplitEntityId, Amount: amount });
    });
  }

  response.Balance = finalAmount;
  res.status(200).json(response);
});

const ratioReducer = (prev, curr) => {
  return prev + curr.SplitValue;
};

module.exports = app;
