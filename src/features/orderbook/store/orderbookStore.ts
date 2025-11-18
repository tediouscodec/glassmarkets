import { create } from 'zustand';
import type { EnrichedLevel } from '../../../types/hyperliquid';

type OBData = {
    bids: EnrichedLevel[];
    asks: EnrichedLevel[];
    mid: number | null;
    spread: number | null;
}

type DepthSnapshot = {
    timestamp: number;
    bidsDepth: number;
    asksDepth: number;
}

type OBState = OBData & {
    depthHistory: DepthSnapshot[];
    applyOrderbook: (msg: OBData) => void;
};

export const useOrderbookStore = create<OBState>((set) => ({
    bids: [],
    asks: [],
    mid: null,
    spread: null,
    depthHistory: [],

    applyOrderbook: (parsed) =>
        set((state) => {
            const bidsDepth = parsed.bids[parsed.bids.length - 1]?.cumSz ?? 0;
            const asksDepth = parsed.asks[parsed.asks.length - 1]?.cumSz ?? 0;

            const newSnapshot: DepthSnapshot = {
                timestamp: Date.now(),
                bidsDepth,
                asksDepth,
            };

            return {
                bids: parsed.bids,
                asks: parsed.asks,
                mid: parsed.mid,
                spread: parsed.spread,
                // unoptimized, ok for showcase
                depthHistory: [...state.depthHistory, newSnapshot].slice(-100),
            };
        }),
}));
