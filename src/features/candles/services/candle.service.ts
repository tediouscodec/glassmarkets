import { hlws } from "../../../api/hyperliquid";
import { useCandleStore } from "../store/candleStore";
import type { CandleInterval } from "../../../types/hyperliquid";
import type { WsCandleEvent } from "@nktkas/hyperliquid";

class CandleService {
    private unsubscribeHandler: (() => Promise<void>) | null = null;
    private currentSymbol: string | null = null;

    async setMarket(symbol: string, interval: CandleInterval) {
        if (this.currentSymbol === symbol) return;
        this.currentSymbol = symbol;

        await this.unsubscribe();

        await hlws.waitUntilReady();

        useCandleStore.getState().setCandles([]);

        const sub = await hlws.subscribeCandle(symbol, interval);

        const handler = (msg: WsCandleEvent) => {
            useCandleStore.getState().addCandle({
                time: msg.t,
                open: Number(msg.o),
                high: Number(msg.h),
                low: Number(msg.l),
                close: Number(msg.c),
                volume: Number(msg.v),
            });
        }

        const unsubscribe = hlws.addHandler(
            `candle:${symbol}:${interval}`,
            handler
        );

        this.unsubscribeHandler = async () => {
            unsubscribe();
            await sub.unsubscribe();
        }
    }

    async unsubscribe() {
        if (this.unsubscribeHandler) {
            await this.unsubscribeHandler();
            this.unsubscribeHandler = null;
        }
    }
}

export const candleService = new CandleService();
