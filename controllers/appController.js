const computeSplitPayment = (payload) => {
  const { Amount, ID, SplitInfo } = payload;

  let response = {
    ID,
    Balance: Amount,
    SplitBreakdown: [],
  };

  const { flat, percentage, ratio } = seperateSplitTypes(SplitInfo);

  // Compute flat payments
  if (flat) {
    const [breakdowns, newAmount] = computeFlat(response.Balance, flat);
    response.SplitBreakdown.push(...breakdowns);
    response.Balance = newAmount;
  }

  // Compute percentage payments
  if (percentage) {
    const [breakdowns, newAmount] = computePercentage(
      response.Balance,
      percentage
    );
    response.SplitBreakdown.push(...breakdowns);
    response.Balance = newAmount;
  }

  // Compute ratio payments
  if (ratio) {
    const [breakdowns, newAmount] = computeRatio(response.Balance, ratio);
    response.SplitBreakdown.push(...breakdowns);
    response.Balance = newAmount;
  }

  return response;
};

const seperateSplitTypes = (splitInfo) => {
  // returns an array with just flat SplitType objects
  const flatSplit = splitInfo.filter(
    (e) => e.SplitType.toLowerCase() === "flat"
  );

  // returns an array with just percentage SplitType objects
  const percentageSplit = splitInfo.filter(
    (e) => e.SplitType.toLowerCase() === "percentage"
  );

  // returns an array with just ratio SplitType objects
  const ratioSplit = splitInfo.filter(
    (e) => e.SplitType.toLowerCase() == "ratio"
  );

  const flat = flatSplit.length > 0 ? flatSplit : null;
  const percentage = percentageSplit.length > 0 ? percentageSplit : null;
  const ratio = ratioSplit.length > 0 ? ratioSplit : null;

  return { flat, percentage, ratio };
};

const computeFlat = (amount, flatPayments) => {
  let newAmount = amount;
  const breakdowns = flatPayments.map((element) => {
    const { SplitEntityId, SplitValue } = element;

    // Flat calculations have their amount equal to their splitvalue
    newAmount -= SplitValue;

    return { SplitEntityId, Amount: SplitValue };
  });

  return [breakdowns, newAmount];
};

const computePercentage = (amount, percentageSplit) => {
  let newAmount = amount;
  const breakdowns = percentageSplit.map((element) => {
    const { SplitEntityId, SplitValue } = element;

    //Percentage calculations
    const splitAmount = (SplitValue * newAmount) / 100;
    newAmount -= splitAmount;

    return { SplitEntityId, Amount: splitAmount };
  });

  return [breakdowns, newAmount];
};

const computeRatio = (amount, ratioSplit) => {
  let newAmount = amount;

  const totalRatio = ratioSplit.reduce(ratioReducer, 0);

  // computes calculations and returns an array of the breakdown objects
  const breakdowns = ratioSplit.map((element) => {
    const { SplitEntityId, SplitValue } = element;

    //Percentage calculations
    const splitAmount = (SplitValue * amount) / totalRatio;
    newAmount -= splitAmount;

    return { SplitEntityId, Amount: splitAmount };
  });

  return [breakdowns, newAmount];
};

const ratioReducer = (prev, curr) => {
  return prev + curr.SplitValue;
};

module.exports = { computeSplitPayment };
