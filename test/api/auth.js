
const expect = require("chai").expect
const request = require("supertest")

const app = require("../../index.js")

describe("POST /api/auth/register", () => {
  it("Ok, registering user works", (done) => [
    request(app).post("/api/auth/register")
      .send({
        username: "test1",
        password: "test1234",
      })
      .then((res) => {
        const body = res.body
        expect(body).to.contain.property("_id")
        expect(body).to.contain.property("username")
        expect(body).to.contain.property("isAdmin")
        expect(body).to.contain.property("likes")
        expect(body).to.contain.property("tweets")
        expect(body).to.contain.property("retweets")
        done()
      })
  ])
})

describe("POST /api/auth/login", () => {
  it("Ok, logging in user works", (done) => {
    request(app).post("/api/auth/login")
      .send({
        username: "test0",
        password: "test0000",
      })
      .then((res) => {
        const body = res.body
        expect(body).to.contain.property("_id")
        expect(body).to.contain.property("username")
        expect(body).to.contain.property("isAdmin")
        expect(body).to.contain.property("likes")
        expect(body).to.contain.property("tweets")
        expect(body).to.contain.property("retweets")
        done()
      })
  })
})