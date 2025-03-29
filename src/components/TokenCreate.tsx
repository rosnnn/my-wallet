import { useState } from "react";
import { useSolana } from "../context/SolanaContext";
import { createToken } from "../utils/solanaUtils";

export const TokenCreate = () => {
  const { wallet, publicKey, connection } = useSolana();
  const [loading, setLoading] = useState(false);
  const [tokenMint, setTokenMint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateToken = async () => {
    if (!wallet || !publicKey) {
      setError("❌ Please connect your wallet!");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const mint = await createToken(connection, wallet, publicKey);
      setTokenMint(mint.toString());
    } catch (err) {
      setError("❌ Token creation failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-lg backdrop-blur-md border border-gray-700">
      <h2 className="text-2xl font-bold text-green-400">🚀 Create Token</h2>

      <button
        onClick={handleCreateToken}
        className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-lg transition hover:scale-105 active:scale-95 shadow-lg"
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
          "Create Token"
        )}
      </button>

      {tokenMint && (
        <p className="mt-4 p-3 text-green-400 bg-green-900 rounded-md">
          ✅ Token Created: {tokenMint}
        </p>
      )}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};
