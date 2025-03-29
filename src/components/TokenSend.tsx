import { useState } from "react";
import { useSolana } from "../context/SolanaContext";
import { createTransferInstruction } from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "../utils/solanaUtils";

export const TokenSend = () => {
  const { wallet, publicKey, connection } = useSolana();
  const [mintAddress, setMintAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSend = async () => {
    if (!wallet || !publicKey || !mintAddress || !recipient || !amount) {
      setError("❌ Connect wallet and fill all fields!");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("❌ Please enter a valid amount!");
      return;
    }

    let recipientPubKey: PublicKey;
    try {
      recipientPubKey = new PublicKey(recipient);
    } catch (err) {
      setError("❌ Invalid recipient address!");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const mint = new PublicKey(mintAddress);
      const sourceAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        publicKey,
        mint,
        publicKey
      );
      const destAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        publicKey,
        mint,
        recipientPubKey
      );

      const transaction = new Transaction().add(
        createTransferInstruction(
          sourceAccount.address,
          destAccount.address,
          publicKey,
          BigInt(amountNum * 10 ** 6) // Convert to smallest unit
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature, "confirmed");

      setSuccess(`✅ Sent ${amount} tokens to ${recipient}`);
    } catch (err) {
      setError("❌ Error during token transfer!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[900px] bg-gray-900 text-white rounded-xl shadow-lg border border-gray-700 p-6 mx-auto">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-700 flex items-center">
        <h2 className="text-xl font-bold text-yellow-400 flex items-center">
          📤 Send Tokens
        </h2>
      </div>

      {/* Form */}
      <div className="p-6">
        <input
          type="text"
          placeholder="Token Mint Address"
          value={mintAddress}
          onChange={(e) => setMintAddress(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
        />

        <input
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-3 mt-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 mt-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
        />

        <button
          onClick={handleSend}
          disabled={loading}
          className={`w-full mt-4 px-6 py-3 rounded-lg font-semibold text-white transition ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-500 to-yellow-700 hover:scale-105 active:scale-95 shadow-lg"
          }`}
        >
          {loading ? "Sending..." : "Send Tokens"}
        </button>
      </div>

      {/* Success & Error Messages */}
      {success && (
        <p className="m-4 p-3 text-green-400 bg-green-900 rounded-md text-center">
          {success}
        </p>
      )}

      {error && (
        <p className="m-4 p-3 text-red-400 bg-red-900 rounded-md text-center">
          {error}
        </p>
      )}
    </div>
  );
};

