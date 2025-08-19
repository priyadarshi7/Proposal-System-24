;; Proposal Voting Smart Contract
;; A decentralized voting system for community proposals

;; Error constants
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_PROPOSAL_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_VOTED (err u102))
(define-constant ERR_VOTING_ENDED (err u103))
(define-constant ERR_INVALID_PROPOSAL (err u104))
(define-constant ERR_PROPOSAL_TOO_SHORT (err u105))

;; Contract constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant MIN_PROPOSAL_LENGTH u10)
(define-constant VOTING_PERIOD u1440) ;; blocks (~10 days assuming 10 min blocks)

;; Data variables
(define-data-var proposal-counter uint u0)

;; Data structures
(define-map proposals
    { proposal-id: uint }
    {
        title: (string-utf8 100),
        description: (string-utf8 500),
        proposer: principal,
        start-block: uint,
        end-block: uint,
        votes-for: uint,
        votes-against: uint,
        status: (string-ascii 20) ;; "active", "passed", "rejected"
    }
)

(define-map votes
    { proposal-id: uint, voter: principal }
    {
        vote: bool, ;; true for "for", false for "against"
        block-height: uint
    }
)

(define-map user-vote-count
    { user: principal }
    { count: uint }
)

;; Read-only functions

;; Get proposal details
(define-read-only (get-proposal (proposal-id uint))
    (map-get? proposals { proposal-id: proposal-id })
)

;; Get vote details
(define-read-only (get-vote (proposal-id uint) (voter principal))
    (map-get? votes { proposal-id: proposal-id, voter: voter })
)

;; Get user's total vote count
(define-read-only (get-user-vote-count (user principal))
    (default-to u0 
        (get count (map-get? user-vote-count { user: user }))
    )
)

;; Get current proposal counter
(define-read-only (get-proposal-counter)
    (var-get proposal-counter)
)

;; Check if voting is still active for a proposal
(define-read-only (is-voting-active (proposal-id uint))
    (match (get-proposal proposal-id)
        proposal-data (< block-height (get end-block proposal-data))
        false
    )
)

;; Get proposal results
(define-read-only (get-proposal-results (proposal-id uint))
    (match (get-proposal proposal-id)
        proposal-data 
        (ok {
            proposal-id: proposal-id,
            votes-for: (get votes-for proposal-data),
            votes-against: (get votes-against proposal-data),
            total-votes: (+ (get votes-for proposal-data) (get votes-against proposal-data)),
            status: (get status proposal-data)
        })
        ERR_PROPOSAL_NOT_FOUND
    )
)

;; Private functions

;; Update proposal status based on votes
(define-private (update-proposal-status (proposal-id uint))
    (match (get-proposal proposal-id)
        proposal-data
        (let (
            (votes-for (get votes-for proposal-data))
            (votes-against (get votes-against proposal-data))
            (new-status (if (> votes-for votes-against) "passed" "rejected"))
        )
            (map-set proposals 
                { proposal-id: proposal-id }
                (merge proposal-data { status: new-status })
            )
            (ok new-status)
        )
        ERR_PROPOSAL_NOT_FOUND
    )
)

;; Public functions

;; Submit a new proposal
(define-public (submit-proposal (title (string-utf8 100)) (description (string-utf8 500)))
    (let (
        (new-proposal-id (+ (var-get proposal-counter) u1))
        (start-block block-height)
        (end-block (+ block-height VOTING_PERIOD))
    )
        ;; Validate proposal length
        (asserts! (>= (len description) MIN_PROPOSAL_LENGTH) ERR_PROPOSAL_TOO_SHORT)
        
        ;; Create the proposal
        (map-set proposals
            { proposal-id: new-proposal-id }
            {
                title: title,
                description: description,
                proposer: tx-sender,
                start-block: start-block,
                end-block: end-block,
                votes-for: u0,
                votes-against: u0,
                status: "active"
            }
        )
        
        ;; Update proposal counter
        (var-set proposal-counter new-proposal-id)
        
        ;; Return the new proposal ID
        (ok new-proposal-id)
    )
)

;; Vote on a proposal
(define-public (vote (proposal-id uint) (vote-for bool))
    (let (
        (proposal-data (unwrap! (get-proposal proposal-id) ERR_PROPOSAL_NOT_FOUND))
        (current-vote (get-vote proposal-id tx-sender))
    )
        ;; Check if voting is still active
        (asserts! (< block-height (get end-block proposal-data)) ERR_VOTING_ENDED)
        
        ;; Check if user has already voted
        (asserts! (is-none current-vote) ERR_ALREADY_VOTED)
        
        ;; Record the vote
        (map-set votes
            { proposal-id: proposal-id, voter: tx-sender }
            { vote: vote-for, block-height: block-height }
        )
        
        ;; Update vote counts
        (let (
            (current-votes-for (get votes-for proposal-data))
            (current-votes-against (get votes-against proposal-data))
            (new-votes-for (if vote-for (+ current-votes-for u1) current-votes-for))
            (new-votes-against (if vote-for current-votes-against (+ current-votes-against u1)))
        )
            (map-set proposals
                { proposal-id: proposal-id }
                (merge proposal-data {
                    votes-for: new-votes-for,
                    votes-against: new-votes-against
                })
            )
        )
        
        ;; Update user vote count
        (map-set user-vote-count
            { user: tx-sender }
            { count: (+ (get-user-vote-count tx-sender) u1) }
        )
        
        (ok vote-for)
    )
)

;; Close voting for a proposal (can be called by anyone after voting period ends)
(define-public (close-proposal (proposal-id uint))
    (let (
        (proposal-data (unwrap! (get-proposal proposal-id) ERR_PROPOSAL_NOT_FOUND))
    )
        ;; Check if voting period has ended
        (asserts! (>= block-height (get end-block proposal-data)) ERR_VOTING_ENDED)
        
        ;; Update proposal status
        (update-proposal-status proposal-id)
    )
)

;; Get all proposals (helper function - in practice you'd want pagination)
(define-read-only (get-proposals-summary (start-id uint) (count uint))
    (let (
        (end-id (+ start-id count))
        (current-counter (get-proposal-counter))
    )
        (if (<= start-id current-counter)
            (ok {
                start-id: start-id,
                end-id: (if (> end-id current-counter) current-counter end-id),
                total-proposals: current-counter
            })
            (ok {
                start-id: start-id,
                end-id: start-id,
                total-proposals: current-counter
            })
        )
    )
)