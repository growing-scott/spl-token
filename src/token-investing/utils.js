"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAssociatedTokenAccount = exports.signTransactionInstructions = exports.sleep = exports.generateRandomSeed = exports.ASSOCIATED_TOKEN_PROGRAM_ID = exports.connection = exports.Numberu32 = exports.Numberu64 = exports.findAssociatedTokenAddress = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
async function findAssociatedTokenAddress(walletAddress, tokenMintAddress) {
    return (await web3_js_1.PublicKey.findProgramAddress([
        walletAddress.toBuffer(),
        spl_token_1.TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
    ], exports.ASSOCIATED_TOKEN_PROGRAM_ID))[0];
}
exports.findAssociatedTokenAddress = findAssociatedTokenAddress;
class Numberu64 extends bn_js_1.default {
    /**
     * Convert to Buffer representation
     */
    toBuffer() {
        const a = super.toArray().reverse();
        const b = Buffer.from(a);
        if (b.length === 8) {
            return b;
        }
        if (b.length > 8) {
            throw new Error('Numberu64 too large');
        }
        const zeroPad = Buffer.alloc(8);
        b.copy(zeroPad);
        return zeroPad;
    }
    /**
     * Construct a Numberu64 from Buffer representation
     */
    static fromBuffer(buffer) {
        if (buffer.length !== 8) {
            throw new Error(`Invalid buffer length: ${buffer.length}`);
        }
        return new bn_js_1.default([...buffer]
            .reverse()
            .map(i => `00${i.toString(16)}`.slice(-2))
            .join(''), 16);
    }
}
exports.Numberu64 = Numberu64;
class Numberu32 extends bn_js_1.default {
    /**
     * Convert to Buffer representation
     */
    toBuffer() {
        const a = super.toArray().reverse();
        const b = Buffer.from(a);
        if (b.length === 4) {
            return b;
        }
        if (b.length > 4) {
            throw new Error('Numberu32 too large');
        }
        const zeroPad = Buffer.alloc(4);
        b.copy(zeroPad);
        return zeroPad;
    }
    /**
     * Construct a Numberu32 from Buffer representation
     */
    static fromBuffer(buffer) {
        if (buffer.length !== 4) {
            throw new Error(`Invalid buffer length: ${buffer.length}`);
        }
        return new bn_js_1.default([...buffer]
            .reverse()
            .map(i => `00${i.toString(16)}`.slice(-2))
            .join(''), 16);
    }
}
exports.Numberu32 = Numberu32;
// Connection
const ENDPOINTS = {
    mainnet: 'https://solana-api.projectserum.com',
    devnet: 'https://devnet.solana.com',
};
exports.connection = new web3_js_1.Connection(ENDPOINTS.devnet);
exports.ASSOCIATED_TOKEN_PROGRAM_ID = new web3_js_1.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
const generateRandomSeed = () => {
    // Generate a random seed
    let seed = '';
    for (let i = 0; i < 64; i++) {
        seed += Math.floor(Math.random() * 10);
    }
    return seed;
};
exports.generateRandomSeed = generateRandomSeed;
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.sleep = sleep;
// Sign transaction
const signTransactionInstructions = async (
// sign and send transaction
connection, signers, feePayer, txInstructions) => {
    const tx = new web3_js_1.Transaction();
    tx.feePayer = feePayer;
    tx.add(...txInstructions);
    return await connection.sendTransaction(tx, signers, {
        preflightCommitment: 'single',
    });
};
exports.signTransactionInstructions = signTransactionInstructions;
const createAssociatedTokenAccount = async (systemProgramId, clockSysvarId, fundingAddress, walletAddress, splTokenMintAddress) => {
    const associatedTokenAddress = await findAssociatedTokenAddress(walletAddress, splTokenMintAddress);
    const keys = [
        {
            pubkey: fundingAddress,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: associatedTokenAddress,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: walletAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: splTokenMintAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: systemProgramId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: spl_token_1.TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: web3_js_1.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: exports.ASSOCIATED_TOKEN_PROGRAM_ID,
        data: Buffer.from([]),
    });
};
exports.createAssociatedTokenAccount = createAssociatedTokenAccount;
//# sourceMappingURL=utils.js.map