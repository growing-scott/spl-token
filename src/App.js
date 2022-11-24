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
import {create, unlock} from './token-investing/main.js';
import {Schedule} from "./token-investing/state";
import {generateRandomSeed, Numberu64, signTransactionInstructions} from "./token-investing/utils";
import {Link} from "react-router-dom";

const randomBytesPromise = util.promisify(crypto.randomBytes);
const pbkdf2Promise = util.promisify(crypto.pbkdf2);
const loop = 104901;

function App() {

  /**
   *
   * —————————————————————————————————————————
   *
   * mnemonic: win interest pave move ordinary transfer height busy rookie fly cabbage twin
   * address: GiBBgfpQLX28MZiuE27w22g82Yv4qi5ssfzg6Re7tfVd
   * Token: Co58vLfC7ESdFBxqxB7rLznbSJqUr24CyjgJBdkrVLxp
   *
   * 이전
   * mnemonic: marriage noodle acid wash joke foster galaxy scan release option wagon pair
   * address: 5kWASz9uc4PATjPACxpH38hnWno5dXLQDdVDrmh7N6YN
   *
   *
   */

  const [connection, setConnection] = useState()
    const [mnemonic, setMnemonic] = useState()
    const [address, setAddress] = useState()

    const [wallet, setWallet] = useState()
    //const [userMnemonic, setUserMnemonic] = useState("pencil range middle satisfy south mosquito appear next recipe raise march fuel")

    // Vesting Owner
    const [userMnemonic, setUserMnemonic] = useState("vendor cluster engine exercise equal release paper globe hint sausage plunge loop")
    const [userAddress, setUserAddress] = useState()
    const [balance, setBalance] = useState()
    //const [tokenAddress, setTokenAddress] = useState("AnqSrWGXn5JmSicpezJaEBYkJ1FTt9bu3rfZKXYcxxQV")
    const [tokenAddress, setTokenAddress] = useState("Co58vLfC7ESdFBxqxB7rLznbSJqUr24CyjgJBdkrVLxp")

    const [amount, setAmount] = useState()
    const [balanceMintToken, setBalanceMintToken] = useState()
    const [toAddress, setToAddress] = useState("tw1X1Si5MHJnUBEsWdQ37Tpi7YzPVNmoKSK2HVgpHH3")
    const [delegateAddress, setDelegateAddress] = useState("HYjCTtP55ZJaG2Q7qYcVQWQma5a7SrzfRrY3W568So75")
    const [transactionId, setTransactionId] = useState()
    const [transactions, setTransactions] = useState([])
    const [tokens, setTokens] = useState([])
    const [password, setPassword] = useState(null)
    const [walletPassword, setWalletPassword] = useState(null)
    const [fee, setFee] = useState(null)
    const [programId, setProgramId] = useState('8HJvpXrfRtcVDWQ6CCjpNmoyBEbGzfLEAg2EKQCZuc6h');

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
            try {
              const mint = new PublicKey(tokenAddress)
              console.log(mint);

              /*
              const tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
                connection,
                wallet,
                mint,
                wallet.publicKey
              )
               */

              const tokenAccount = new PublicKey("8Vt9PaoTUZayZjzvn2wuFZTx8WmXMAyAB9SieM5tnkdc")

              console.log(tokenAccount);

              await splToken.mintTo(
                connection,
                wallet,
                mint,
                tokenAccount,
                wallet,
                amount,
              )
            } catch (e) {
              console.log(e);
            }
        }
    }

    const getBalanceMintToken = async () => {
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

    const postBurnToken = async () => {
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

    const postDelegateMintToken = async () => {
      const mint = new PublicKey(tokenAddress);
      const delegateAccount = new PublicKey(delegateAddress);

      const tokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mint,
        wallet.publicKey
      )


      const delegateTokenAccount = await splToken.getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mint,
        delegateAccount
      )

      console.log(tokenAccount.address.toBase58());
      console.log(delegateTokenAccount.address.toBase58());

      let transaction = new Transaction()
        .add(splToken.createSetAuthorityInstruction(
          tokenAccount.address,
          wallet.publicKey,
          splToken.AuthorityType.AccountOwner,
          delegateAccount
        ));

      await sendAndConfirmTransaction(connection, transaction, [wallet]);
    }

    const postTransferToken = async () => {
        const mint = new PublicKey(tokenAddress);

        /*const fromAccount = await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            wallet,
            mint,
            wallet.publicKey
        )*/

        const fromAccount = new PublicKey("8Vt9PaoTUZayZjzvn2wuFZTx8WmXMAyAB9SieM5tnkdc");


        const toAccount = await splToken.getOrCreateAssociatedTokenAccount(
            connection,
            wallet,
            mint,
            new PublicKey(toAddress)
        )

        //const toAccount = new PublicKey(tokenAddress);

        console.log(mint, fromAccount, toAccount);

        const transaction = await splToken.transfer(
            connection,
            wallet,
            fromAccount,
            toAccount.address,
            wallet,
            1
        );
        console.log(transaction);
        setTransactionId(transaction)
    }

    const postTransferTokenForSolana = async () => {

        let transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: new PublicKey(toAddress),
                lamports: LAMPORTS_PER_SOL //Investing 1 SOL. Remember 1 Lamport = 10^-9 SOL.
            }),
        );
        const result = await sendAndConfirmTransaction(connection, transaction, [wallet]);
        console.log(result);
        setTransactionId(result);
    }

    const getTransactions = async () => {
        const transactions = await connection.getConfirmedSignaturesForAddress2(wallet.publicKey);
        console.log(transactions);
        setTransactions(transactions);
    }

    const getTokens = async () => {
        const data = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getProgramAccounts",
            "params": [
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                {
                    "encoding": "jsonParsed",
                    "filters": [
                        {
                            "dataSize": 165
                        },
                        {
                            "memcmp": {
                                "offset": 32,
                                "bytes": wallet.publicKey.toBase58()
                            }
                        }
                    ]
                }
            ]
        }

        const response = await axios.post('https://api.devnet.solana.com', data, {
                //const response = await axios.post( 'https://api.mainnet-beta.solana.com', data, {
                headers: {
                    'Content-type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        )
        console.log(response);
        setTokens(response.data.result);
    }

    const putWalletPassword = async () => {
        if (password) {
            const hashedText = await getHashedValue(password);
            const encryptMnemonic = cipher(userMnemonic, hashedText.substring(0, 16));

            window.localStorage.setItem('secure', hashedText);
            window.localStorage.setItem('data', encryptMnemonic);
        }
    }

    const postLoginWalletPassword = async () => {
        const secure = window.localStorage.getItem('secure');
        const data = window.localStorage.getItem('data');

        if (secure == null || data == null) {
            console.log('No wallet password.');
            return;
        }
        if (walletPassword) {
            const hashedText = await getHashedValue(walletPassword);
            if (hashedText !== secure) {
                console.log('Password incorrect.');
                return;
            }
            console.log('Password correct.')
            const userMnemonic = decipher(data, hashedText.substring(0, 16));
            setUserMnemonic(userMnemonic);
            await importWallet();
        }
    }

    const postLogout = () => {
        window.localStorage.removeItem('secure');
        window.localStorage.removeItem('data');
        setUserMnemonic(null);
        setWallet(null);
        setUserAddress(null);
    }

    // 해시값
    const getHashedValue = async (text) => {
        const key = await pbkdf2Promise(text, "", loop, 64, "sha512");
        return key.toString("base64");
    }

    // 암호화
    const cipher = (text, key) => {
        const encrypt = crypto.createCipheriv('aes-128-ecb', key, '')
        const encryptResult = encrypt.update(text, 'utf8', 'base64') + encrypt.final('base64')
        console.log(encryptResult)
        return encryptResult
    }

    // 복호화
    const decipher = (text, key) => {
        const decode = crypto.createDecipheriv('aes-128-ecb', key, '')
        const decodeResult = decode.update(text, 'base64', 'utf8') + decode.final('utf8')
        console.log(decodeResult)
        return decodeResult;
    }

    const getTransactionFee = async () => {
        // 솔라나 토큰 Transaction Fee
        let transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: new PublicKey(toAddress),
                lamports: LAMPORTS_PER_SOL //Investing 1 SOL. Remember 1 Lamport = 10^-9 SOL.
            }),
        );

        let responseBlockhash = await connection.getLatestBlockhash('finalized');
        console.log(responseBlockhash);
        transaction.recentBlockhash = responseBlockhash.blockhash;
        transaction.feePayer = wallet.publicKey;
        console.log(transaction);
        const response = await connection.getFeeForMessage(
            transaction.compileMessage(),
            'confirmed',
        );

        console.log('Fee', response.value);
        setFee(response.value);
    }

    const postTokenLockup = async () => {
        const seed = generateRandomSeed(); // prefer async mnemonicToSeed
        //const seed = 'asdacvqwasda321321435';
        console.log('seed', seed);
        const program = new PublicKey(programId);
        const destination = new PublicKey(toAddress)

        const schedule = new Schedule(new Numberu64(new Date(2022, 5).getTime() / 1000), new Numberu64(3 * Math.pow(10, 3)));

        const instruction = await create(connection, program, Buffer.from(seed), wallet.publicKey, wallet.publicKey, new PublicKey('B6jV8pVcHQ9fMaiN4TVMWqBtJCXh2UBjbjyyV9Bya5gb'), destination, new PublicKey('HoD1cWgYJffakPy3b92y3MSBEzje1ZM9826QdKjGtuE8'), [schedule]);
        console.log(instruction);

        const tx = await signTransactionInstructions(
            connection,
            [wallet],
            wallet.publicKey,
            instruction,
        );

        console.log(`Transaction: ${tx}`);
    }

    const postTokenUnlock = async () => {
        //const seed = bip39.mnemonicToSeedSync('update system come swap neglect pole layer lock there ball spawn twenty', ''); // prefer async mnemonicToSeed
        const seed = '852796950078475383303924820497854'
        const program = new PublicKey(programId);
        const mint = new PublicKey('HoD1cWgYJffakPy3b92y3MSBEzje1ZM9826QdKjGtuE8')

        const instruction = await unlock(connection, program, Buffer.from(seed), mint);
        console.log(instruction);

        const tx = await signTransactionInstructions(
            connection,
            [wallet],
            wallet.publicKey,
            instruction,
        );

        /*
        // Create Simple Transaction
        let recentBlockhash = await connection.getRecentBlockhash();
        let transaction = new Transaction({
            recentBlockhash: recentBlockhash.blockhash,
            feePayer: wallet.publicKey
        });

// Add an instruction to execute
        transaction.add(...instruction);

// Send and confirm transaction
// Note: feePayer is by default the first signer, or payer, if the parameter is not set
        const tx = await sendAndConfirmTransaction(connection, transaction, [wallet])
         */

        console.log(`Transaction: ${tx}`);
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

    const onChangeDelegateAddress = (e) => {
      const { name, value }  = e.target;
      setDelegateAddress(value);
    }

    const onChangePassword = (e) => {
        const { name, value }  = e.target;
        setPassword(value);
    }

    const onChangeWalletPassword = (e) => {
        const { name, value }  = e.target;
        setWalletPassword(value);
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
                <input name="mnemonic" placeholder="mnemonic" style={{width: 500}} onChange={onChangeMnemonic} />
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
            <div className="contents">
                <button onClick={postTransferTokenForSolana}>솔라나 전송 - 1개</button>
                <button onClick={postTransferToken}>발행한 토큰 전송 - 1개</button>
                <input name="toAddress" placeholder="Address" style={{width: 500}} onChange={onChangeToAddress} />
                <div>transaction: {transactionId}</div>
            </div>
            <div className="contents">
              <button onClick={postDelegateMintToken}>토큰 권한 이전</button>
              <input name="delegateAddress" placeholder="Address" style={{width: 500}} onChange={onChangeDelegateAddress} />
            </div>
            <div className="contents">
                <button onClick={getTransactions}>트랜잭션 조회</button>
                <div>
                    {transactions.map((t, index) => (
                        <div key={t.blockTime} style={{fontSize: 11, textAlign: 'left'}}>
                            {t.confirmationStatus} - {t.blockTime} - {t.signature}
                        </div>
                    ))}
                </div>
            </div>
            <div className="contents">
                <button onClick={getTokens}>토큰 목록 조회</button>
                <div>
                    {tokens.map((t, index) => (
                        <div key={t.pubkey} style={{fontSize: 12, textAlign: 'left'}}>
                            {t.account.data.parsed.info.mint} - {t.account.data.parsed.info.tokenAmount.amount}
                        </div>
                    ))}
                </div>
            </div>
            <div className="contents">
                <button onClick={putWalletPassword}>지갑 패스워드 설정</button>
                <div>
                    <input name="password" placeholder="Password" style={{width: 500}} onChange={onChangePassword} />
                </div>
            </div>
            <div className="contents">
                <button onClick={postLoginWalletPassword}>지갑 패스워드 로그인</button>
                <div>
                    <input name="walletPassword" placeholder="Password" style={{width: 500}} onChange={onChangeWalletPassword} />
                </div>
            </div>
            <div className="contents">
                <button onClick={postLogout}>지갑 로그아웃</button>
            </div>
            <div className="contents">
                <button onClick={getTransactionFee}>Fee</button>
                <div>{fee}</div>
            </div>
            <Link to="/vesting">토큰 인베스팅</Link> |{" "}
        </div>
    );
}

export default App;
