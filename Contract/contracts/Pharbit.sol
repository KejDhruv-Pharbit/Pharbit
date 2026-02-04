// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract PharbitOptimized is ERC1155, ERC1155Holder, Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // =========================
    // CUSTOM ERRORS
    // =========================
    error InvalidAddress();
    error InvalidAmount();
    error InvalidBatch();
    error InactiveTransaction();
    error Unauthorized();
    error BadCourierID();
    error InvalidSignature();

    // =========================
    // STRUCTS
    // =========================
    struct Batch {
        uint128 totalSupply;    
        uint128 pricePerToken;  
        bool active;            
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
    mapping(address => uint256) public nonces;

    // =========================
    // EVENTS
    // =========================
    event BatchMinted(uint256 indexed batchId, address indexed company, uint256 supply, uint256 price);
    event TransferInitiated(uint256 indexed txId, uint256 indexed batchId, address indexed from, address to, uint256 amount, bytes32 courierHash);
    event Redeemed(uint256 indexed txId, address indexed user );

    constructor() ERC1155("") Ownable(msg.sender) {}

    // =========================
    // MINT BATCH
    // =========================
    function mintBatch(
        address company,
        uint128 supply,
        uint128 pricePerToken
    ) external onlyOwner {
        if (company == address(0)) revert InvalidAddress();
        if (supply == 0) revert InvalidAmount();

        uint256 batchId = batchCount++;
        
        batches[batchId] = Batch({
            totalSupply: supply,
            pricePerToken: pricePerToken,
            active: true
        });

        _mint(company, batchId, supply, "");
        emit BatchMinted(batchId, company, supply, pricePerToken)  ; 
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
        if (receiver == address(0)) revert InvalidAddress();

        _safeTransferFrom(msg.sender, address(this), batchId, amount, "");

        uint256 txId = ++nextTxId;

        // FIXED: Removed the typo 'txIdId' and matched struct fields correctly
        pendingTxs[txId] = PendingTx({
            from: msg.sender,
            to: receiver,
            amount: amount,
            pricePerToken: pricePerToken,
            courierHash: courierHash,
            batchId: batchId,
            active: true
        });

        emit TransferInitiated(txId, batchId, msg.sender, receiver, amount, courierHash);
    }

    // =========================
    // GASLESS REDEEM (META-TX)
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

        if (keccak256(abi.encodePacked(courierId)) != p.courierHash) revert BadCourierID();

        // FIXED: Corrected the library call for newer OpenZeppelin versions
        bytes32 hash = keccak256(
            abi.encodePacked(txId, user, nonces[user], address(this))
        ).toEthSignedMessageHash();

        address signer = hash.recover(signature);
        if (signer != user) revert InvalidSignature();

        unchecked { nonces[user]++; } 

        p.active = false;

        _safeTransferFrom(address(this), user, p.batchId, p.amount, "");

        emit Redeemed(txId, user);
    }

    // =========================
    // DIRECT REDEEM (CHEAPEST GAS)
    // =========================
    function redeem(uint256 txId) external {
        PendingTx storage p = pendingTxs[txId];

        if (!p.active) revert InactiveTransaction();
        if (p.to != msg.sender) revert Unauthorized();

        p.active = false;

        _safeTransferFrom(address(this), msg.sender, p.batchId, p.amount, "");

        emit Redeemed(txId, msg.sender);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC1155Holder)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}