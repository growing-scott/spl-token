import {Keypair, PublicKey} from "@solana/web3.js";
import {TOKEN_SWAP_PROGRAM_ID} from "@solana/spl-token-swap";
import * as bip39 from "bip39";
import nacl from "tweetnacl";
import {derivePath} from "ed25519-hd-key";

const postSwap = async () => {
  // 회사 계정
  const companyWallet = await getAccount('title agree thought hole metal amateur boost fork indoor amateur sick duck')

  console.log(companyWallet);

  // 유저 계정
  const userWallet = await getAccount('trophy wheel wagon ski employ zebra pelican brief best crisp flavor ready')

  // Fee 계정
  const feeWallet = await getAccount('area corn year aware seat security drip pulp fence innocent wage trial')

  // Token Swap Account(현재는 Fee계정과 동일)
  const tokenSwapAccount = await getAccount('area corn year aware seat security drip pulp fence innocent wage trial')

  // Swap Program
  const [authority, bumpSeed] = await PublicKey.findProgramAddress(
    [tokenSwapAccount.publicKey.toBuffer()],
    TOKEN_SWAP_PROGRAM_ID,
  );

  //const mintA = new PublicKey('So11111111111111111111111111111111111111112');  // 솔라나
  //const mintB = new PublicKey('GqRgUcD4A1r9UgidDC7nCQTEvfwaTzaYvgHUBMG8c4Lp');  // 스타이카
  /*
  const tokenSwap = await TokenSwap.createTokenSwap(
    connection,
    feeWallet,  //swapPayer,
    tokenSwapAccount,  //tokenSwapAccount,
    authority,
    userWallet.publicKey,     // tokenAccountA
    companyWallet.publicKey,  // tokenAccountB
    companyWallet.publicKey,  // tokenPool.publicKey,
    mintA.publicKey,          // mintA - SolanaToken
    mintB.publicKey,
    feeAccount,
    tokenAccountPool,
    TOKEN_SWAP_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    TRADING_FEE_NUMERATOR,
    TRADING_FEE_DENOMINATOR,
    OWNER_TRADING_FEE_NUMERATOR,
    OWNER_TRADING_FEE_DENOMINATOR,
    OWNER_WITHDRAW_FEE_NUMERATOR,
    OWNER_WITHDRAW_FEE_DENOMINATOR,
    HOST_FEE_NUMERATOR,
    HOST_FEE_DENOMINATOR,
    curveType,
    curveParameters,
  );


  console.log(tokenSwap);
  */
}

const getAccount = async (mnemonic) => {
  const keypairs = [];
  const accounts = [];
  if (bip39.validateMnemonic(mnemonic)) {
    const seed = bip39.mnemonicToSeedSync(mnemonic, ''); // prefer async mnemonicToSeed

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
    return wallet;
  }
}
