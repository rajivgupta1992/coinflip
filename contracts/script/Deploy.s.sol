// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {CoinFlip} from "../src/CoinFlip.sol";

/// @notice Deploy CoinFlip on Polygon mainnet with real USDC.
///
/// Before running:
///   1. Copy .env.example to .env and fill in PRIVATE_KEY, POLYGON_RPC_URL,
///      VRF_SUBSCRIPTION_ID (from vrf.chain.link/polygon), USDC_ADDRESS.
///   2. Run: make deploy-mainnet
contract Deploy is Script {
    // Polygon mainnet VRF v2.5 addresses
    address constant VRF_COORDINATOR = 0xeC0ed46F36576541C75739ed262d0851d9ec4406;
    bytes32 constant KEY_HASH        = 0x719ed7d7664abc3001c18aac8130a2265e1e70b7150f4f35e2f5bb0f29c15be3;

    // Polygon mainnet USDC (native, 6 decimals)
    address constant USDC_MAINNET    = 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        uint256 subscriptionId     = vm.envUint("VRF_SUBSCRIPTION_ID");
        address usdcAddress        = vm.envOr("USDC_ADDRESS", USDC_MAINNET);

        vm.startBroadcast(deployerPrivateKey);

        CoinFlip coinFlip = new CoinFlip(
            VRF_COORDINATOR,
            usdcAddress,
            subscriptionId,
            KEY_HASH
        );

        console.log("CoinFlip deployed at:", address(coinFlip));
        console.log("USDC address:        ", usdcAddress);
        console.log("Subscription ID:     ", subscriptionId);

        vm.stopBroadcast();
    }
}
