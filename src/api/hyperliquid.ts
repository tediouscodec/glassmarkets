import { SubscriptionClient, WebSocketTransport } from '@nktkas/hyperliquid';
import type { WsL2BookEvent, WsCandleEvent } from '@nktkas/hyperliquid';
import type { CandleInterval } from '../types/hyperliquid';

export type MessageHandler<T = any> = (msg: T) => void;

type Topic = string;

export class HyperliquidWS {
    private subscriptionClient: SubscriptionClient | null = null;
    private transport: WebSocketTransport | null = null;
    private handlers: Map<Topic, Set<MessageHandler>> = new Map();
    private currentSymbol: string = '';
    private readyResolve: (() => void) | null = null;
    private readyPromise: Promise<void> | null = null;

    async connect() {
        if (this.transport) return this.readyPromise; // already connecting/connected

        this.readyPromise = new Promise((resolve) => (this.readyResolve = resolve));

        try {
            this.transport = new WebSocketTransport({
                reconnect: { maxRetries: 3, connectionTimeout: 10000 },
                resubscribe: true,
            });

            this.subscriptionClient = new SubscriptionClient({ transport: this.transport });
            await this.transport.ready();

            this.readyResolve?.();
        } catch (err) {
            console.error('Connection error:', err);
            setTimeout(() => this.connect(), 1000);
        }

        return this.readyPromise;
    }

    // Helpers
    async subscribeOrderbook(symbol: string) {
        if (!this.subscriptionClient) throw new Error('Subscription client not initialized');

        try {
            const unsub = await this.subscriptionClient.l2Book({ coin: symbol }, (data: WsL2BookEvent) => {
                this.emit(`l2Book:${symbol}`, data);
            });
            return unsub;
        } catch (error) {
            console.error(`[HL] Failed to subscribe orderbook ${symbol}:`, error);
            throw error;
        }
    }

    async subscribeCandle(symbol: string, interval: CandleInterval) {
        if (!this.subscriptionClient) throw new Error('Subscription client not initialized');

        try {
            const unsub = await this.subscriptionClient.candle({ coin: symbol, interval }, (data: WsCandleEvent) => {
                this.emit(`candle:${symbol}:${interval}`, data);
            });
            return unsub;
        } catch (error) {
            console.error(`[HL] Failed to subscribe candle ${symbol} ${interval}:`, error);
            throw error;
        }
    }

    // Handler management
    addHandler(topic: Topic, handler: MessageHandler) {
        if (!this.handlers.has(topic)) this.handlers.set(topic, new Set());
        this.handlers.get(topic)!.add(handler);

        return () => this.handlers.get(topic)!.delete(handler);
    }

    private emit(topic: Topic, msg: any) {
        const topicHandlers = this.handlers.get(topic);
        if (topicHandlers) {
            topicHandlers.forEach((handler) => handler(msg));
        }
    }

    // Utility
    async changeSymbol(newSymbol: string) {
        if (this.currentSymbol !== newSymbol) {
            await this.subscribeOrderbook(newSymbol);
            this.currentSymbol = newSymbol;
        }
    }

    async disconnect() {
        if (this.transport) await this.transport.close();
        this.handlers.clear();
        this.subscriptionClient = null;
        this.transport = null;
    }

    getConnectionStatus(): boolean {
        return this.transport !== null;
    }

    waitUntilReady() {
        return this.readyPromise ?? Promise.resolve();
    }
}

export const hlws = new HyperliquidWS();
