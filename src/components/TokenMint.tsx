import { useState } from "react";
import { useSolana } from "../context/SolanaContext";
import { createMintToInstruction } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "../utils/solanaUtils";

export const TokenMint = () => {
  const { wallet, publicKey, connection } = useSolana();
  const [mintAddress, setMintAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!wallet || !publicKey || !mintAddress || !amount) {
      setError("❌ Connect wallet and fill all fields!");
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("❌ Please enter a valid amount!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mint = new PublicKey(mintAddress);
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        publicKey,
        mint,
        publicKey
      );

      const transaction = new Transaction().add(
        createMintToInstruction(
          mint,
          tokenAccount.address,
          publicKey,
          BigInt(amountNum * 10 ** 6)
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );

      await connection.confirmTransaction(signature, "confirmed");
      alert(`✅ Minted ${amount} tokens!`);
    } catch (err) {
      setError("❌ Error minting tokens!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-lg backdrop-blur-md border border-gray-700">
      <h2 className="text-2xl font-bold text-blue-400">💰 Mint Tokens</h2>

      <input
        type="text"
        placeholder="Token Mint Address"
        value={mintAddress}
        onChange={(e) => setMintAddress(e.target.value)}
        className="w-full p-3 mt-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none transition"
      />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-3 mt-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none transition"
      />

      <button
        onClick={handleMint}
        className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg transition hover:scale-105 active:scale-95 shadow-lg"
      >
        {loading ? (
          <div className="flex items-center">
            <svg
              className="animate-spin h-5 w-5 mr-2 text-white"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
            Processing...
          </div>
        ) : (
          "Mint Tokens"
        )}
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};
