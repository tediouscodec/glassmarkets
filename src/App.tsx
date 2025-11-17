import { useEffect } from "react";
import { hlws } from "./api/hyperliquid";
import Orderbook from "./features/orderbook/components/Orderbook";
import LiquidityMetrics from "./features/orderbook/components/LiquidityMetrics";
import CandleChart from "./features/candles/components/CandleChart";
import MarketSelector from "./features/market/components/MarketSelector";

export default function App() {
  useEffect(() => {
    hlws.connect();
  }, []);

  return (
    <div className="min-h-screen min-w-screen bg-gray-900 text-white">
      <main className="p-4 space-y-6 w-full">
        <MarketSelector />
        <CandleChart />
        <Orderbook />
        <LiquidityMetrics />
      </main>
    </div>
  );
}
