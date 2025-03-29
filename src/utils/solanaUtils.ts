import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";

// Define the Solana provider type (same as in useSolana.ts)
interface SolanaProvider {
  isPhantom?: boolean;
  publicKey: PublicKey | { toString: () => string };
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
}

export const createToken = async (
  connection: Connection,
  wallet: SolanaProvider,
  publicKey: PublicKey,
  decimals: number = 6
) => {
  try {
    // Generate a new keypair for the mint
    const mintKeypair = Keypair.generate();
    const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

    // Create a transaction
    const transaction = new Transaction().add(
      // Allocate space for the mint account
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      // Initialize the mint
      createInitializeMintInstruction(
        mintKeypair.publicKey, // Mint account
        decimals, // Decimals
        publicKey, // Mint authority
        null, // Freeze authority
        TOKEN_PROGRAM_ID
      )
    );

    // Fetch the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = publicKey;

    // Sign the transaction with the mint keypair
    transaction.partialSign(mintKeypair);

    // Sign the transaction with the wallet
    const signedTransaction = await wallet.signTransaction(transaction);

    // Send the transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    await connection.confirmTransaction(signature, "confirmed");

    return mintKeypair.publicKey;
  } catch (error) {
    console.error("Token creation failed:", error);
    throw new Error("Failed to create token. Ensure wallet has enough SOL on Devnet.");
  }
};

export const getOrCreateAssociatedTokenAccount = async (
  connection: Connection,
  wallet: SolanaProvider,
  publicKey: PublicKey,
  mint: PublicKey,
  owner: PublicKey
) => {
  try {
    // Get the associated token address
    const associatedTokenAddress = await getAssociatedTokenAddress(mint, owner);

    // Check if the account already exists
    try {
      const account = await getAccount(connection, associatedTokenAddress);
      return account;
    } catch (error) {
      // Account does not exist, create it
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          publicKey, // Payer
          associatedTokenAddress, // Associated token account
          owner, // Owner
          mint // Mint
        )
      );

      // Fetch the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign the transaction with the wallet
      const signedTransaction = await wallet.signTransaction(transaction);

      // Send the transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      // Fetch the created account
      return await getAccount(connection, associatedTokenAddress);
    }
  } catch (error) {
    console.error("Failed to get or create associated token account:", error);
    throw new Error("Failed to get or create associated token account.");
  }
};