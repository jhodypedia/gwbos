const { ethers } = require('ethers');
const { Connection, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL, PublicKey } = require('@solana/web3.js');
require('dotenv').config();

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID; // API key untuk Infura (Ethereum/BSC/Polygon)

// Fungsi untuk mengirim transaksi di jaringan EVM (Ethereum/BSC/Polygon)
async function sendTransactionEVM(mnemonic, network, toAddress) {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);
  const provider = getProvider(network);
  const connectedWallet = wallet.connect(provider);

  const balance = await connectedWallet.getBalance();
  if (balance.isZero()) throw new Error('Insufficient balance');

  const tx = {
    to: toAddress,
    value: balance, // Kirim seluruh saldo
    gasLimit: 21000,
    gasPrice: await provider.getGasPrice(),
  };

  const txResponse = await connectedWallet.sendTransaction(tx);
  await txResponse.wait();

  return `Transaction successful! Hash: ${txResponse.hash}`;
}

// Fungsi untuk mengirim transaksi di jaringan Solana
async function sendTransactionSolana(mnemonic, toAddress) {
  const seed = ethers.utils.mnemonicToSeedSync(mnemonic);
  const keypair = Keypair.fromSeed(Uint8Array.from(seed.slice(0, 32))); // Ambil 32 byte pertama untuk keypair Solana
  const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

  const balance = await connection.getBalance(keypair.publicKey);
  if (balance === 0) throw new Error('Insufficient balance');

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: new PublicKey(toAddress),
      lamports: balance,
    })
  );

  const signature = await connection.sendTransaction(transaction, [keypair]);
  await connection.confirmTransaction(signature, 'confirmed');

  return `Transaction successful! Signature: ${signature}`;
}

// Fungsi untuk mendapatkan provider berdasarkan jaringan
function getProvider(network) {
  const providers = {
    ethereum: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    bsc: 'https://bsc-dataseed.binance.org/',
    polygon: 'https://polygon-rpc.com/',
  };
  return new ethers.JsonRpcProvider(providers[network]);
}

module.exports = { sendTransactionEVM, sendTransactionSolana };
