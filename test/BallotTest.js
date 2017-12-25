var Ballot = artifacts.require("Ballot");

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


  it("should be initialized with two proposals", function() {
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
      assert.equal(weight, 0, 'not allowed voter has rights to vote');
    })
  })


  it("should be able to delegate", function() {
    var ballot;
    var delegator = accounts[0];
    var delegatee = accounts[3];
    return Ballot.deployed().then(function(instance) {
      ballot = instance;
      return ballot.giveRightToVote(delegatee)
    }).then(function() {
      return ballot.delegate(delegatee  )
    }).then(function() {
      return ballot.voters.call(delegatee);
    }).then(function(delegatee) {
      let weight = delegatee[0].toNumber();
      assert.equal(weight, 2, "delegatee shoud have weight equals 2");
    })
  });


  it("should be able to vote", function() {
    var ballot;
    var votesCountBefore;
    var votesCountAfter;
    return Ballot.deployed().then(function(instance) {
      ballot = instance;
      return ballot.proposals.call(0);
    }).then(function(firstProposal) {
      votesCountBefore = firstProposal[1].toNumber();
      return ballot.vote(0, {from: accounts[1]});
    }).then( function()  {
      return ballot.proposals.call(0);
    }).then(function(firstProposal)  {
      votesCountAfter = firstProposal[1].toNumber();
      return ballot.voters.call(accounts[1]);
    }).then(function(voter) {
      let weight = voter[0];
      let isVoted = voter[1];
      let votedProposal = voter[3];
      let difference = votesCountAfter - votesCountBefore;

      assert.isTrue(isVoted, "The voter didn't vote");
      assert.equal(votedProposal, 0, "The proposal's indexes didn't match");
      assert.equal(weight, difference, "The proposal's votes count didn't change");
    });
  });


 it("should be able to choose winner", function() {
    var ballot;
    var winnerIndex = 0;
    var winnerName = "first proposal";
    return Ballot.deployed().then(function(instance) {
      ballot = instance;
      return ballot.vote(winnerIndex, {from: accounts[1]});
    }).then(function() {
      return ballot.winningProposal.call();
    }).then(function(winningProposal) {
      assert.equal(winningProposal, winnerIndex, "Winner index must be equal to winning proposal value");
      return ballot.winnerName.call();
    }).then(function(proposalName) {
       winnerProposalName = web3.toUtf8(proposalName);
      assert.equal(winnerProposalName, winnerName, "Winning proposal name must be equal to first proposal name");
    });
  });

});
