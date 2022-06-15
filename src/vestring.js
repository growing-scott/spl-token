import './App.css';
import {useEffect, useState} from "react";
import * as bip39 from 'bip39';
import nacl from 'tweetnacl';
import { clusterApiUrl, Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, Account, Transaction, sendAndConfirmTransaction, SystemProgram } from '@solana/web3.js';
import * as splToken from '@solana/spl-token';
import axios from 'axios';
import { derivePath } from "ed25519-hd-key";
import crypto from "crypto";
import util from "util";
import {Schedule} from "./token-investing/state";
import {create, unlock} from './token-investing/main.js';
import {generateRandomSeed, Numberu64, signTransactionInstructions} from "./token-investing/utils";

const pbkdf2Promise = util.promisify(crypto.pbkdf2);
const loop = 104901;

export default function TokenVesting() {

    const [connection, setConnection] = useState()
    const [mnemonic, setMnemonic] = useState()
    const [address, setAddress] = useState()

    const [wallet, setWallet] = useState()
    //const [userMnemonic, setUserMnemonic] = useState("pencil range middle satisfy south mosquito appear next recipe raise march fuel")

    // Vesting Owner
    const [userMnemonic, setUserMnemonic] = useState("alien symptom hip grace physical filter oil soul acid famous acquire napkin")
    const [userAddress, setUserAddress] = useState()
    const [balance, setBalance] = useState()
    const [tokenAddress, setTokenAddress] = useState("HoD1cWgYJffakPy3b92y3MSBEzje1ZM9826QdKjGtuE8")
    const [mintTokenAccount, setMintTokenAccount] = useState("B6jV8pVcHQ9fMaiN4TVMWqBtJCXh2UBjbjyyV9Bya5gb")

    const [amount, setAmount] = useState(30);
    const [toAddress, setToAddress] = useState("tw1X1Si5MHJnUBEsWdQ37Tpi7YzPVNmoKSK2HVgpHH3")
    const [transactionId, setTransactionId] = useState()
    const [unlockTransactionId, setUnlockTransactionId] = useState(null)
    const [walletAddress, setWalletAddress] = useState(null)
    const [tokenAccount, setTokenAccount] = useState(null)
    const [programId, setProgramId] = useState('8HJvpXrfRtcVDWQ6CCjpNmoyBEbGzfLEAg2EKQCZuc6h');
    const [seed, setSeed] = useState(null);
    const [unlockSeed, setUnlockSeed] = useState(null);
    const [timestamp, setTimestamp] = useState(new Date(2022, 5).getTime() / 1000);

    useEffect(() => {
        // Solana 네트워크 연결
        setConnection(new Connection(
            //clusterApiUrl('mainnet-beta'),
            clusterApiUrl('devnet'),
            'confirmed'
        ))
    }, [])

    const createWallet = async () => {
        const mnemonic = bip39.generateMnemonic();
        const seed = bip39.mnemonicToSeedSync(mnemonic, ''); // prefer async mnemonicToSeed
        //const keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));

        // BIP44
        const keyPair = Keypair.fromSeed(derivePath(`m/44'/501'/0'/0'`, seed.toString("hex")).key);
        const account = new Account(keyPair.secretKey);
        setMnemonic(mnemonic);
        setAddress(account.publicKey.toBase58());
    }

    const importWallet = async () => {
        const keypairs = [];
        const accounts = [];
        if (bip39.validateMnemonic(userMnemonic)) {
            const seed = bip39.mnemonicToSeedSync(userMnemonic, ''); // prefer async mnemonicToSeed

            const bip39KeyPair = Keypair.fromSecretKey(nacl.sign.keyPair.fromSeed(seed.slice(0, 32)).secretKey);
            keypairs.push(bip39KeyPair);
            accounts.push(bip39KeyPair.publicKey);
            console.log(`bip39KeyPair => ${bip39KeyPair.publicKey.toBase58()}`);

            for (let i = 0; i < 10; i++) {
                const path = `m/44'/501'/0'/${i}'`;
                const keypair = Keypair.fromSeed(derivePath(path, seed.toString("hex")).key);
                console.log(`${path} => ${keypair.publicKey.toBase58()}`);
                keypairs.push(keypair);
                accounts.push(keypair.publicKey);
            }

            for (let i = 0; i < 10; i++) {
                const path = `m/44'/501'/${i}'/0'`;
                const keypair = Keypair.fromSeed(derivePath(path, seed.toString("hex")).key);
                console.log(`${path} => ${keypair.publicKey.toBase58()}`);
                keypairs.push(keypair);
                accounts.push(keypair.publicKey);
            }

            const accountsInfo = await connection.getMultipleAccountsInfo(accounts);
            console.log(accountsInfo);
            const availAccount = [];
            accountsInfo.forEach((account, i) => {
                if (account != null) {
                    console.log(keypairs[i]);
                    availAccount.push(keypairs[i]);
                }
            })

            console.log('availAccount: ', availAccount.length);

            let wallet = Keypair.fromSeed(derivePath(`m/44'/501'/0'/0'`, seed.toString("hex")).key);
            if (availAccount.length > 0) {
                wallet = availAccount[0];
            }
            setWallet(wallet);
            setUserAddress(wallet.publicKey.toBase58());
        }
        //let secretKey = Uint8Array.from([5,221,176,230,254,69,103,184,153,84,150,59,138,40,111,219,93,34,136,14,244,178,202,137,112,8,101,28,171,5,229,103,159,238,232,213,246,21,121,194,221,35,174,95,162,83,22,123,5,30,25,136,91,112,103,54,145,65,132,129,121,206,27,255]);
        //let wallet = Keypair.fromSecretKey(secretKey);
        /*
        const wallet = Keypair.fromSecretKey(seedKeyPair.secretKey);
        setWallet(wallet);
        setUserAddress(wallet.publicKey.toBase58());
         */
    }

    const getBalance = async () => {
        if (wallet) {
            console.log(wallet);
            console.log(connection);
            const balance = await connection.getBalance(wallet.publicKey);
            setBalance(balance);
        }
    }

    const postAirdrop = async () => {
        if (wallet) {
            const airdropSignature = await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL);
            await connection.confirmTransaction(airdropSignature);
        }
    }

    const createToken = async () => {
        if (wallet) {
            const mint = await splToken.createMint(connection, wallet, wallet.publicKey, wallet.publicKey, 8);
            setTokenAddress(mint.toBase58());
            const mintInfo = await splToken.getMint(
                connection,
                mint
            )
            console.log(mintInfo);
        }
    }

    const toMintToken = async () => {
        if (wallet) {
            const mint = new PublicKey(tokenAddress)
            console.log(mint);

            const tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
                connection,
                wallet,
                mint,
                wallet.publicKey
            )

            console.log(tokenAccount);

            await splToken.mintTo(
                connection,
                wallet,
                mint,
                tokenAccount.address,
                wallet,
                amount,
            )
        }
    }

    const createAssociatedTokenAccount = async () => {
        const mint = new PublicKey(tokenAddress);

        if (walletAddress) {
            const tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
                connection,
                wallet,
                mint,
                new PublicKey(walletAddress)
            )

            setTokenAccount(tokenAccount.address.toBase58());
        }
    }

    const postTokenLockup = async () => {
        const seed = generateRandomSeed(); // prefer async mnemonicToSeed
        //const seed = 'asdacvqwasda321321435';
        console.log('seed', seed);


        const program = new PublicKey(programId);
        const destination = new PublicKey(toAddress)

        const schedule = new Schedule(new Numberu64(new Date(2022, 5).getTime() / 1000), new Numberu64(3 * Math.pow(10, 3)));

        const instruction = await create(connection, program, Buffer.from(seed), wallet.publicKey, wallet.publicKey, new PublicKey(mintTokenAccount), destination, new PublicKey(tokenAddress), [schedule]);
        console.log(instruction);

        const tx = await signTransactionInstructions(
            connection,
            [wallet],
            wallet.publicKey,
            instruction,
        );

        console.log(`Transaction: ${tx}`);
        setSeed(seed);
        setTransactionId(tx);
    }

    const postTokenUnlock = async () => {
        //const seed = bip39.mnemonicToSeedSync('update system come swap neglect pole layer lock there ball spawn twenty', ''); // prefer async mnemonicToSeed
        const program = new PublicKey(programId);
        const mint = new PublicKey(tokenAddress)

        const instruction = await unlock(connection, program, Buffer.from(unlockSeed), mint);
        console.log(instruction);

        const tx = await signTransactionInstructions(
            connection,
            [wallet],
            wallet.publicKey,
            instruction,
        );

        console.log(`Transaction: ${tx}`);
        setUnlockTransactionId(tx);
    }

    const onChangeMnemonic = (e) => {
        const { name, value }  = e.target;
        setUserMnemonic(value);
    }

    const onChangeAmount = (e) => {
        const { name, value }  = e.target;
        setAmount(value);
    }

    const onChangeToAddress = (e) => {
        const { name, value }  = e.target;
        setToAddress(value);
    }

    const onChangeDate = (e) => {
        const { name, value }  = e.target;
        setTimestamp(value);
    }

    const onChangeWalletAddress = (e) => {
        const { name, value }  = e.target;
        setWalletAddress(value);
    }

    const onChangeUnlockSeed = (e) => {
        const { name, value }  = e.target;
        setUnlockSeed(value);
    }

    return (
        <div className="App">
            <div className="text">
                토큰 발행 - 투자계약용
                <ol>
                    <li>토큰 발행: 토큰 소유자 지갑 Import</li>
                    <li>토큰 주소로 소유자 지갑의 토큰 계정 생성</li>
                    <li>해당 토큰 계정으로 토큰 발행(Mint)</li>
                </ol>
            </div>
            <div className="text">
                토큰 투자 생성(Vesting)
                <ol>
                    <li>토큰 발행: 토큰 소유자 지갑 Import</li>
                    <li>투자 계정 토큰 계정 생성</li>
                    <li>토큰 투자 생성(스케쥴 + 수량)</li>
                    <li>결과: 계약 Seed 구문 발행 & 트랜잭션 ID</li>
                </ol>
            </div>
            <div className="text">
                토큰 투자 해제
                <ol>
                    <li>토큰 발행: 토큰 소유자 지갑 Import</li>
                    <li>계약 Seed 구문으로 투자 계약 해제</li>
                    <li>결과: 계약에 따른 토큰이 투자자에게 전송됨</li>
                </ol>
            </div>
            <div className="contents">
                <button onClick={postAirdrop}>솔라나 에어드랍 받기</button>
            </div>
            <div className="contents">
                <button onClick={importWallet}>지갑 Import</button>
                <input name="mnemonic" placeholder="mnemonic" style={{width: 500}} onChange={onChangeMnemonic} />
            </div>
            <div className="contents">
                <div>address: {userAddress}</div>
                <button onClick={getBalance}>솔라나 잔고</button>
                <div>balance: {balance}</div>
            </div>
            <div className="contents">
                <button onClick={toMintToken}>토큰 발행</button>
                <div>Token Address: {tokenAddress}</div>
                <input name="amount" placeholder="amount" onChange={onChangeAmount} />
            </div>
            <div className="contents">
                <button onClick={createWallet}>지갑 생성</button>
                <div>mnemonic: {mnemonic}</div>
                <div>address: {address}</div>
            </div>
            <div className="contents">
                <button onClick={createAssociatedTokenAccount}>토큰 계정 생성</button>
                <input name="vestingUserAddress" placeholder="Wallet Address" style={{width: 500}} onChange={onChangeWalletAddress} />
                <div>Token Address: {tokenAccount}</div>
            </div>
            <div className="contents">
                <button onClick={postTokenLockup}>Token Vesting</button>
                <input name="toAddress" placeholder="Address" style={{width: 500}} onChange={onChangeToAddress} />
                <input name="date" placeholder="Date" value={timestamp} style={{width: 500}} onChange={onChangeDate} />
                <input name="amount" placeholder="Amount" value={amount} style={{width: 500}} onChange={onChangeAmount} />
                <div>Vesting Seed: {seed}</div>
                <div className="innerText">Transaction: {transactionId}</div>
            </div>
            <div className="contents">
                <input name="unlockSeed" placeholder="Seed" style={{width: 500}} onChange={onChangeUnlockSeed} />
                <button onClick={postTokenUnlock}>Token Unlock</button>
                <div className="innerText">Transaction: {unlockTransactionId}</div>
            </div>
        </div>
    );
}
