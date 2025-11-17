import type { WsL2BookEvent } from '@nktkas/hyperliquid';
import type { EnrichedLevel } from '../../../types/hyperliquid';

export function parseOrderbook(msg: WsL2BookEvent) {
    const parse = (v: string) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    const rawBids = msg.levels[0] ?? [];
    const rawAsks = msg.levels[1] ?? [];

    const bids: EnrichedLevel[] = rawBids
        .map((l) => ({ px: parse(l.px), sz: parse(l.sz) }))
        .filter((l) => l.px > 0 && l.sz > 0)
        .sort((a, b) => b.px - a.px)
        .reduce<EnrichedLevel[]>((acc, l, i) => {
            const prev = acc[i - 1];
            acc.push({ ...l, cumSz: (prev?.cumSz ?? 0) + l.sz, cumNotional: (prev?.cumNotional ?? 0) + l.px * l.sz });
            return acc;
        }, []);

    const asks: EnrichedLevel[] = rawAsks
        .map((l) => ({ px: parse(l.px), sz: parse(l.sz) }))
        .filter((l) => l.px > 0 && l.sz > 0)
        .sort((a, b) => a.px - b.px)
        .reduce<EnrichedLevel[]>((acc, l, i) => {
            const prev = acc[i - 1];
            acc.push({ ...l, cumSz: (prev?.cumSz ?? 0) + l.sz, cumNotional: (prev?.cumNotional ?? 0) + l.px * l.sz });
            return acc;
        }, []);

    const bestBid = bids[0]?.px ?? null;
    const bestAsk = asks[0]?.px ?? null;

    return {
        bids,
        asks,
        mid: bestBid && bestAsk ? (bestBid + bestAsk) / 2 : null,
        spread: bestBid && bestAsk ? bestAsk - bestBid : null,
    };
}
