import { create } from 'zustand';
import type { EnrichedLevel } from '../../../types/hyperliquid';

type OBState = {
    bids: EnrichedLevel[];
    asks: EnrichedLevel[];
    mid: number | null;
    spread: number | null;

    applyOrderbook: (msg: {
        bids: EnrichedLevel[];
        asks: EnrichedLevel[];
        mid: number | null;
        spread: number | null;
    }) => void;
};

export const useOrderbookStore = create<OBState>((set) => ({
    bids: [],
    asks: [],
    mid: null,
    spread: null,

    applyOrderbook: (parsed) =>
        set({
            bids: parsed.bids,
            asks: parsed.asks,
            mid: parsed.mid,
            spread: parsed.spread,
        }),
}));
