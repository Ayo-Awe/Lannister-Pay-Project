const request = require("supertest");
const app = require("./app");

test("Post /payment", async () => {
  const response = await request(app).post("/");

  expect(response.statusCode).toBe(200);
});
