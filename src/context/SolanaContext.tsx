import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";

// Define the type for the Solana wallet provider (e.g., Phantom)
interface SolanaProvider {
  isPhantom?: boolean;
  publicKey: PublicKey | { toString: () => string };
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
}

// Define the context type
interface SolanaContextType {
  wallet: SolanaProvider | null;
  publicKey: PublicKey | null;
  balance: number;
  connection: Connection;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  fetchBalance: () => Promise<void>;
}

// Create the context
const SolanaContext = createContext<SolanaContextType | undefined>(undefined);

// Create a provider component
export const SolanaProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<SolanaProvider | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [connection] = useState(
    new Connection(
      process.env.REACT_APP_SOLANA_RPC_URL || "https://api.devnet.solana.com",
      "confirmed"
    )
  );

  // Fetch balance function
  const fetchBalance = async () => {
    if (!publicKey) return;
    try {
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("❌ Error fetching balance:", error);
    }
  };

  // Connect Wallet
  const connectWallet = async () => {
    try {
      const provider = (window as any).solana as SolanaProvider | undefined;
      if (!provider || !provider.isPhantom) {
        alert("No wallet found. Install Phantom or Solflare.");
        return;
      }

      await provider.connect();
      setWallet(provider);

      const pubKey = new PublicKey(provider.publicKey.toString());
      setPublicKey(pubKey);

      console.log("✅ Wallet connected:", provider);
      console.log("✅ PublicKey:", pubKey.toString());

      await fetchBalance(); // ✅ Fetch balance after connecting
    } catch (error) {
      console.error("❌ Wallet connection failed:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  // Disconnect Wallet
  const disconnectWallet = () => {
    if (wallet) {
      wallet.disconnect();
      setWallet(null);
      setPublicKey(null);
      setBalance(0);
      console.log("🚪 Wallet disconnected.");
    }
  };

  // Auto-update balance every 10 seconds
  useEffect(() => {
    if (publicKey) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [publicKey]);

  return (
    <SolanaContext.Provider
      value={{ wallet, publicKey, balance, connection, connectWallet, disconnectWallet, fetchBalance }}
    >
      {children}
    </SolanaContext.Provider>
  );
};

// Custom hook to use the Solana context
export const useSolana = () => {
  const context = useContext(SolanaContext);
  if (!context) {
    throw new Error("useSolana must be used within a SolanaProvider");
  }
  return context;
};
