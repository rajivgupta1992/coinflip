// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title CoinFlip
/// @notice Provably fair 50/50 USDC coin flip using Chainlink VRF v2.5.
///         Ownership (onlyOwner, transferOwnership) comes from VRFConsumerBaseV2Plus
///         via Chainlink's ConfirmedOwner — no need for a second Ownable.
contract CoinFlip is VRFConsumerBaseV2Plus {
    using SafeERC20 for IERC20;

    // ── Types ──────────────────────────────────────────────────────────────────

    struct BetInfo {
        address player;
        bool isHeads;
        uint256 amount;
    }

    // ── Immutables ─────────────────────────────────────────────────────────────

    IERC20 public immutable usdc;

    // ── VRF config ─────────────────────────────────────────────────────────────

    uint256 public subscriptionId;
    bytes32 public keyHash;
    uint32  public callbackGasLimit  = 150_000;
    uint16  public requestConfirmations = 3;

    // ── Pool state ─────────────────────────────────────────────────────────────

    /// @notice Free capital available to cover bets (excludes locked pending bets).
    uint256 public poolSize;

    /// @notice Cumulative number of settled flips.
    uint256 public totalFlips;

    /// @notice requestId → pending bet details.
    mapping(uint256 => BetInfo) public pendingBets;

    // ── Events ─────────────────────────────────────────────────────────────────

    event BetPlaced(
        address indexed player,
        bool isHeads,
        uint256 amount,
        uint256 indexed requestId
    );

    event BetSettled(
        address indexed player,
        bool isHeads,
        bool won,
        uint256 amount,
        uint256 indexed requestId
    );

    event Tipped(
        address indexed player,
        uint256 amount,
        uint256 toPool,
        uint256 toHouse
    );

    // ── Constructor ────────────────────────────────────────────────────────────

    /// @param vrfCoordinator  Chainlink VRF Coordinator address.
    /// @param _usdc           USDC token address.
    /// @param _subscriptionId Chainlink VRF subscription ID.
    /// @param _keyHash        VRF key hash (gas lane).
    constructor(
        address vrfCoordinator,
        address _usdc,
        uint256 _subscriptionId,
        bytes32 _keyHash
    )
        VRFConsumerBaseV2Plus(vrfCoordinator)
    {
        usdc           = IERC20(_usdc);
        subscriptionId = _subscriptionId;
        keyHash        = _keyHash;
    }

    // ── Owner functions ────────────────────────────────────────────────────────

    /// @notice Seed or top up the house pool. Caller must pre-approve this contract.
    function deposit(uint256 amount) external onlyOwner {
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        poolSize += amount;
    }

    /// @notice Withdraw house profit. Reverts if amount exceeds pool.
    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= poolSize, "CoinFlip: insufficient pool");
        poolSize -= amount;
        usdc.safeTransfer(msg.sender, amount);
    }

    /// @notice Update VRF callback gas limit.
    function setCallbackGasLimit(uint32 limit) external onlyOwner {
        callbackGasLimit = limit;
    }

    /// @notice Update VRF request confirmations.
    function setRequestConfirmations(uint16 confs) external onlyOwner {
        requestConfirmations = confs;
    }

    // ── View functions ─────────────────────────────────────────────────────────

    /// @notice Maximum allowed bet: 5% of the pool.
    function maxBet() public view returns (uint256) {
        return poolSize / 20;
    }

    // ── Player functions ───────────────────────────────────────────────────────

    /// @notice Place a coin flip bet.
    /// @param isHeads  true = betting on heads, false = tails.
    /// @param amount   USDC amount (6-decimal units). Player must pre-approve.
    function flip(bool isHeads, uint256 amount) external returns (uint256 requestId) {
        require(amount >= 1e6,        "CoinFlip: bet below minimum (1 USDC)");
        require(amount <= maxBet(),   "CoinFlip: bet exceeds max");
        require(poolSize >= amount,   "CoinFlip: pool too small");

        // Pull stake from player
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Lock pool-side match so concurrent bets can't over-commit
        poolSize -= amount;

        // Request randomness from Chainlink VRF v2.5
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash:             keyHash,
                subId:               subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit:    callbackGasLimit,
                numWords:            1,
                extraArgs:           VRFV2PlusClient._argsToBytes(
                                         VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                                     )
            })
        );

        pendingBets[requestId] = BetInfo({
            player:  msg.sender,
            isHeads: isHeads,
            amount:  amount
        });

        emit BetPlaced(msg.sender, isHeads, amount, requestId);
    }

    /// @notice Tip the house. 50% goes to the pool; 50% stays as revenue.
    ///         Player must pre-approve the USDC transfer.
    function tip(uint256 amount) external {
        require(amount > 0, "CoinFlip: zero tip");
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        uint256 toPool  = amount / 2;
        uint256 toHouse = amount - toPool; // handles odd amounts correctly

        poolSize += toPool;

        emit Tipped(msg.sender, amount, toPool, toHouse);
    }

    // ── VRF Callback ───────────────────────────────────────────────────────────

    /// @dev Called by the VRF Coordinator with the random result.
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        BetInfo memory bet = pendingBets[requestId];
        require(bet.player != address(0), "CoinFlip: unknown requestId");

        delete pendingBets[requestId];

        bool landedHeads = randomWords[0] % 2 == 0;
        bool won         = (landedHeads == bet.isHeads);

        if (won) {
            // Pool-side match was already deducted in flip(); pay out 2× stake.
            // Contract holds: bet.amount (player stake) + bet.amount (pool match)
            usdc.safeTransfer(bet.player, bet.amount * 2);
        } else {
            // Player lost — return the locked pool match to free pool.
            poolSize += bet.amount * 2; // original lock + player's stake
        }

        totalFlips++;

        emit BetSettled(bet.player, bet.isHeads, won, bet.amount, requestId);
    }
}
