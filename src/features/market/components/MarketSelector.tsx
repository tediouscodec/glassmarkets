import { useEffect, useRef, useState } from "react";
import { useMarketStore } from "../store/marketStore";

const MARKETS = ["BTC", "ETH", "SOL"];

export default function MarketSelector() {
    const [selectedMarket, setSelectedMarket] = useState(useMarketStore((s) => s.coin));
    const setGlobalMarket = useMarketStore((s) => s.setMarket);

    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        setGlobalMarket("SOL");
    }, []);

    const onSelect = (market: string) => {
        setSelectedMarket(market);
        setGlobalMarket(market)
    }

    return (
        <div className="p-2 flex gap-2">
            {MARKETS.map((m) => (
                <button
                    key={m}
                    onClick={() => onSelect(m)}
                    className={`px-3 py-1 rounded ${selectedMarket === m ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-200"}`}
                >
                    {m}
                </button>
            ))}
        </div>
    );
}
