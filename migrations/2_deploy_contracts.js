var SmartInvestments = artifacts.require("./SmartInvestments.sol");
var Investments = artifacts.require("./Investments.sol");
var SafeMath = artifacts.require("./SafeMath.sol");

module.exports = function (deployer) {
    /*deployer.deploy(SafeMath);
    deployer.link(SafeMath, SmartInvestments);*/
    deployer.deploy(SmartInvestments);
};
