import { expect } from "chai";
import { isNumeric } from "/imports/utils/";

describe("isNumeric", function() {
  it("isNumeric with various params", async function() {
    expect(isNumeric(1)).to.be.false;
    expect(isNumeric("toto")).to.be.false;
    expect(isNumeric("1")).to.be.true;
    expect(isNumeric("1.0")).to.be.true;
    expect(isNumeric("1.0.1")).to.be.true;
  });
});
