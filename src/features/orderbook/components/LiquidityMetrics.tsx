import { useOrderbookStore } from "../store/orderbookStore";
import { computeDepthForBps, computeSlippage } from "../utils";

type DepthBucket = 10 | 25 | 50 | 100 | 200;

const DEPTH_BUCKETS: DepthBucket[] = [10, 25, 50, 100, 200];
const TRADE_SIZES = [1000, 10000, 100000];

export default function LiquidityMetrics() {
    const { bids, asks, mid } = useOrderbookStore();

    return (
        <div className="p-3 space-y-6">
            <div>
                <h3 className="font-medium mb-2">Depth by BPS</h3>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="opacity-60">
                            <th className="text-left">BPS</th>
                            <th className="text-right">Bid Depth ($)</th>
                            <th className="text-right">Ask Depth ($)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DEPTH_BUCKETS.map((bps) => (
                            <tr key={bps}>
                                <td>{bps} bps</td>

                                <td className="text-right">
                                    {computeDepthForBps(bids, mid, bps, "bids").toLocaleString(undefined, {
                                        maximumFractionDigits: 0,
                                    })}
                                </td>

                                <td className="text-right">
                                    {computeDepthForBps(asks, mid, bps, "asks").toLocaleString(undefined, {
                                        maximumFractionDigits: 0,
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div>
                <h3 className="font-medium mb-2">Slippage</h3>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="opacity-60">
                            <th className="text-left">Trade Size</th>
                            <th className="text-right">Buy Slippage (%)</th>
                            <th className="text-right">Sell Slippage (%)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TRADE_SIZES.map((size) => {
                            const buy = computeSlippage(asks, mid, "buy", size);
                            const sell = computeSlippage(bids, mid, "sell", size);

                            return (
                                <tr key={size}>
                                    <td>${size.toLocaleString()}</td>

                                    <td className="text-right">
                                        {Number.isFinite(buy.slippagePct) ? buy.slippagePct.toFixed(3) : "N/A"}
                                    </td>

                                    <td className="text-right">
                                        {Number.isFinite(sell.slippagePct) ? sell.slippagePct.toFixed(3) : "N/A"}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}