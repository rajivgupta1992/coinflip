// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {CoinFlip} from "../src/CoinFlip.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";

contract CoinFlipTest is Test {
    // ── Constants ───────────────────────────────────────────────────────────────
    uint256 constant USDC_DECIMALS = 1e6;
    uint256 constant POOL_SEED     = 10_000 * USDC_DECIMALS; // 10,000 USDC
    bytes32 constant KEY_HASH      = bytes32(uint256(1));

    // ── Actors ──────────────────────────────────────────────────────────────────
    address owner  = makeAddr("owner");
    address player = makeAddr("player");

    // ── Contracts ───────────────────────────────────────────────────────────────
    VRFCoordinatorV2_5Mock coordinator;
    MockUSDC usdc;
    CoinFlip coinFlip;
    uint256 subId;

    // ── Setup ───────────────────────────────────────────────────────────────────
    function setUp() public {
        // Deploy VRF mock
        coordinator = new VRFCoordinatorV2_5Mock(
            0.1 ether,   // base fee (LINK)
            1e9,         // gas price link
            4e15         // wei per unit link
        );

        // Create and fund a subscription
        subId = coordinator.createSubscription();
        coordinator.fundSubscription(subId, 100 ether); // 100 LINK

        // Deploy USDC mock
        usdc = new MockUSDC();

        // Deploy CoinFlip as owner
        vm.prank(owner);
        coinFlip = new CoinFlip(
            address(coordinator),
            address(usdc),
            subId,
            KEY_HASH
        );

        // Add CoinFlip as VRF consumer
        coordinator.addConsumer(subId, address(coinFlip));

        // Seed the pool (owner deposits 10,000 USDC)
        usdc.faucet(owner, POOL_SEED);
        vm.startPrank(owner);
        usdc.approve(address(coinFlip), POOL_SEED);
        coinFlip.deposit(POOL_SEED);
        vm.stopPrank();

        // Give player 1,000 USDC
        usdc.faucet(player, 1_000 * USDC_DECIMALS);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    /// Approve and place a flip, return the requestId.
    function _placeFlip(bool isHeads, uint256 amount) internal returns (uint256 requestId) {
        vm.startPrank(player);
        usdc.approve(address(coinFlip), amount);
        requestId = coinFlip.flip(isHeads, amount);
        vm.stopPrank();
    }

    /// Fulfill VRF with a specific random word.
    function _fulfillWith(uint256 requestId, uint256 randomWord) internal {
        uint256[] memory words = new uint256[](1);
        words[0] = randomWord;
        coordinator.fulfillRandomWordsWithOverride(requestId, address(coinFlip), words);
    }

    // ── Deposit / Withdraw / maxBet ─────────────────────────────────────────────

    function test_deposit() public view {
        assertEq(coinFlip.poolSize(), POOL_SEED);
    }

    function test_deposit_onlyOwner() public {
        usdc.faucet(player, 100 * USDC_DECIMALS);
        vm.startPrank(player);
        usdc.approve(address(coinFlip), 100 * USDC_DECIMALS);
        vm.expectRevert();
        coinFlip.deposit(100 * USDC_DECIMALS);
        vm.stopPrank();
    }

    function test_withdraw() public {
        uint256 amount = 500 * USDC_DECIMALS;
        uint256 ownerBefore = usdc.balanceOf(owner);

        vm.prank(owner);
        coinFlip.withdraw(amount);

        assertEq(coinFlip.poolSize(), POOL_SEED - amount);
        assertEq(usdc.balanceOf(owner), ownerBefore + amount);
    }

    function test_withdraw_reverts_if_excess() public {
        vm.prank(owner);
        vm.expectRevert("CoinFlip: insufficient pool");
        coinFlip.withdraw(POOL_SEED + 1);
    }

    function test_maxBet() public view {
        assertEq(coinFlip.maxBet(), POOL_SEED / 20);
    }

    // ── Flip: validation ────────────────────────────────────────────────────────

    function test_flip_revert_below_minimum() public {
        uint256 tooSmall = 0.5 * 1e6; // 0.5 USDC
        vm.startPrank(player);
        usdc.approve(address(coinFlip), tooSmall);
        vm.expectRevert("CoinFlip: bet below minimum (1 USDC)");
        coinFlip.flip(true, tooSmall);
        vm.stopPrank();
    }

    function test_flip_revert_exceeds_max() public {
        uint256 tooBig = coinFlip.maxBet() + 1;
        usdc.faucet(player, tooBig);
        vm.startPrank(player);
        usdc.approve(address(coinFlip), tooBig);
        vm.expectRevert("CoinFlip: bet exceeds max");
        coinFlip.flip(true, tooBig);
        vm.stopPrank();
    }

    // ── Flip: BetPlaced event and BetInfo storage ────────────────────────────────

    function test_flip_emits_BetPlaced_and_stores_bet() public {
        uint256 amount = 10 * USDC_DECIMALS;
        // VRFCoordinatorV2_5Mock starts requestIds at 1.
        uint256 expectedRequestId = 1;

        vm.startPrank(player);
        usdc.approve(address(coinFlip), amount);

        vm.expectEmit(true, true, false, true, address(coinFlip));
        emit CoinFlip.BetPlaced(player, true, amount, expectedRequestId);

        uint256 requestId = coinFlip.flip(true, amount);
        vm.stopPrank();

        assertEq(requestId, expectedRequestId);

        (address storedPlayer, bool storedHeads, uint256 storedAmount) =
            coinFlip.pendingBets(requestId);
        assertEq(storedPlayer, player);
        assertTrue(storedHeads);
        assertEq(storedAmount, amount);
    }

    function test_flip_locks_pool() public {
        uint256 amount     = 10 * USDC_DECIMALS;
        uint256 poolBefore = coinFlip.poolSize();

        _placeFlip(true, amount);

        // Pool decremented by the locked match
        assertEq(coinFlip.poolSize(), poolBefore - amount);
    }

    // ── fulfillRandomWords: win path ────────────────────────────────────────────

    function test_fulfill_win() public {
        uint256 amount        = 100 * USDC_DECIMALS;
        uint256 poolBefore    = coinFlip.poolSize();
        uint256 playerBefore  = usdc.balanceOf(player);

        uint256 requestId = _placeFlip(true, amount); // betting heads

        // randomWords[0] % 2 == 0 → landed heads → player wins
        _fulfillWith(requestId, 2); // even → heads

        // Player gets 2× stake
        assertEq(usdc.balanceOf(player), playerBefore - amount + amount * 2);
        // Pool was reduced by match; after win, pool stays reduced
        // poolBefore - amount (lock) = poolAfterLock
        // On win: no additional change to poolSize in fulfillRandomWords (already deducted)
        assertEq(coinFlip.poolSize(), poolBefore - amount);
        assertEq(coinFlip.totalFlips(), 1);
    }

    // ── fulfillRandomWords: loss path ───────────────────────────────────────────

    function test_fulfill_loss() public {
        uint256 amount       = 100 * USDC_DECIMALS;
        uint256 poolBefore   = coinFlip.poolSize();
        uint256 playerBefore = usdc.balanceOf(player);

        uint256 requestId = _placeFlip(true, amount); // betting heads

        // randomWords[0] % 2 == 1 → landed tails → player loses
        _fulfillWith(requestId, 3); // odd → tails

        // Player lost their stake
        assertEq(usdc.balanceOf(player), playerBefore - amount);
        // Pool gets back: locked match + player's stake
        assertEq(coinFlip.poolSize(), poolBefore + amount);
        assertEq(coinFlip.totalFlips(), 1);
    }

    // ── fulfillRandomWords: BetSettled event ─────────────────────────────────────

    function test_fulfill_emits_BetSettled() public {
        uint256 amount    = 50 * USDC_DECIMALS;
        uint256 requestId = _placeFlip(false, amount); // betting tails

        vm.expectEmit(true, true, false, true, address(coinFlip));
        // odd word → tails → won (bet was tails)
        emit CoinFlip.BetSettled(player, false, true, amount, requestId);
        _fulfillWith(requestId, 5); // odd → tails
    }

    // ── fulfillRandomWords: pending bet cleared ──────────────────────────────────

    function test_fulfill_clears_pending_bet() public {
        uint256 requestId = _placeFlip(true, 10 * USDC_DECIMALS);
        _fulfillWith(requestId, 0);

        (address storedPlayer,,) = coinFlip.pendingBets(requestId);
        assertEq(storedPlayer, address(0));
    }

    // ── Tip ─────────────────────────────────────────────────────────────────────

    function test_tip_splits_50_50() public {
        uint256 tipAmount  = 200 * USDC_DECIMALS;
        uint256 poolBefore = coinFlip.poolSize();

        usdc.faucet(player, tipAmount);
        vm.startPrank(player);
        usdc.approve(address(coinFlip), tipAmount);

        vm.expectEmit(true, false, false, true, address(coinFlip));
        emit CoinFlip.Tipped(player, tipAmount, tipAmount / 2, tipAmount - tipAmount / 2);

        coinFlip.tip(tipAmount);
        vm.stopPrank();

        assertEq(coinFlip.poolSize(), poolBefore + tipAmount / 2);
    }

    function test_tip_reverts_zero() public {
        vm.prank(player);
        vm.expectRevert("CoinFlip: zero tip");
        coinFlip.tip(0);
    }

    // ── Fuzz: flip amount in [1 USDC, maxBet()] ─────────────────────────────────

    function testFuzz_flip_and_settle(uint256 amount) public {
        uint256 minBet = 1 * USDC_DECIMALS;
        uint256 max    = coinFlip.maxBet();
        amount = bound(amount, minBet, max);

        // Ensure player has enough
        if (usdc.balanceOf(player) < amount) {
            usdc.faucet(player, amount);
        }

        uint256 requestId = _placeFlip(true, amount);

        // Fuzz the VRF outcome
        uint256 randomWord = uint256(keccak256(abi.encodePacked(amount)));
        _fulfillWith(requestId, randomWord);

        assertEq(coinFlip.totalFlips(), 1);
        // Pending bet cleared
        (address p,,) = coinFlip.pendingBets(requestId);
        assertEq(p, address(0));
    }
}
