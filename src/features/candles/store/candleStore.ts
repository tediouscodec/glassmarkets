import { create } from "zustand";
import type { CandleInterval } from "../../../types/hyperliquid";

type ChartCandle = {
    time: number | string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
};

type CandleState = {
    candles: ChartCandle[];
    coin: string;
    interval: CandleInterval;
    setCandles: (data: ChartCandle[]) => void;
    addCandle: (candle: ChartCandle) => void;
};

export const useCandleStore = create<CandleState>((set) => ({
    candles: [],
    coin: "SOL",
    interval: "1m",

    setCandles: (data) => set({ candles: data }),
    addCandle: (candle) =>
        set((state) => {
            const idx = state.candles.findIndex((c) => c.time === candle.time);
            if (idx !== -1) {
                const newCandles = [...state.candles];
                newCandles[idx] = candle;
                return { candles: newCandles };
            }
            return { candles: [...state.candles, candle] };
        }),
}));
