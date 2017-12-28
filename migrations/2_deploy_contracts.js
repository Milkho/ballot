var Ballot = artifacts.require("Ballot");

module.exports = function(deployer, network, accounts) {
	var proposals = ['first proposal', 'second proposal'];
	if(network == "test") {
		deployer.deploy(Ballot, proposals,  {overwrite:false});
	}
	else if(network == "rinkeby") {
		deployer.deploy(Ballot, proposals);
	}
};
