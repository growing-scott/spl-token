"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChangeDestinationInstruction = exports.createUnlockInstruction = exports.createCreateInstruction = exports.createInitInstruction = exports.Instruction = void 0;
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("./utils");
var Instruction;
(function (Instruction) {
    Instruction[Instruction["Init"] = 0] = "Init";
    Instruction[Instruction["Create"] = 1] = "Create";
})(Instruction = exports.Instruction || (exports.Instruction = {}));
function createInitInstruction(systemProgramId, vestingProgramId, payerKey, vestingAccountKey, seeds, numberOfSchedules) {
    let buffers = [
        Buffer.from(Int8Array.from([0]).buffer),
        Buffer.concat(seeds),
        // @ts-ignore
        new utils_1.Numberu32(numberOfSchedules).toBuffer(),
    ];
    const data = Buffer.concat(buffers);
    const keys = [
        {
            pubkey: systemProgramId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: web3_js_1.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: payerKey,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: vestingAccountKey,
            isSigner: false,
            isWritable: true,
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: vestingProgramId,
        data,
    });
}
exports.createInitInstruction = createInitInstruction;
function createCreateInstruction(vestingProgramId, tokenProgramId, vestingAccountKey, vestingTokenAccountKey, sourceTokenAccountOwnerKey, sourceTokenAccountKey, destinationTokenAccountKey, mintAddress, schedules, seeds) {
    let buffers = [
        Buffer.from(Int8Array.from([1]).buffer),
        Buffer.concat(seeds),
        mintAddress.toBuffer(),
        destinationTokenAccountKey.toBuffer(),
    ];
    schedules.forEach(s => {
        buffers.push(s.toBuffer());
    });
    const data = Buffer.concat(buffers);
    const keys = [
        {
            pubkey: tokenProgramId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: vestingAccountKey,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: vestingTokenAccountKey,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: sourceTokenAccountOwnerKey,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: sourceTokenAccountKey,
            isSigner: false,
            isWritable: true,
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: vestingProgramId,
        data,
    });
}
exports.createCreateInstruction = createCreateInstruction;
function createUnlockInstruction(vestingProgramId, tokenProgramId, clockSysvarId, vestingAccountKey, vestingTokenAccountKey, destinationTokenAccountKey, seeds) {
    const data = Buffer.concat([
        Buffer.from(Int8Array.from([2]).buffer),
        Buffer.concat(seeds),
    ]);
    const keys = [
        {
            pubkey: tokenProgramId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: clockSysvarId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: vestingAccountKey,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: vestingTokenAccountKey,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: destinationTokenAccountKey,
            isSigner: false,
            isWritable: true,
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: vestingProgramId,
        data,
    });
}
exports.createUnlockInstruction = createUnlockInstruction;
function createChangeDestinationInstruction(vestingProgramId, vestingAccountKey, currentDestinationTokenAccountOwner, currentDestinationTokenAccount, targetDestinationTokenAccount, seeds) {
    const data = Buffer.concat([
        Buffer.from(Int8Array.from([3]).buffer),
        Buffer.concat(seeds),
    ]);
    const keys = [
        {
            pubkey: vestingAccountKey,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: currentDestinationTokenAccount,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: currentDestinationTokenAccountOwner,
            isSigner: true,
            isWritable: false,
        },
        {
            pubkey: targetDestinationTokenAccount,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: vestingProgramId,
        data,
    });
}
exports.createChangeDestinationInstruction = createChangeDestinationInstruction;
//# sourceMappingURL=instructions.js.map