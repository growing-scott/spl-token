"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const fs_1 = __importDefault(require("fs"));
const utils_1 = require("./utils");
const state_1 = require("./state");
const main_1 = require("./main");
/**
 *
 * Simple example of a linear unlock.
 *
 * This is just an example, please be careful using the vesting contract and test it first with test tokens.
 *
 */
/** Path to your wallet */
const WALLET_PATH = '';
const wallet = web3_js_1.Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs_1.default.readFileSync(WALLET_PATH).toString())));
/** There are better way to generate an array of dates but be careful as it's irreversible */
const DATES = [
    new Date(2022, 12),
    new Date(2023, 1),
    new Date(2023, 2),
    new Date(2023, 3),
    new Date(2023, 4),
    new Date(2023, 5),
    new Date(2023, 6),
    new Date(2023, 7),
    new Date(2023, 8),
    new Date(2023, 9),
    new Date(2023, 10),
    new Date(2023, 11),
    new Date(2024, 12),
    new Date(2024, 2),
    new Date(2024, 3),
    new Date(2024, 4),
    new Date(2024, 5),
    new Date(2024, 6),
    new Date(2024, 7),
    new Date(2024, 8),
    new Date(2024, 9),
    new Date(2024, 10),
    new Date(2024, 11),
    new Date(2024, 12),
];
/** Info about the desintation */
const DESTINATION_OWNER = new web3_js_1.PublicKey('');
const DESTINATION_TOKEN_ACCOUNT = new web3_js_1.PublicKey('');
/** Token info */
const MINT = new web3_js_1.PublicKey('');
const DECIMALS = 0;
/** Info about the source */
const SOURCE_TOKEN_ACCOUNT = new web3_js_1.PublicKey('');
/** Amount to give per schedule */
const AMOUNT_PER_SCHEDULE = 0;
/** Your RPC connection */
const connection = new web3_js_1.Connection('');
/** Do some checks before sending the tokens */
const checks = async () => {
    const tokenInfo = await connection.getParsedAccountInfo(DESTINATION_TOKEN_ACCOUNT);
    // @ts-ignore
    const parsed = tokenInfo.value.data.parsed;
    if (parsed.info.mint !== MINT.toBase58()) {
        throw new Error('Invalid mint');
    }
    if (parsed.info.owner !== DESTINATION_OWNER.toBase58()) {
        throw new Error('Invalid owner');
    }
    if (parsed.info.tokenAmount.decimals !== DECIMALS) {
        throw new Error('Invalid decimals');
    }
};
/** Function that locks the tokens */
const lock = async () => {
    var _a;
    await checks();
    const schedules = [];
    for (let date of DATES) {
        schedules.push(new state_1.Schedule(
        /** Has to be in seconds */
        // @ts-ignore
        new utils_1.Numberu64(date.getTime() / 1000), 
        /** Don't forget to add decimals */
        // @ts-ignore
        new utils_1.Numberu64(AMOUNT_PER_SCHEDULE * Math.pow(10, DECIMALS))));
    }
    const seed = utils_1.generateRandomSeed();
    console.log(`Seed: ${seed}`);
    const instruction = await main_1.create(connection, main_1.TOKEN_VESTING_PROGRAM_ID, Buffer.from(seed), wallet.publicKey, wallet.publicKey, SOURCE_TOKEN_ACCOUNT, DESTINATION_TOKEN_ACCOUNT, MINT, schedules);
    const tx = await utils_1.signTransactionInstructions(connection, [wallet], wallet.publicKey, instruction);
    console.log(`Transaction: ${tx}`);
    //waiting for tx confirmation
    await new Promise(f => setTimeout(f, 60000));
    //get seed for official bonfida UI
    const txInfo = await connection.getConfirmedTransaction(tx, 'confirmed');
    if (txInfo && !((_a = txInfo.meta) === null || _a === void 0 ? void 0 : _a.err)) {
        console.log(txInfo === null || txInfo === void 0 ? void 0 : txInfo.transaction.instructions[2].data.slice(1, 32 + 1).toString('hex'));
    }
    else {
        throw new Error('Transaction not confirmed.');
    }
};
lock();
//# sourceMappingURL=dev.js.map