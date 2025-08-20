# 🗳️ Proposal Voting Smart Contract (Stacks / Clarity)

**Deployed Contract Address**  
`ST307HGZ30M26PQTQQFEVKKMWPY1GG4BQXRANK82M.proposalsystem`

## 📜 Overview

This smart contract enables decentralized proposal submission and voting on the Stacks blockchain.
Community members can create proposals, cast votes, and track results with complete transparency and anti-fraud protection.
<img width="1920" height="1072" alt="image" src="https://github.com/user-attachments/assets/9775b180-56f2-4519-9f3f-e3365ea80adc" />



![Proposal Voting System]

## ⭐ Features

✅ **Submit Proposals** with title and description  
✅ **Time-bound Voting** (10 days per proposal)  
✅ **Anti-double Voting** protection  
✅ **Complete Vote Tracking** and history  
✅ **Automatic Result Calculation**  
✅ **Transparent On-chain Storage**  

## ⚙️ Error Codes
| Code | Meaning |
|------|---------|
| `u100` | `ERR-UNAUTHORIZED` → Caller lacks permission |
| `u101` | `ERR-PROPOSAL-NOT-FOUND` → Invalid proposal ID |
| `u102` | `ERR-ALREADY-VOTED` → User already voted on this proposal |
| `u103` | `ERR-VOTING-ENDED` → Voting period has expired |
| `u104` | `ERR-INVALID-PROPOSAL` → Proposal data is invalid |
| `u105` | `ERR-PROPOSAL-TOO-SHORT` → Description < 10 characters |

## 📦 Contract Functions

### `submit-proposal (title description)`
Creates a new proposal for community voting.

**Parameters:**
- `title` → Proposal title (max 100 chars)
- `description` → Proposal description (min 10 chars, max 500)

**Flow:**
1. Validate description length ≥ 10 characters
2. Create proposal with unique ID
3. Set voting period (1440 blocks ≈ 10 days)
4. Initialize vote counts to zero
5. Return new proposal ID on success

**Example Call:**
```clarity
(contract-call? .proposal-voting submit-proposal 
    u"Increase Block Rewards" 
    u"Proposal to increase mining rewards by 10% to incentivize network security")
```

### `vote (proposal-id vote-for)`
Cast a vote on an active proposal.

**Parameters:**
- `proposal-id` → ID of the proposal to vote on
- `vote-for` → `true` for YES, `false` for NO

**Flow:**
1. Verify proposal exists and voting is active
2. Check user hasn't already voted
3. Record vote with timestamp
4. Update proposal vote counters
5. Track user's total vote count

**Example Call:**
```clarity
(contract-call? .proposal-voting vote u1 true)  ;; Vote YES on proposal #1
(contract-call? .proposal-voting vote u2 false) ;; Vote NO on proposal #2
```

### `close-proposal (proposal-id)`
Finalizes voting and determines proposal outcome.

**Parameters:**
- `proposal-id` → ID of proposal to close

**Flow:**
1. Verify voting period has ended
2. Compare votes-for vs votes-against
3. Update status to "passed" or "rejected"
4. Return final status

## 🔍 Read-Only Functions

| Function | Purpose |
|----------|---------|
| `get-proposal(id)` | Get complete proposal details |
| `get-vote(id, voter)` | Check specific vote record |
| `get-proposal-results(id)` | Get voting summary and results |
| `get-user-vote-count(user)` | Get user's total participation |
| `is-voting-active(id)` | Check if proposal is still accepting votes |
| `get-proposal-counter()` | Get total number of proposals |

## 🛠️ Setup & Usage

### Local Deployment (Clarinet)
```bash
clarinet new proposal-voting
cd proposal-voting

# Replace contracts/proposal-voting.clar with this contract

clarinet check
clarinet test
clarinet integrate  # Start local devnet
```

### On Testnet / Mainnet
1. Deploy using Stacks CLI or Clarinet
2. Open contract in Hiro Explorer  
3. Call functions through web interface
4. Monitor proposal activity and results

**Deploy Commands:**
```bash
clarinet deploy --testnet   # Deploy to testnet
clarinet deploy --mainnet   # Deploy to mainnet
```

## 📊 Data Storage

### Proposals Map
```clarity
{
  proposal-id: uint,
  title: string-utf8,
  description: string-utf8,
  proposer: principal,
  start-block: uint,
  end-block: uint,
  votes-for: uint,
  votes-against: uint,
  status: string-ascii
}
```

### Votes Map
```clarity
{
  proposal-id: uint,
  voter: principal,
  vote: bool,
  block-height: uint
}
```

## 📄 Security Notes

🔒 **Immutable Records** → All votes permanently stored on-chain  
🕒 **Time-locked Voting** → Cannot vote after 10-day period expires  
🚫 **Double-vote Prevention** → One vote per user per proposal  
🔍 **Complete Transparency** → All data publicly readable  
⛓️ **Decentralized Storage** → No single point of failure  

**Voting Period:** 1440 blocks (~10 days on Stacks)  
**Minimum Description:** 10 characters to prevent spam  
**No Admin Controls** → Fully autonomous once deployed  

## 💰 Gas Costs

| Operation | Estimated Cost |
|-----------|---------------|
| Submit Proposal | ~1000 gas |
| Cast Vote | ~800 gas |
| Read Functions | <100 gas |
| Close Proposal | ~600 gas |

## 👩‍💻 Tech Stack

**Language:** Clarity (Stacks Smart Contracts)  
**Tools:** Clarinet, Stacks CLI, GitHub  
**Network:** Stacks Testnet/Mainnet  
**Storage:** On-chain maps (decentralized)  
**Frontend:** Compatible with Stacks.js and Hiro Wallet  

## 🚀 Future Enhancements

🎯 **Weighted Voting** based on token holdings  
📂 **Proposal Categories** and filtering  
👥 **Minimum Quorum** requirements  
📝 **Proposal Amendments** and updates  
🏛️ **Delegation** mechanisms for governance  
🔢 **Multi-choice Voting** beyond yes/no  

---

**Built with ❤️ for decentralized governance on Stacks**
