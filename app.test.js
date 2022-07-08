const { describe } = require("jest-circus");
const request = require("supertest");
const app = require("./app");

const testData = {
  ID: 13092,
  Amount: 4500,
  Currency: "NGN",
  CustomerEmail: "anon8@customers.io",
  SplitInfo: [
    {
      SplitType: "FLAT",
      SplitValue: 450,
      SplitEntityId: "LNPYACC0019",
    },
    {
      SplitType: "RATIO",
      SplitValue: 3,
      SplitEntityId: "LNPYACC0011",
    },
    {
      SplitType: "PERCENTAGE",
      SplitValue: 3,
      SplitEntityId: "LNPYACC0015",
    },
    {
      SplitType: "RATIO",
      SplitValue: 2,
      SplitEntityId: "LNPYACC0016",
    },
    {
      SplitType: "FLAT",
      SplitValue: 2450,
      SplitEntityId: "LNPYACC0029",
    },
    {
      SplitType: "PERCENTAGE",
      SplitValue: 10,
      SplitEntityId: "LNPYACC0215",
    },
  ],
};
const expectedResponse = {
  ID: 13092,
  Balance: 0,
  SplitBreakdown: [
    {
      SplitEntityId: "LNPYACC0019",
      Amount: 450,
    },
    {
      SplitEntityId: "LNPYACC0029",
      Amount: 2450,
    },
    {
      SplitEntityId: "LNPYACC0015",
      Amount: 48,
    },
    {
      SplitEntityId: "LNPYACC0215",
      Amount: 155.2,
    },
    {
      SplitEntityId: "LNPYACC0011",
      Amount: 838.08,
    },
    {
      SplitEntityId: "LNPYACC0016",
      Amount: 558.72,
    },
  ],
};

describe("POST /split-payments/compute", () => {
  test("should respond with 200 status code", async () => {
    // test split-payments endpoint
    const response = await request(app)
      .post("/split-payments/compute")
      .send(testData);

    expect(response.statusCode).toBe(200);
  });

  test("should have the ID, balance and splitBreakdown in the response body", async () => {
    const response = await request(app)
      .post("/split-payments/compute")
      .send(testData);
    body = response.body;
    expect(body.ID).toBeDefined();
    expect(body.Balance).toEqual(0);
    expect(body.SplitBreakdown.length).toEqual(6);
  });

  test("should contain correct payload calculations", async () => {
    // Make request to endpoint using the test payload
    const response = await request(app)
      .post("/split-payments/compute")
      .send(testData);

    expect(response.body).toHaveProperty("SplitBreakdown");
    const { SplitBreakdown } = response.body;

    // Test each transaction to match expected amount
    SplitBreakdown.forEach((transaction) => {
      // Find matching transaction in expected response dat
      const matchingTransaction = expectedResponse.SplitBreakdown.find(
        (element) => {
          if (element.SplitEntityId === transaction.SplitEntityId) return true;
        }
      );

      expect(matchingTransaction).toBeDefined();
      expect(transaction.Amount).toBeCloseTo(matchingTransaction.Amount);
    });
  });
});
