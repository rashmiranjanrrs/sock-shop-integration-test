const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();

const SERVER_URL = "http://localhost";

chai.use(chaiHttp);

let createdUserId;

describe("Authenication", () => {
  it("should register a new user", (done) => {
    chai
      .request(SERVER_URL)
      .post("/register")
      .send({
        username: "rashmiranjanrrs",
        password: "rashmi@123",
        email: "sahoorashmiranjan11@gmail.com",
      })
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a("object");
        res.body.should.have.property("id");
        done();
      });
  });

  it("should login user", (done) => {
    chai
      .request(SERVER_URL)
      .get("/login")
      .auth("rashmiranjanrrs","rashmi@123", {type: "basic"})
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(200);
        done();
      });
  });
});
