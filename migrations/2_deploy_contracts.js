var SmartInvestments = artifacts.require("./SmartInvestments.sol");
var SafeMath = artifacts.require("./SafeMath.sol");

module.exports = function (deployer) {
    deployer.deploy(SafeMath);
    deployer.link(SafeMath, SmartInvestments);
    deployer.deploy(SmartInvestments);
};
