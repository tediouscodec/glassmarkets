import { create } from "zustand";
import type { CandleInterval } from "../../../types/hyperliquid";
import { subscribeWithSelector } from "zustand/middleware";

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
    lastUpdatedCandle?: ChartCandle | null;
    coin: string;
    interval: CandleInterval;
    setCandles: (data: ChartCandle[]) => void;
    addCandle: (candle: ChartCandle) => void;
};

export const useCandleStore = create(
    subscribeWithSelector<CandleState>((set) => ({
        candles: [],
        lastUpdatedCandle: null,
        coin: "SOL",
        interval: "1m",

        setCandles: (data) => set({ candles: data }),
        addCandle: (candle) =>
            set((state) => {
                const idx = state.candles.findIndex((c) => c.time === candle.time);
                let newCandles;

                if (idx !== -1) {
                    newCandles = [...state.candles];
                    newCandles[idx] = candle;
                } else {
                    newCandles = [...state.candles, candle];
                }

                return { candles: newCandles, lastUpdatedCandle: candle };
            }),
    }))
);