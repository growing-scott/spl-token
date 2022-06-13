"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeDestination = exports.getContractInfo = exports.unlock = exports.create = exports.TOKEN_VESTING_PROGRAM_ID = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const instructions_1 = require("./instructions");
const utils_1 = require("./utils");
const state_1 = require("./state");
const console_1 = require("console");
const bs58_1 = __importDefault(require("bs58"));
exports.TOKEN_VESTING_PROGRAM_ID = new web3_js_1.PublicKey('CChTq6PthWU82YZkbveA3WDf7s97BWhBK4Vx9bmsT743');
async function create(connection, programId, seedWord, payer, sourceTokenOwner, possibleSourceTokenPubkey, destinationTokenPubkey, mintAddress, schedules) {
    // If no source token account was given, use the associated source account
    if (possibleSourceTokenPubkey == null) {
        possibleSourceTokenPubkey = await utils_1.findAssociatedTokenAddress(sourceTokenOwner, mintAddress);
    }
    // Find the non reversible public key for the vesting contract via the seed
    seedWord = seedWord.slice(0, 31);
    const [vestingAccountKey, bump] = await web3_js_1.PublicKey.findProgramAddress([seedWord], programId);
    const vestingTokenAccountKey = await utils_1.findAssociatedTokenAddress(vestingAccountKey, mintAddress);
    seedWord = Buffer.from(seedWord.toString('hex') + bump.toString(16), 'hex');
    console.log('Vesting contract account pubkey: ', vestingAccountKey.toBase58());
    console.log('contract ID: ', bs58_1.default.encode(seedWord));
    const check_existing = await connection.getAccountInfo(vestingAccountKey);
    if (!!check_existing) {
        throw 'Contract already exists.';
    }
    let instruction = [
        instructions_1.createInitInstruction(web3_js_1.SystemProgram.programId, programId, payer, vestingAccountKey, [seedWord], schedules.length),
        await utils_1.createAssociatedTokenAccount(web3_js_1.SystemProgram.programId, web3_js_1.SYSVAR_CLOCK_PUBKEY, payer, vestingAccountKey, mintAddress),
        instructions_1.createCreateInstruction(programId, spl_token_1.TOKEN_PROGRAM_ID, vestingAccountKey, vestingTokenAccountKey, sourceTokenOwner, possibleSourceTokenPubkey, destinationTokenPubkey, mintAddress, schedules, [seedWord]),
    ];
    return instruction;
}
exports.create = create;
async function unlock(connection, programId, seedWord, mintAddress) {
    seedWord = seedWord.slice(0, 31);
    const [vestingAccountKey, bump] = await web3_js_1.PublicKey.findProgramAddress([seedWord], programId);
    seedWord = Buffer.from(seedWord.toString('hex') + bump.toString(16), 'hex');
    const vestingTokenAccountKey = await utils_1.findAssociatedTokenAddress(vestingAccountKey, mintAddress);
    console.log('vestingAccountKey', vestingAccountKey.toBase58());
    console.log('vestingTokenAccountKey', vestingTokenAccountKey.toBase58());
    const vestingInfo = await getContractInfo(connection, vestingAccountKey);
    console.log('vestingInfo', vestingInfo, vestingInfo.destinationAddress.toBase58());
    console.log('programId', programId.toBase58());
    console.log('contract ID: ', bs58_1.default.encode(seedWord));
    let instruction = [
        instructions_1.createUnlockInstruction(programId, spl_token_1.TOKEN_PROGRAM_ID, web3_js_1.SYSVAR_CLOCK_PUBKEY, vestingAccountKey, vestingTokenAccountKey, vestingInfo.destinationAddress, [seedWord]),
    ];
    return instruction;
}
exports.unlock = unlock;
async function getContractInfo(connection, vestingAccountKey) {
    console.log('Fetching contract ', vestingAccountKey.toBase58());
    const vestingInfo = await connection.getAccountInfo(vestingAccountKey, 'single');
    if (!vestingInfo) {
        throw 'Vesting contract account is unavailable';
    }
    const info = state_1.ContractInfo.fromBuffer(vestingInfo.data);
    if (!info) {
        throw 'Vesting contract account is not initialized';
    }
    return info;
}
exports.getContractInfo = getContractInfo;
async function changeDestination(connection, programId, currentDestinationTokenAccountPublicKey, newDestinationTokenAccountOwner, newDestinationTokenAccount, vestingSeed) {
    let seedWord = vestingSeed[0];
    seedWord = seedWord.slice(0, 31);
    const [vestingAccountKey, bump] = await web3_js_1.PublicKey.findProgramAddress([seedWord], programId);
    seedWord = Buffer.from(seedWord.toString('hex') + bump.toString(16), 'hex');
    const contractInfo = await getContractInfo(connection, vestingAccountKey);
    if (!newDestinationTokenAccount) {
        console_1.assert(!!newDestinationTokenAccountOwner, 'At least one of newDestinationTokenAccount and newDestinationTokenAccountOwner must be provided!');
        newDestinationTokenAccount = await utils_1.findAssociatedTokenAddress(newDestinationTokenAccountOwner, contractInfo.mintAddress);
    }
    return [
        instructions_1.createChangeDestinationInstruction(programId, vestingAccountKey, currentDestinationTokenAccountPublicKey, contractInfo.destinationAddress, newDestinationTokenAccount, [seedWord]),
    ];
}
exports.changeDestination = changeDestination;
//# sourceMappingURL=main.js.map