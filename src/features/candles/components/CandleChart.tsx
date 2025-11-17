import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, type ISeriesApi, type UTCTimestamp } from "lightweight-charts";
import { useCandleStore } from "../store/candleStore";

export default function CandleChart({ height = 360 }) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    const candles = useCandleStore((s) => s.candles);

    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            width: containerRef.current.clientWidth,
            height,
            layout: { background: { color: "#0b1220" }, textColor: "#d1d5db" },
            grid: { vertLines: { visible: false }, horzLines: { visible: true } },
            localization: { dateFormat: "yyyy-MM-dd\nHH:mm" },
        });

        const series = chart.addSeries(CandlestickSeries, {
            upColor: "#16a34a",
            downColor: "#ef4444",
            wickUpColor: "#16a34a",
            wickDownColor: "#ef4444",
            borderVisible: false,
        });

        chartRef.current = chart;
        seriesRef.current = series;

        const handleResize = () => {
            if (!containerRef.current) return;
            chart.resize(containerRef.current.clientWidth, height);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
            chartRef.current = null;
            seriesRef.current = null;
        };
    }, [height]);

    useEffect(() => {
        if (!seriesRef.current) return;

        const data = candles.map((c) => ({
            time: c.time as UTCTimestamp,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
        }));

        seriesRef.current.setData(data);
    }, [candles]);

    return <div ref={containerRef} className="w-full" style={{ height }} />;
}
