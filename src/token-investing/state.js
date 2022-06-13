"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractInfo = exports.VestingScheduleHeader = exports.Schedule = void 0;
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("./utils");
class Schedule {
    constructor(releaseTime, amount) {
        this.releaseTime = releaseTime;
        this.amount = amount;
    }
    toBuffer() {
        return Buffer.concat([this.releaseTime.toBuffer(), this.amount.toBuffer()]);
    }
    static fromBuffer(buf) {
        const releaseTime = utils_1.Numberu64.fromBuffer(buf.slice(0, 8));
        const amount = utils_1.Numberu64.fromBuffer(buf.slice(8, 16));
        return new Schedule(releaseTime, amount);
    }
}
exports.Schedule = Schedule;
class VestingScheduleHeader {
    constructor(destinationAddress, mintAddress, isInitialized) {
        this.destinationAddress = destinationAddress;
        this.mintAddress = mintAddress;
        this.isInitialized = isInitialized;
    }
    static fromBuffer(buf) {
        const destinationAddress = new web3_js_1.PublicKey(buf.slice(0, 32));
        const mintAddress = new web3_js_1.PublicKey(buf.slice(32, 64));
        const isInitialized = buf[64] == 1;
        const header = {
            destinationAddress,
            mintAddress,
            isInitialized,
        };
        return header;
    }
}
exports.VestingScheduleHeader = VestingScheduleHeader;
class ContractInfo {
    constructor(destinationAddress, mintAddress, schedules) {
        this.destinationAddress = destinationAddress;
        this.mintAddress = mintAddress;
        this.schedules = schedules;
    }
    static fromBuffer(buf) {
        const header = VestingScheduleHeader.fromBuffer(buf.slice(0, 65));
        if (!header.isInitialized) {
            return undefined;
        }
        const schedules = [];
        for (let i = 65; i < buf.length; i += 16) {
            schedules.push(Schedule.fromBuffer(buf.slice(i, i + 16)));
        }
        return new ContractInfo(header.destinationAddress, header.mintAddress, schedules);
    }
}
exports.ContractInfo = ContractInfo;
//# sourceMappingURL=state.js.map