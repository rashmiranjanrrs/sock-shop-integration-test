const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();
const crypto = require("crypto");
const SERVER_URL = "http://edge-router:80";

chai.use(chaiHttp);

let username = crypto.randomBytes(8).toString("hex");
let password = username + "@123";
let email = username + "@gmail.com";
let userId = "";
let catalogueId = "";

describe("Authenication", () => {
  it("should register a new user", (done) => {
    chai
      .request(SERVER_URL)
      .post("/register")
      .send({
        username,
        password,
        email,
      })
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a("object");
        res.body.should.have.property("id");
        res.body.id.should.be.a("string");
        userId = res.body.id;
        done();
      });
  });

  it("should login user", (done) => {
    chai
      .request(SERVER_URL)
      .get("/login")
      .auth(username, password, { type: "basic" })
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(200);
        done();
      });
  });
});

describe("Catalogue and Cart", () => {
  it("should get catalogue", (done) => {
    chai
      .request(SERVER_URL)
      .get("/catalogue?size=5")
      .auth(username, password, { type: "basic" })
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(200);
        res.body = JSON.parse(res.text)
        res.body.should.be.a("array");
        res.body[0].should.be.a("object")
        res.body[0].should.have.property("id");
        res.body[0].id.should.be.a("string")
        catalogueId = res.body[0].id;
        done();
      });
  });

  it("should get catalogue detail", (done) => {
    chai
      .request(SERVER_URL)
      .get("/catalogue/" + catalogueId)
      .auth(username, password, { type: "basic" })
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(200);
        res.text.should.be.a("string");
        res.body = JSON.parse(res.text)
        res.body.should.be.a("object")

        // check if all properties are present in object
        res.body.should.have.property("id");
        res.body.should.have.property("name");
        res.body.should.have.property("description");
        res.body.should.have.property("imageUrl");
        res.body.should.have.property("price");
        res.body.should.have.property("count");
        res.body.should.have.property("tag");

        // check if all properties datatype are correct
        res.body.id.should.be.a("string");
        res.body.name.should.be.a("string");
        res.body.description.should.be.a("string");
        res.body.imageUrl.should.be.a("array");
        res.body.price.should.be.a("number");
        res.body.count.should.be.a("number");
        res.body.tag.should.be.a("array");

        should.equal(catalogueId, JSON.parse(res.text).id);
        done();
      });
  });

  it("should add to cart", (done) => {
    chai
      .request(SERVER_URL)
      .post("/cart")
      .send({
        id: catalogueId,
      })
      .auth(username, password, { type: "basic" })
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(201);
        done();
      });
  });
});

describe("User Addresses and Cards", () => {
  it("should get user address", (done) => {
    chai
      .request(SERVER_URL)
      .get(`/customers/${userId}/addresses`)
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(404);
        done();
      });
  });


  it("should create address || error", (done) => {
    chai
      .request(SERVER_URL)
      .post("/addresses")
      .send({
        street: "ctc road",
        number: "9692312931",
        country: "India",
        city: "Bhubaneswar",
        postcode: "751002",
        userID: userId,
      })
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(200);
        res.body = JSON.parse(res.text);
        res.body.should.be.a("object");
        res.body.should.have.property("error");
        res.body.error.should.equal("Do: Invalid Id Hex");
        res.body.status_code.should.equal(500);
        res.body.status_text.should.equal("Internal Server Error");
        done();
      });
  });

  it("should get addresses", (done) => {
    chai
      .request(SERVER_URL)
      .get(`/addresses`)
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(200);
        res.body = JSON.parse(res.text);
        res.body.should.be.a("object");
        res.body.should.have.property("_embedded");
        res.body._embedded.should.have.property("address");
        res.body._embedded.should.be.a("object");
        res.body._embedded.address.should.be.a("array");
        done();
      });
  });

  it("should create card || error", (done) => {
    chai
      .request(SERVER_URL)
      .post("/cards")
      .send({
        longNum: "789545126221",
        expires: "12/25",
        ccv: "789",
        userID: userId,
      })
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(200);
        res.body = JSON.parse(res.text);
        res.body.should.be.a("object");
        res.body.should.have.property("error");
        res.body.error.should.equal("Do: Invalid Id Hex");
        res.body.status_code.should.equal(500);
        res.body.status_text.should.equal("Internal Server Error");
        done();
      });
  });

  it("should get cards", (done) => {
    chai
      .request(SERVER_URL)
      .get("/cards")
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(200);
        res.body = JSON.parse(res.text);
        res.body.should.be.a("object");
        res.body.should.have.property("_embedded");
        res.body._embedded.should.have.property("card");
        res.body._embedded.should.be.a("object");
        res.body._embedded.card.should.be.a("array");
        done();
      });
  });

});

describe("Remove Test User", () => {
  it("should delete created user", (done) => {
    chai
      .request(SERVER_URL)
      .delete(`/customers/${userId}`)
      .end((err, res) => {
        if (err) done(err);
        res.should.have.status(200);
        res.body = JSON.parse(JSON.parse(res.text));
        res.body.should.have.property("status");
        done();
      });
  });
});
