var GithubRegister = artifacts.require("./GithubRegister.sol");

module.exports = function(deployer) {
  deployer.deploy(GithubRegister);
};
