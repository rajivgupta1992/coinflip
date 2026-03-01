// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MockUSDC} from "../src/mocks/MockUSDC.sol";
import {CoinFlip} from "../src/CoinFlip.sol";

/// @notice Deploy MockUSDC + CoinFlip on Polygon Amoy testnet.
///
/// Before running:
///   1. Copy .env.example to .env and fill in PRIVATE_KEY, AMOY_RPC_URL.
///   2. Run: make deploy-testnet
///   3. Visit https://vrf.chain.link/amoy, create subscription, fund with LINK,
///      add CoinFlip contract as consumer, and note the subscription ID.
///   4. Call coinFlip.setSubscriptionId(id) from owner if not set in constructor.
///   5. Seed the pool: approve MockUSDC then call coinFlip.deposit(amount).
contract DeployTestnet is Script {
    // Polygon Amoy VRF v2.5 addresses
    address constant VRF_COORDINATOR = 0x343300B5d84D444B2aDC9116FeF1BED02be49CF3;
    bytes32 constant KEY_HASH        = 0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 subscriptionId     = vm.envOr("VRF_SUBSCRIPTION_ID", uint256(0));

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy mock USDC
        MockUSDC mockUsdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(mockUsdc));

        // 2. Deploy CoinFlip (subscriptionId=0 is fine until VRF sub is created)
        CoinFlip coinFlip = new CoinFlip(
            VRF_COORDINATOR,
            address(mockUsdc),
            subscriptionId,
            KEY_HASH
        );
        console.log("CoinFlip deployed at:", address(coinFlip));

        // 3. Faucet some USDC to the deployer for pool seeding convenience
        uint256 seedAmount = 10_000 * 1e6; // 10,000 USDC
        mockUsdc.faucet(vm.addr(deployerPrivateKey), seedAmount);
        console.log("Fauceted 10,000 USDC to deployer");

        vm.stopBroadcast();

        console.log("\n--- Next steps ---");
        console.log("1. Go to https://vrf.chain.link/amoy");
        console.log("2. Create a subscription, fund LINK, add CoinFlip as consumer");
        console.log("3. Set NEXT_PUBLIC_CONTRACT_ADDRESS =", address(coinFlip));
        console.log("   Set NEXT_PUBLIC_USDC_ADDRESS     =", address(mockUsdc));
        console.log("4. Approve MockUSDC then call deposit() to seed the pool");
    }
}
