var Ballot = artifacts.require("Ballot");

contract('Ballot', accounts => {

  //testing contract's constructor
  it("should initialize the contract owner as the chairperson", async () => {
    let ballot = await Ballot.deployed();
    let chairperson = await ballot.chairperson.call();

    assert.equal(chairperson, accounts[0], "account owner should be equal to chairperson");
  });



  it("should be initialized with two proposals", async () => {
    let ballot = await Ballot.deployed();
    let firstProposal = await ballot.proposals.call(0);
    let secondProposal = await ballot.proposals.call(1);

    let firstProposalName = web3.toUtf8(firstProposal[0]);
    let secondProposalName = web3.toUtf8(secondProposal[0]);

    assert.equal(firstProposalName, "first proposal", "first proposal should have been created");
    assert.equal(secondProposalName, "second proposal", "second proposal should have been created");
  });



  //modifying the state of the contract
  it("should allow a registered voter to vote", async () => {
    let ballot = await Ballot.deployed();
    let allowedVoter = accounts[1];

    await ballot.giveRightToVote(allowedVoter);

    let voter = await ballot.voters.call(allowedVoter);
    let weight = voter[0].toNumber();

    assert.equal(weight, 1, 'allowed voter dont have rights to vote');

  });


  it("should not allow an unregistered voter to vote", async () => {
    let ballot = await Ballot.deployed();
    let notAllowedVoter = accounts[2];
    let voter = await ballot.voters.call(notAllowedVoter);
    let weight = voter[0].toNumber();

    assert.equal(weight, 0, 'not allowed voter has rights to vote');
  });


  it("should be able to delegate", async () => {
    let ballot = await Ballot.deployed();
    let delegator = accounts[2];
    let delegatee = accounts[3];

    await ballot.giveRightToVote(delegator);
    await ballot.giveRightToVote(delegatee);

    await ballot.delegate(delegatee, {from: delegator});

    let delegateeVoter = await ballot.voters.call(delegatee);
    let weight = delegateeVoter[0].toNumber();
    
    assert.equal(weight, 2, "delegatee shoud have weight equals 2");
  });


  it("should be able to vote", async () => {
    let ballot = await Ballot.deployed(); 
    let voterAccount = accounts[1];

    let firstProposal = await ballot.proposals.call(0);
    let votesCountBefore = firstProposal[1].toNumber();
    
    await ballot.vote(0, {from: voterAccount});

    firstProposal =   await ballot.proposals.call(0);
    let votesCountAfter = firstProposal[1].toNumber();

    let voter = await ballot.voters.call(voterAccount);

    let weight = voter[0];
    let isVoted = voter[1];
    let votedProposal = voter[3];
    let difference = votesCountAfter - votesCountBefore;

    assert.isTrue(isVoted, "The voter didn't vote");
    assert.equal(votedProposal, 0, "The proposal's indexes didn't match");
    assert.equal(weight, difference, "The proposal's votes count didn't change");
  });


  it("should be able to choose winner", async () => {
    let ballot = await Ballot.deployed();
    let winnerIndex = 0;
    let winnerName = "first proposal";
    let voterAccount = accounts[0];

    await ballot.giveRightToVote(voterAccount);
    await ballot.vote(winnerIndex, {from: voterAccount});
    
    let winningProposal = await ballot.winningProposal.call();
    let proposalName = await ballot.winnerName.call();
    let winnerProposalName = web3.toUtf8(proposalName);
    
    assert.equal(winningProposal, winnerIndex, "Winner index must be equal to winning proposal value");
    assert.equal(winnerProposalName, winnerName, "Winning proposal name must be equal to first proposal name");
  });

});   