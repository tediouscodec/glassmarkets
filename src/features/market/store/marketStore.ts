import { create } from "zustand";
import { candleService } from "../../candles/services/candle.service";
import type { CandleInterval } from "../../../types/hyperliquid";
import { subscribeWithSelector } from "zustand/middleware";
import { orderbookService } from "../../orderbook/services/orderbook.service";

type MarketState = {
    coin: string;
    interval: CandleInterval;
    setMarket: (coin: string) => void;
};

export const useMarketStore = create(
    subscribeWithSelector<MarketState>((set) => ({
        coin: "SOL",
        interval: "1m",
        setMarket: (coin) => set({ coin })
    }))
);

useMarketStore.subscribe(
    (state) => ({ coin: state.coin, interval: state.interval }),
    ({ coin, interval }) => {
        candleService.setMarket(coin, interval);
        orderbookService.setMarket(coin);
    }
);