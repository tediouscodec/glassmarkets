import type { EnrichedLevel } from "../../types/hyperliquid";

export function getMidPrice(
    bids: { price: number; size: number }[],
    asks: { price: number; size: number }[]
): number | null {
    const bestBid = bids.length > 0
        ? bids.reduce((max, bid) => bid.price > max.price ? bid : max).price
        : null;

    const bestAsk = asks.length > 0
        ? asks.reduce((min, ask) => ask.price < min.price ? ask : min).price
        : null;

    if (bestBid !== null && bestAsk !== null) {
        return (bestBid + bestAsk) / 2;
    }
    if (bestBid !== null) return bestBid;
    if (bestAsk !== null) return bestAsk;
    return null;
}

// Just "PLACEHOLDER", in real calculations should use data from the exchange about coin decimals
export function computeDepthForBps(
    levels: EnrichedLevel[],
    mid: number | null,
    bps: number,
    side: "bids" | "asks"
): number {
    if (!mid) return 0;

    const limitPx =
        side === "bids"
            ? mid * (1 - bps / 10000)
            : mid * (1 + bps / 10000);

    const idx = levels.findIndex(l =>
        side === "bids" ? l.px < limitPx : l.px > limitPx
    );

    const last = idx === -1 ? levels.length - 1 : idx - 1;
    if (last < 0) return 0;

    return levels[last].cumNotional ?? 0;
};


export function computeSlippage(
    book: EnrichedLevel[],
    mid: number | null,
    side: "buy" | "sell",
    notional: number
) {
    if (!mid) return { avgPx: 0, slippagePct: 0 };

    let remaining = notional;
    let totalCost = 0;
    let totalQty = 0;

    for (const l of book) {
        const levelNotional = l.px * l.sz;
        const takeNotional = Math.min(levelNotional, remaining);
        const takeQty = takeNotional / l.px;

        totalCost += takeNotional;
        totalQty += takeQty;

        remaining -= takeNotional;
        if (remaining <= 0) break;
    }

    if (remaining > 0 || totalQty === 0) {
        return { avgPx: Infinity, slippagePct: Infinity };
    }

    const avgPx = totalCost / totalQty;

    const slippagePct =
        side === "buy"
            ? ((avgPx - mid) / mid) * 100
            : ((mid - avgPx) / mid) * 100;

    return { avgPx, slippagePct };
};