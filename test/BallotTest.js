var Ballot = artifacts.require("./Ballot.sol");

contract('Ballot', function(accounts) {

  //testing contract's constructor
  it("should initialize the contract owner as the chairperson", function() {
    var ballot;
    return Ballot.deployed().then(function(instance) {
      ballot = instance;
      return ballot.chairperson.call();
    }).then(function(chairperson) {
      assert.equal(chairperson, accounts[0]);
    })
  });

  it("should be initialized with two proposal", function() {
    var ballot;
    return Ballot.deployed().then(function(instance) {
      ballot = instance;
      return ballot.proposals.call(0);
    }).then(function(firstProposal) {
      let first = web3.toUtf8(firstProposal[0]);
      assert.equal(first, "first proposal", "first proposal should have been created");
      return ballot.proposals.call(1);
    }).then(function(secondProposal) {
      let second = web3.toUtf8(secondProposal[0]);
      assert.equal(second, "second proposal", "second proposal should have been created");
    })
  });

  //modifying the state of the contract
  it("should allow a registered voter to vote on a proposal", function() {
    var ballot;
    var allowedVoter = accounts[1];
    var notAllowedVoter = accounts[2];
    return Ballot.deployed().then(function(instance) {
      ballot = instance;
      return ballot.giveRightToVote(allowedVoter)
    }).then(function() {
      return ballot.voters.call(allowedVoter);
    }).then(function(voter) {
      let weight = voter[0].toNumber();
      assert.equal(weight, 1, 'allowed voter do not have rights to vote');
    })
  })


  it("should not allow an unregistered voter to vote on a proposal", function() {
    var ballot;
    var notAllowedVoter = accounts[2];
    return Ballot.deployed().then(function(instance) {
      ballot = instance;
      return ballot.voters.call(notAllowedVoter);
    }).then(function(voter) {
      let weight = voter[0].toNumber();
      assert.equal(weight, 0, 'not allowed voter do not have rights to vote');
    })
  })

  it("should be able to delegate", function() {
    var ballot;
    var delegator = accounts[3];
    var delegatee = accounts[4];
    return Ballot.deployed().then(function(instance) {
      ballot = instance;
      return ballot.giveRightToVote(delegator)
    }).then(function() {
      return ballot.giveRightToVote(delegatee)
    }).then(function() {
      return ballot.delegate(delegatee, { from: delegator });
    }).then(function() {
      return ballot.voters.call(delegatee);
    }).then(function(delegatee) {
      return delegatee[0].toNumber();
      assert.equal(weight, 2, "delegatee shoud have weight");
    })
  })

});
