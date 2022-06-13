/// <reference types="node" />
import { PublicKey, TransactionInstruction, Connection } from '@solana/web3.js';
import { ContractInfo, Schedule } from './state';
export declare const TOKEN_VESTING_PROGRAM_ID: PublicKey;
export declare function create(connection: Connection, programId: PublicKey, seedWord: Buffer | Uint8Array, payer: PublicKey, sourceTokenOwner: PublicKey, possibleSourceTokenPubkey: PublicKey | null, destinationTokenPubkey: PublicKey, mintAddress: PublicKey, schedules: Array<Schedule>): Promise<Array<TransactionInstruction>>;
export declare function unlock(connection: Connection, programId: PublicKey, seedWord: Buffer | Uint8Array, mintAddress: PublicKey): Promise<Array<TransactionInstruction>>;
export declare function getContractInfo(connection: Connection, vestingAccountKey: PublicKey): Promise<ContractInfo>;
export declare function changeDestination(connection: Connection, programId: PublicKey, currentDestinationTokenAccountPublicKey: PublicKey, newDestinationTokenAccountOwner: PublicKey | undefined, newDestinationTokenAccount: PublicKey | undefined, vestingSeed: Array<Buffer | Uint8Array>): Promise<Array<TransactionInstruction>>;
