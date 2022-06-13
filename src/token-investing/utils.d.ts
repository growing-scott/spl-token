/// <reference types="node" />
import BN from 'bn.js';
import { Keypair, Connection, TransactionInstruction, PublicKey } from '@solana/web3.js';
export declare function findAssociatedTokenAddress(walletAddress: PublicKey, tokenMintAddress: PublicKey): Promise<PublicKey>;
export declare class Numberu64 extends BN {
    /**
     * Convert to Buffer representation
     */
    toBuffer(): Buffer;
    /**
     * Construct a Numberu64 from Buffer representation
     */
    static fromBuffer(buffer: any): any;
}
export declare class Numberu32 extends BN {
    /**
     * Convert to Buffer representation
     */
    toBuffer(): Buffer;
    /**
     * Construct a Numberu32 from Buffer representation
     */
    static fromBuffer(buffer: any): any;
}
export declare const connection: Connection;
export declare const ASSOCIATED_TOKEN_PROGRAM_ID: PublicKey;
export declare const generateRandomSeed: () => string;
export declare const sleep: (ms: number) => Promise<void>;
export declare const signTransactionInstructions: (connection: Connection, signers: Array<Keypair>, feePayer: PublicKey, txInstructions: Array<TransactionInstruction>) => Promise<string>;
export declare const createAssociatedTokenAccount: (systemProgramId: PublicKey, clockSysvarId: PublicKey, fundingAddress: PublicKey, walletAddress: PublicKey, splTokenMintAddress: PublicKey) => Promise<TransactionInstruction>;
