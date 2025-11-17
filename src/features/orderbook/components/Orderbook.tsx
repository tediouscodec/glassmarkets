import { useMemo } from "react";
import { useOrderbookStore } from "../store/orderbookStore";

const fmt = (n: number) =>
    n.toLocaleString(undefined, { maximumFractionDigits: 6 });

interface OrderbookRow {
    px: number;
    sz: number;
    cumSz: number;
}

export default function Orderbook() {
    const bids = useOrderbookStore((s) => s.bids);
    const asks = useOrderbookStore((s) => s.asks);
    const mid = useOrderbookStore((s) => s.mid);
    const spread = useOrderbookStore((s) => s.spread);

    const visibleBids = useMemo(() => bids.slice(0, 15), [bids]);
    const visibleAsks = useMemo(() => asks.slice(0, 15), [asks]);

    const globalMaxCumSize = useMemo(() => {
        const maxBidCumSize =
            visibleBids.length > 0 ? visibleBids[visibleBids.length - 1].cumSz : 0;
        const maxAskCumSize =
            visibleAsks.length > 0 ? visibleAsks[visibleAsks.length - 1].cumSz : 0;
        return Math.max(maxBidCumSize, maxAskCumSize);
    }, [visibleBids, visibleAsks]);

    const renderTable = (data: OrderbookRow[], isBid: boolean) => (
        <div className="w-full relative">
            <div className="flex justify-between text-xs text-gray-400 pb-1 border-b border-gray-600 mb-1">
                <span className="w-1/3 text-left">Price</span>
                <span className="w-1/3 text-right">Size</span>
                <span className="w-1/3 text-right">Total</span>
            </div>

            <div className="relative">
                {data.map((l) => {
                    const fillPercentage =
                        globalMaxCumSize > 0 ? (l.cumSz / globalMaxCumSize) * 100 : 0;

                    return (
                        <div
                            key={l.px}
                            className="flex justify-between text-sm py-1 relative z-10"
                        >
                            <div
                                className={`absolute inset-0 ${isBid ? "bg-green-900/30" : "bg-red-900/30"
                                    }`}
                                style={{
                                    width: `${fillPercentage}%`,
                                    ...(isBid ? { right: 0 } : { left: 0 }),
                                }}
                            />

                            <span
                                className={`w-1/3 text-left ${isBid ? "text-green-300" : "text-red-300"
                                    }`}
                            >
                                {fmt(l.px)}
                            </span>
                            <span className="w-1/3 text-right text-gray-200">{fmt(l.sz)}</span>
                            <span className="w-1/3 text-right text-blue-300">
                                {fmt(l.cumSz)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const midValue = mid ? fmt(mid) : null;
    const spreadValue = spread ? `${fmt(spread)}` : null;
    const spreadRelativeValue = (spread && mid) ? `${fmt(spread / mid * 100)}%` : null

    return (
        <div className="p-4">
            <div className="mb-4 text-gray-300">
                <div>
                    Mid: <span className="text-white">{midValue ?? '-'}</span>
                </div>
                <div>
                    Spread: <span className="text-white">{spreadValue ?? '-'} {spreadRelativeValue}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h2 className="font-bold text-green-400 mb-2">Bids</h2>
                    {renderTable(visibleBids, true)}
                </div>

                <div>
                    <h2 className="font-bold text-red-400 mb-2">Asks</h2>
                    {renderTable(visibleAsks, false)}
                </div>
            </div>
        </div>
    );
}
