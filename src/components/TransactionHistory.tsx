import { useState, useEffect, useCallback } from "react";
import { useSolana } from "../context/SolanaContext";

export const TransactionHistory = () => {
  const { publicKey, connection } = useSolana();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 5 });

      const txs = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await connection.getParsedTransaction(sig.signature, "confirmed");
          return tx ? { ...tx, signature: sig.signature } : null;
        })
      );

      setHistory(txs.filter((tx) => tx !== null)); // Remove null transactions
    } catch (err) {
      setError("❌ Failed to fetch transaction history.");
      console.error("Transaction history fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-lg border border-gray-700 w-full max-w-lg mx-auto mt-6">
      <h2 className="text-2xl font-bold text-yellow-400 flex items-center">📜 Transaction History</h2>

      {loading && <p className="mt-4 text-yellow-400">Loading...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {history.length === 0 && !loading ? (
        <p className="mt-4 text-gray-400">No transactions found.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {history.map((tx, idx) => {
            const signature = tx.signature;
            const slot = tx.slot;
            const timestamp = tx?.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : "Unknown Time";

            // Ensure tx?.transaction exists before accessing instructions
            const instructions = tx?.transaction?.message?.instructions || [];
            const firstTransfer = instructions.find(
              (inst: any) => inst?.parsed?.type === "transfer"
            );

            return (
              <li key={idx} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                <p>
                  <strong>Signature:</strong>{" "}
                  <a
                    href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    {signature.slice(0, 6)}...{signature.slice(-6)}
                  </a>
                </p>
                <p>
                  <strong>Slot:</strong> {slot}
                </p>
                <p>
                  <strong>Time:</strong> {timestamp}
                </p>
                {firstTransfer ? (
                  <>
                    <p>
                      <strong>Amount:</strong>{" "}
                      {(Number(firstTransfer.parsed.info.amount) / 1e9).toFixed(4)} SOL
                    </p>
                    <p>
                      <strong>From:</strong>{" "}
                      {firstTransfer.parsed.info.source.slice(0, 6)}...
                      {firstTransfer.parsed.info.source.slice(-6)}
                    </p>
                    <p>
                      <strong>To:</strong>{" "}
                      {firstTransfer.parsed.info.destination.slice(0, 6)}...
                      {firstTransfer.parsed.info.destination.slice(-6)}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-400">Non-transfer transaction</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
