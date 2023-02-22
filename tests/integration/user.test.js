import chai from "chai";
import chaiHttp from "chai-http";
import app from "../../index";

const { expect } = chai;
chai.use(chaiHttp);

describe("User routes", () => {
  it("Register a user", (done) => {
    chai
      .request(app)
      .post("/api/v1/user/")
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done(err);
      });
  });
});
