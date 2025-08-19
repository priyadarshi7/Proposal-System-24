import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can submit a new proposal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        
        let block = chain.mineBlock([
            Tx.contractCall("proposal-voting", "submit-proposal", [
                types.utf8("Test Proposal"),
                types.utf8("This is a test proposal for our voting system")
            ], deployer.address),
        ]);
        
        assertEquals(block.receipts.length, 1);
        assertEquals(block.height, 2);
        block.receipts[0].result.expectOk().expectUint(1);
    },
});

Clarinet.test({
    name: "Can vote on a proposal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;
        
        // Submit a proposal first
        let block = chain.mineBlock([
            Tx.contractCall("proposal-voting", "submit-proposal", [
                types.utf8("Test Proposal"),
                types.utf8("This is a test proposal for our voting system")
            ], deployer.address),
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1);
        
        // Vote on the proposal
        block = chain.mineBlock([
            Tx.contractCall("proposal-voting", "vote", [
                types.uint(1),
                types.bool(true)
            ], wallet1.address),
        ]);
        
        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "Cannot vote twice on same proposal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;
        
        // Submit a proposal
        let block = chain.mineBlock([
            Tx.contractCall("proposal-voting", "submit-proposal", [
                types.utf8("Test Proposal"),
                types.utf8("This is a test proposal for our voting system")
            ], deployer.address),
        ]);
        
        // Vote once
        block = chain.mineBlock([
            Tx.contractCall("proposal-voting", "vote", [
                types.uint(1),
                types.bool(true)
            ], wallet1.address),
        ]);
        
        block.receipts[0].result.expectOk();
        
        // Try to vote again - should fail
        block = chain.mineBlock([
            Tx.contractCall("proposal-voting", "vote", [
                types.uint(1),
                types.bool(false)
            ], wallet1.address),
        ]);
        
        block.receipts[0].result.expectErr().expectUint(102); // ERR_ALREADY_VOTED
    },
});

Clarinet.test({
    name: "Can retrieve proposal details",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        
        // Submit a proposal
        let block = chain.mineBlock([
            Tx.contractCall("proposal-voting", "submit-proposal", [
                types.utf8("Test Proposal"),
                types.utf8("This is a test proposal for our voting system")
            ], deployer.address),
        ]);
        
        // Get proposal details
        let proposalDetails = chain.callReadOnlyFn(
            "proposal-voting",
            "get-proposal",
            [types.uint(1)],
            deployer.address
        );
        
        const proposal = proposalDetails.result.expectSome().expectTuple();
        assertEquals(proposal['title'], "Test Proposal");
        assertEquals(proposal['description'], "This is a test proposal for our voting system");
        assertEquals(proposal['proposer'], deployer.address);
        assertEquals(proposal['votes-for'], types.uint(0));
        assertEquals(proposal['votes-against'], types.uint(0));
        assertEquals(proposal['status'], "active");
    },
});

Clarinet.test({
    name: "Can get proposal results after voting",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;
        const wallet2 = accounts.get("wallet_2")!;
        const wallet3 = accounts.get("wallet_3")!;
        
        // Submit a proposal
        let block = chain.mineBlock([
            Tx.contractCall("proposal-voting", "submit-proposal", [
                types.utf8("Test Proposal"),
                types.utf8("This is a test proposal for our voting system")
            ], deployer.address),
        ]);
        
        // Cast votes
        block = chain.mineBlock([
            Tx.contractCall("proposal-voting", "vote", [
                types.uint(1),
                types.bool(true)
            ], wallet1.address),
            Tx.contractCall("proposal-voting", "vote", [
                types.uint(1),
                types.bool(true)
            ], wallet2.address),
            Tx.contractCall("proposal-voting", "vote", [
                types.uint(1),
                types.bool(false)
            ], wallet3.address),
        ]);
        
        // Get results
        let results = chain.callReadOnlyFn(
            "proposal-voting",
            "get-proposal-results",
            [types.uint(1)],
            deployer.address
        );
        
        const result = results.result.expectOk().expectTuple();
        assertEquals(result['proposal-id'], types.uint(1));
        assertEquals(result['votes-for'], types.uint(2));
        assertEquals(result['votes-against'], types.uint(1));
        assertEquals(result['total-votes'], types.uint(3));
    },
});

Clarinet.test({
    name: "Proposal too short should fail",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        
        let block = chain.mineBlock([
            Tx.contractCall("proposal-voting", "submit-proposal", [
                types.utf8("Short"),
                types.utf8("Too short") // Less than 10 characters
            ], deployer.address),
        ]);
        
        assertEquals(block.receipts.length, 1);
        block.receipts[0].result.expectErr().expectUint(105); // ERR_PROPOSAL_TOO_SHORT
    },
});

Clarinet.test({
    name: "Can track user vote count",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet1 = accounts.get("wallet_1")!;
        
        // Submit multiple proposals
        let block = chain.mineBlock([
            Tx.contractCall("proposal-voting", "submit-proposal", [
                types.utf8("Proposal 1"),
                types.utf8("This is the first test proposal")
            ], deployer.address),
            Tx.contractCall("proposal-voting", "submit-proposal", [
                types.utf8("Proposal 2"),
                types.utf8("This is the second test proposal")
            ], deployer.address),
        ]);
        
        // Vote on both proposals
        block = chain.mineBlock([
            Tx.contractCall("proposal-voting", "vote", [
                types.uint(1),
                types.bool(true)
            ], wallet1.address),
            Tx.contractCall("proposal-voting", "vote", [
                types.uint(2),
                types.bool(false)
            ], wallet1.address),
        ]);
        
        // Check user vote count
        let voteCount = chain.callReadOnlyFn(
            "proposal-voting",
            "get-user-vote-count",
            [types.principal(wallet1.address)],
            deployer.address
        );
        
        voteCount.result.expectUint(2);
    },
});