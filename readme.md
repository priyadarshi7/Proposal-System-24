Proposal Voting Smart Contract
A decentralized voting system built with Clarity for the Stacks blockchain that allows users to submit proposals and vote on them.
Features

Submit Proposals: Users can create new proposals with a title and description
Vote on Proposals: Community members can vote "for" or "against" proposals
Time-bound Voting: Each proposal has a defined voting period (10 days by default)
Vote Tracking: Complete records of all votes and voting history
Proposal Status: Automatic status updates based on voting results
Anti-double Voting: Users cannot vote multiple times on the same proposal

Contract Overview
Core Functions
Public Functions

submit-proposal(title, description) - Create a new proposal
vote(proposal-id, vote-for) - Cast a vote on a proposal
close-proposal(proposal-id) - Close voting after the voting period ends

Read-Only Functions

get-proposal(proposal-id) - Get full proposal details
get-vote(proposal-id, voter) - Get specific vote details
get-user-vote-count(user) - Get total votes cast by a user
get-proposal-counter() - Get the current number of proposals
is-voting-active(proposal-id) - Check if voting is still active
get-proposal-results(proposal-id) - Get voting results summary

Data Structures
The contract uses three main maps to store data:

Proposals Map: Stores proposal details including title, description, vote counts, and status
Votes Map: Records individual votes with voter information and block height
User Vote Count: Tracks how many votes each user has cast

Constants and Error Codes

VOTING_PERIOD: 1440 blocks (~10 days)
MIN_PROPOSAL_LENGTH: 10 characters minimum for descriptions
Various error codes for different failure scenarios

Getting Started
Prerequisites

Clarinet installed
Node.js for running tests (optional)

Installation

Clone or create a new Clarinet project:

bashclarinet new proposal-voting
cd proposal-voting

Replace the generated files with the contract code provided
Install dependencies and verify setup:

bashclarinet check
Testing
Run the comprehensive test suite:
bashclarinet test
The tests cover:

Proposal submission
Voting functionality
Double-vote prevention
Data retrieval
Edge cases and error conditions

Deployment
Devnet (Local Testing)
bashclarinet integrate
Testnet
bashclarinet deploy --testnet
Mainnet
bashclarinet deploy --mainnet
Usage Examples
Submitting a Proposal
clarity(contract-call? .proposal-voting submit-proposal 
    u"Increase Block Rewards" 
    u"Proposal to increase mining rewards by 10% to incentivize more miners")
Voting on a Proposal
clarity;; Vote FOR proposal #1
(contract-call? .proposal-voting vote u1 true)

;; Vote AGAINST proposal #1  
(contract-call? .proposal-voting vote u1 false)
Checking Proposal Status
clarity(contract-call? .proposal-voting get-proposal u1)
(contract-call? .proposal-voting get-proposal-results u1)
Contract Architecture
The contract follows these design principles:

Security First: Prevents double voting and unauthorized access
Transparency: All votes and proposals are publicly readable
Time-bounded: Clear voting periods prevent indefinite voting
Efficient: Uses maps for O(1) lookups of proposals and votes
Extensible: Easy to modify voting periods and add new features

Security Considerations

Users can only vote once per proposal
Voting is only allowed during the active voting period
All data is immutable once recorded
No admin functions that could manipulate votes
Proposal validation prevents spam with minimum length requirements

Gas Costs
Approximate costs for main operations:

Submit proposal: ~1000 gas
Cast vote: ~800 gas
Read operations: <100 gas

Future Enhancements
Potential improvements for future versions:

Weighted voting based on token holdings
Proposal categories and filtering
Minimum quorum requirements
Proposal amendments
Delegation mechanisms
Multi-choice voting (not just yes/no)

Contributing

Fork the repository
Create a feature branch
Add tests for new functionality
Ensure all tests pass
Submit a pull request

License
This project is open source and available under the MIT License.
