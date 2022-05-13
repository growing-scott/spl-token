import './App.css';
import {useEffect, useState} from "react";
import * as bip39 from 'bip39';
import nacl from 'tweetnacl';
import { clusterApiUrl, Connection, Keypair, PublicKey, LAMPORTS_PER_SOL, Account, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import * as splToken from '@solana/spl-token';

function App() {

    const [connection, setConnection] = useState()
    const [mnemonic, setMnemonic] = useState()
    const [address, setAddress] = useState()

    const [wallet, setWallet] = useState()
    const [userMnemonic, setUserMnemonic] = useState("pencil range middle satisfy south mosquito appear next recipe raise march fuel")
    const [userAddress, setUserAddress] = useState()
    const [balance, setBalance] = useState()
    const [tokenAddress, setTokenAddress] = useState("AnqSrWGXn5JmSicpezJaEBYkJ1FTt9bu3rfZKXYcxxQV")
    const [amount, setAmount] = useState()
    const [balanceMintToken, setBalanceMintToken] = useState()

    useEffect(() => {
        // Solana 네트워크 연결
        setConnection(new Connection(
            clusterApiUrl('devnet'),
            'confirmed'
        ))
    },[])

    const createWallet = async () =>{
        const mnemonic = bip39.generateMnemonic();
        const seed = bip39.mnemonicToSeedSync(mnemonic); // prefer async mnemonicToSeed
        const keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
        const account = new Account(keyPair.secretKey);
        setMnemonic(mnemonic);
        setAddress(account.publicKey.toBase58());
    }

    const importWallet = async () =>{
        const seed = bip39.mnemonicToSeedSync(userMnemonic)
        const seedKeyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
        const wallet = Keypair.fromSecretKey(seedKeyPair.secretKey);
        setWallet(wallet);
        setUserAddress(wallet.publicKey.toBase58());
    }

    const getBalance = async () =>{
        if (wallet) {
            console.log(wallet);
            console.log(connection);
            const balance = await connection.getBalance(wallet.publicKey);
            setBalance(balance);
        }
    }

    const postAirdrop = async () =>{
        if (wallet) {
            const airdropSignature = await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL);
            await connection.confirmTransaction(airdropSignature);
        }
    }

    const createToken = async () =>{
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

    const toMintToken = async () =>{
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

    const getBalanceMintToken = async () =>{
        if (wallet) {
            const mint = new PublicKey(tokenAddress)
            console.log(mint);

            const tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
                connection,
                wallet,
                mint,
                wallet.publicKey
            )

            const tokenAccountInfo = await splToken.getAccount(
                connection,
                tokenAccount.address
            )

            setBalanceMintToken(tokenAccountInfo.amount.toString());
            console.log(tokenAccountInfo.amount);
        }
    }

    const postBurnToken = async () =>{
        if (wallet) {
            const mint = new PublicKey(tokenAddress)

            const tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
                connection,
                wallet,
                mint,
                wallet.publicKey
            )

            const burn = await splToken.burn(
                connection,
                wallet,
                tokenAccount.address,
                mint,
                wallet,
                1
            )
            console.log(burn);
        }
    }

    const postFreezeMintToken = async () => {
        const mint = new PublicKey(tokenAddress)

        let transaction = new Transaction()
            .add(splToken.createSetAuthorityInstruction(
                mint,
                wallet.publicKey,
                splToken.AuthorityType.MintTokens,
                null
            ));

        await sendAndConfirmTransaction(connection, transaction, [wallet]);
    }

    const postReleaseMintToken = async () => {
        const mint = new PublicKey(tokenAddress);

        const mintInfo = await splToken.getMint(
            connection,
            mint
        );

        console.log(mintInfo);
/*
        let transaction = new Transaction()
            .add(splToken.createSetAuthorityInstruction(
                mint,
                wallet.publicKey,
                splToken.AuthorityType.FreezeAccount,
                wallet.publicKey,
            ));

        await sendAndConfirmTransaction(connection, transaction, [wallet]);*/
    }

    const onChangeMnemonic = (e) => {
        const { name, value }  = e.target;
        setUserMnemonic(value);
    }

    const onChangeAmount = (e) => {
        const { name, value }  = e.target;
        setAmount(value);
    }

    return (
        <div className="App">
            <div className="contents">
                <button onClick={createWallet}>지갑 생성</button>
                <div>mnemonic: {mnemonic}</div>
                <div>address: {address}</div>
            </div>
            <div className="contents">
                <button onClick={postAirdrop}>솔라나 에어드랍 받기</button>
            </div>
            <div className="contents">
                <button onClick={importWallet}>지갑 Import</button>
                <input name="mnemonic" placeholder="mnemonic" onChange={onChangeMnemonic} />
            </div>
            <div className="contents">
                <div>address: {userAddress}</div>
                <button onClick={getBalance}>솔라나 잔고</button>
                <div>balance: {balance}</div>
            </div>
            <div className="contents">
                <button onClick={createToken}>토큰 생성</button>
                <div>Token Address: {tokenAddress}</div>
            </div>
            <div className="contents">
                <button onClick={toMintToken}>토큰 발행</button>
                <input name="amount" placeholder="amount" onChange={onChangeAmount} />
            </div>
            <div className="contents">
                <button onClick={getBalanceMintToken}>발행한 토큰 잔고</button>
                <div>balance: {balanceMintToken}</div>
            </div>
            <div className="contents">
                <button onClick={postBurnToken}>발행한 토큰 소각 - 1개</button>
            </div>
            <div className="contents">
                <button onClick={postFreezeMintToken}>토큰 신규 발행 금지</button>
            </div>
        </div>
    );
}

export default App;
