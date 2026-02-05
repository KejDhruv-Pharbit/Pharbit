// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract Pharbit is ERC1155, ERC1155Holder, AccessControl {

    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // =========================
    // ERRORS
    // =========================

    error InvalidBatch();
    error InvalidAddress();
    error InvalidAmount();
    error Unauthorized();
    error InactiveBatch();
    error InactiveTransaction();
    error BadCourierID();
    error InvalidSignature();

    // =========================
    // STRUCTS
    // =========================

    struct Batch {
        address company;        // Owner company
        uint128 totalSupply;
        uint128 pricePerToken;
        bytes32 metadataHash;
        bool active;            // false = frozen
    }

    struct PendingTx {
        address from;
        address to;
        uint128 amount;
        uint128 pricePerToken;
        bytes32 courierHash;
        uint256 batchId;
        bool active;
    }

    // =========================
    // STORAGE
    // =========================

    uint256 public batchCount;
    uint256 public nextTxId;

    mapping(uint256 => Batch) public batches;
    mapping(uint256 => PendingTx) public pendingTxs;

    // Meta-tx nonces
    mapping(address => uint256) public nonces;

    // =========================
    // EVENTS
    // =========================

    event BatchMinted(
        uint256 indexed batchId,
        address indexed company,
        uint256 supply
    );

    event TransferInitiated(
        uint256 indexed txId,
        uint256 indexed batchId,
        address indexed from,
        address to,
        uint256 amount
    );

    event Redeemed(
        uint256 indexed txId,
        address indexed user
    );

    event BatchFrozen(uint256 indexed batchId);
    event BatchUnfrozen(uint256 indexed batchId);

    // =========================
    // CONSTRUCTOR
    // =========================

    constructor() ERC1155("") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // =========================
    // ADMIN MANAGEMENT
    // =========================

    function addAdmin(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ADMIN_ROLE, user);
    }

    function removeAdmin(address user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ADMIN_ROLE, user);
    }

    // =========================
    // COMPANY MINT (SELF)
    // =========================

    function mintBatch(
        uint128 supply,
        uint128 pricePerToken,
        bytes32 metadataHash
    ) external {

        if (supply == 0) revert InvalidAmount();

        uint256 batchId = batchCount++;

        batches[batchId] = Batch({
            company: msg.sender,
            totalSupply: supply,
            pricePerToken: pricePerToken,
            metadataHash: metadataHash,
            active: true
        });

        _mint(msg.sender, batchId, supply, "");

        emit BatchMinted(batchId, msg.sender, supply);
    }

    // =========================
    // SEND TOKENS (ESCROW)
    // =========================

    function sendTokens(
        uint256 batchId,
        uint128 amount,
        address receiver,
        uint128 pricePerToken,
        bytes32 courierHash
    ) external {

        if (batchId >= batchCount) revert InvalidBatch();
        if (!batches[batchId].active) revert InactiveBatch();
        if (receiver == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();

        _safeTransferFrom(
            msg.sender,
            address(this),
            batchId,
            amount,
            ""
        );

        uint256 txId = ++nextTxId;

        pendingTxs[txId] = PendingTx({
            from: msg.sender,
            to: receiver,
            amount: amount,
            pricePerToken: pricePerToken,
            courierHash: courierHash,
            batchId: batchId,
            active: true
        });

        emit TransferInitiated(
            txId,
            batchId,
            msg.sender,
            receiver,
            amount
        );
    }

    // =========================
    // GASLESS REDEEM
    // =========================

    function redeemMeta(
        uint256 txId,
        address user,
        string calldata courierId,
        bytes calldata signature
    ) external {

        PendingTx storage p = pendingTxs[txId];

        if (!p.active) revert InactiveTransaction();
        if (p.to != user) revert Unauthorized();
        if (!batches[p.batchId].active) revert InactiveBatch();

        if (
            keccak256(abi.encodePacked(courierId)) != p.courierHash
        ) revert BadCourierID();

        bytes32 hash = keccak256(
            abi.encodePacked(
                txId,
                user,
                nonces[user],
                address(this)
            )
        ).toEthSignedMessageHash();

        address signer = hash.recover(signature);

        if (signer != user) revert InvalidSignature();

        unchecked { nonces[user]++; }

        p.active = false;

        _safeTransferFrom(
            address(this),
            user,
            p.batchId,
            p.amount,
            ""
        );

        emit Redeemed(txId, user);
    }

    // =========================
    // DIRECT REDEEM (OPTIONAL)
    // =========================

    function redeem(uint256 txId) external {

        PendingTx storage p = pendingTxs[txId];

        if (!p.active) revert InactiveTransaction();
        if (p.to != msg.sender) revert Unauthorized();
        if (!batches[p.batchId].active) revert InactiveBatch();

        p.active = false;

        _safeTransferFrom(
            address(this),
            msg.sender,
            p.batchId,
            p.amount,
            ""
        );

        emit Redeemed(txId, msg.sender);
    }

    // =========================
    // FREEZE / UNFREEZE (ADMIN)
    // =========================

    function freezeBatch(uint256 batchId) external {
        if (batches[batchId].company != msg.sender) revert Unauthorized();

        if (batchId >= batchCount) revert InvalidBatch();

        batches[batchId].active = false;

        emit BatchFrozen(batchId);
    }

    function unfreezeBatch(uint256 batchId) external {
        if (batches[batchId].company != msg.sender) revert Unauthorized();

        if (batchId >= batchCount) revert InvalidBatch();

        batches[batchId].active = true;

        emit BatchUnfrozen(batchId);
    }

    // =========================
    // RETURN FROZEN TOKENS
    // =========================

    function returnFrozenTokens(
        uint256 batchId,
        uint256 amount
    ) external {

        if (batchId >= batchCount) revert InvalidBatch();

        Batch storage b = batches[batchId];

        if (b.active) revert InactiveBatch();

        address company = b.company;

        // Case 1: User returns
        if (balanceOf(msg.sender, batchId) >= amount) {

            _safeTransferFrom(
                msg.sender,
                company,
                batchId,
                amount,
                ""
            );

            return;
        }

        // Case 2: Admin returns escrow
        if (hasRole(ADMIN_ROLE, msg.sender)) {

            uint256 esc = balanceOf(address(this), batchId);

            if (esc >= amount) {

                _safeTransferFrom(
                    address(this),
                    company,
                    batchId,
                    amount,
                    ""
                );

                return;
            }
        }

        revert Unauthorized();
    }

    // =========================
    // VERIFY METADATA
    // =========================

    function verifyMetadata(
        uint256 batchId,
        bytes32 hashToCheck
    ) external view returns (bool) {

        if (batchId >= batchCount) revert InvalidBatch();

        return batches[batchId].metadataHash == hashToCheck;
    }

    // =========================
    // INTERFACE SUPPORT
    // =========================

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC1155Holder, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}