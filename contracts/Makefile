# Load .env if present
-include .env
export

.PHONY: install build test clean deploy-testnet deploy-mainnet verify-testnet

# ── Install dependencies ────────────────────────────────────────────────────────
install:
	forge install smartcontractkit/chainlink
	forge install OpenZeppelin/openzeppelin-contracts
	forge install foundry-rs/forge-std

# ── Build ───────────────────────────────────────────────────────────────────────
build:
	forge build

# ── Test (with verbosity) ───────────────────────────────────────────────────────
test:
	forge test -vvv

# ── Fuzz only ───────────────────────────────────────────────────────────────────
fuzz:
	forge test --match-test testFuzz -vv

# ── Clean artifacts ─────────────────────────────────────────────────────────────
clean:
	forge clean

# ── Deploy testnet (Polygon Amoy) ───────────────────────────────────────────────
# Usage: make deploy-testnet
deploy-testnet:
	forge script script/DeployTestnet.s.sol:DeployTestnet \
		--rpc-url amoy \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--verify \
		-vvvv

# ── Deploy mainnet (Polygon) ────────────────────────────────────────────────────
deploy-mainnet:
	forge script script/Deploy.s.sol:Deploy \
		--rpc-url polygon \
		--private-key $(PRIVATE_KEY) \
		--broadcast \
		--verify \
		-vvvv
