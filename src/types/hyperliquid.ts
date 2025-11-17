export interface HLOrderLevel {
    px: string;
    sz: string;
}

export interface EnrichedLevel {
    px: number;
    sz: number;
    cumSz: number;
    cumNotional: number;
}

export interface HLOrderbookSnapshot {
    coin: string;
    levels: [HLOrderLevel[], HLOrderLevel[]];
}

export type HLMessage = HLOrderbookSnapshot;

export type CandleInterval = "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";
