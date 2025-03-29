import { WalletConnect } from "./components/WalletConnect";
import { TokenCreate } from "./components/TokenCreate";
import { TokenMint } from "./components/TokenMint";
import { TokenSend } from "./components/TokenSend";
import { TransactionHistory } from "./components/TransactionHistory";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Solana Token App</h1>
        <WalletConnect />
        <TokenCreate />
        <TokenMint />
        <TokenSend />
        <TransactionHistory />
      </div>
    </div>
  );
}

export default App;