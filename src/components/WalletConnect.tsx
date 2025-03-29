import { useEffect } from "react";
import { useSolana } from "../context/SolanaContext";

export const WalletConnect = () => {
  const { wallet, publicKey, balance, connectWallet, disconnectWallet, fetchBalance } = useSolana();

  // Fetch balance when wallet connects
  useEffect(() => {
    if (publicKey) {
      fetchBalance();
    }
  }, [publicKey]);

  return (
    <div className="w-full max-w-[600px] bg-gray-900 text-white rounded-xl shadow-lg border border-gray-700 p-6 mx-auto mt-6">
      <h2 className="text-2xl font-bold text-green-400 flex items-center">
        🔗 Wallet Connection
      </h2>

      {!wallet ? (
        <button
          onClick={connectWallet}
          className="w-full mt-4 px-6 py-3 rounded-lg font-semibold text-white transition bg-gradient-to-r from-blue-500 to-blue-700 hover:scale-105 active:scale-95 shadow-lg"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <p className="text-gray-300">
            <span className="font-semibold text-green-400">Wallet:</span>{" "}
            {publicKey?.toString().slice(0, 8)}...
          </p>
          <p className="text-gray-300 mt-1">
            <span className="font-semibold text-yellow-400">Balance:</span> {balance} SOL
          </p>
          <button
            onClick={disconnectWallet}
            className="w-full mt-4 px-6 py-3 rounded-lg font-semibold text-white transition bg-gradient-to-r from-red-500 to-red-700 hover:scale-105 active:scale-95 shadow-lg"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};
