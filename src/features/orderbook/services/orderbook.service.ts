import { hlws } from "../../../api/hyperliquid";
import { useOrderbookStore } from "../store/orderbookStore";
import { parseOrderbook } from "./parseOrderbook";

class OrderbookService {
    private unsubscribeHandler: (() => Promise<void>) | null = null;
    private currentSymbol: string | null = null;

    async setMarket(symbol: string) {
        if (this.currentSymbol === symbol) return;
        this.currentSymbol = symbol;

        useOrderbookStore.setState({ depthHistory: [] });

        await this.unsubscribe();

        await hlws.waitUntilReady();

        const sub = await hlws.subscribeOrderbook(symbol);

        const handler = (rawMsg: any) => {
            const parsed = parseOrderbook(rawMsg);
            useOrderbookStore.getState().applyOrderbook(parsed);
        };

        const unsubscribe = hlws.addHandler(`l2Book:${symbol}`, handler);

        this.unsubscribeHandler = async () => {
            unsubscribe();
            await sub.unsubscribe();
        };
    }

    async unsubscribe() {
        if (this.unsubscribeHandler) {
            await this.unsubscribeHandler();
            this.unsubscribeHandler = null;
        }
    }
}

export const orderbookService = new OrderbookService();
