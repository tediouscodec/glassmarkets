import { useEffect, useRef, useMemo } from "react";
import {
    createChart,
    HistogramSeries,
    type ISeriesApi,
    type UTCTimestamp,
    type HistogramData
} from "lightweight-charts";
import { useOrderbookStore } from "../store/orderbookStore";

const fmt = (n: number) =>
    n.toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function DepthChart({ height = 300 }) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
    const bidsSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
    const asksSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

    const depthHistory = useOrderbookStore((s) => s.depthHistory);

    const chartData = useMemo(() => {
        const bidsData: HistogramData[] = depthHistory.map((snapshot) => ({
            time: (snapshot.timestamp / 1000) as UTCTimestamp,
            value: snapshot.bidsDepth,
            color: '#16a34a',
        }));

        const asksData: HistogramData[] = depthHistory.map((snapshot) => ({
            time: (snapshot.timestamp / 1000) as UTCTimestamp,
            value: snapshot.asksDepth,
            color: '#ef4444',
        }));

        const latestBids = bidsData.length > 0 ? bidsData[bidsData.length - 1].value : 0;
        const latestAsks = asksData.length > 0 ? asksData[asksData.length - 1].value : 0;

        return {
            bidsData,
            asksData,
            bidsOnTop: latestBids < latestAsks
        };
    }, [depthHistory]);

    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            width: containerRef.current.clientWidth,
            height,
            layout: {
                background: { color: "#0b1220" },
                textColor: "#d1d5db"
            },
            grid: {
                vertLines: { visible: true },
                horzLines: { visible: true }
            },
            localization: {
                dateFormat: "HH:mm:ss",
                priceFormatter: (price: number) => {
                    return price.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                        notation: 'compact'
                    });
                }
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
            },
            rightPriceScale: {
                visible: true,
                borderColor: '#2B2B43',
            },
            leftPriceScale: {
                visible: true,
                borderColor: '#2B2B43',
            },
        });

        const shouldBidsBeOnTop = chartData.bidsOnTop;

        let bidsSeries: ISeriesApi<"Histogram">;
        let asksSeries: ISeriesApi<"Histogram">;

        if (shouldBidsBeOnTop) {
            asksSeries = chart.addSeries(HistogramSeries, {
                color: '#ef4444',
                priceFormat: { type: 'volume' },
                priceScaleId: 'left',
            });
            bidsSeries = chart.addSeries(HistogramSeries, {
                color: '#16a34a',
                priceFormat: { type: 'volume' },
                priceScaleId: 'left',
            });
        } else {
            bidsSeries = chart.addSeries(HistogramSeries, {
                color: '#16a34a',
                priceFormat: { type: 'volume' },
                priceScaleId: 'left',
            });
            asksSeries = chart.addSeries(HistogramSeries, {
                color: '#ef4444',
                priceFormat: { type: 'volume' },
                priceScaleId: 'left',
            });
        }

        chartRef.current = chart;
        bidsSeriesRef.current = bidsSeries;
        asksSeriesRef.current = asksSeries;

        if (chartData.bidsData.length > 0) {
            bidsSeries.setData(chartData.bidsData);
            asksSeries.setData(chartData.asksData);
            chart.timeScale().fitContent();
        }

        const handleResize = () => {
            if (!containerRef.current) return;
            chart.resize(containerRef.current.clientWidth, height);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.remove();
            chartRef.current = null;
            bidsSeriesRef.current = null;
            asksSeriesRef.current = null;
        };
    }, [height, chartData.bidsOnTop]);

    useEffect(() => {
        if (!bidsSeriesRef.current || !asksSeriesRef.current) return;
        if (chartData.bidsData.length === 0) return;

        bidsSeriesRef.current.setData(chartData.bidsData);
        asksSeriesRef.current.setData(chartData.asksData);

        if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
        }
    }, [chartData]);

    const latestDepth = depthHistory.length > 0
        ? depthHistory[depthHistory.length - 1]
        : null;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-300">Orderbook Depth History</h3>
                {latestDepth && (
                    <div className="flex gap-4 text-xs">
                        <span className="text-green-400">
                            Bids: {fmt(latestDepth.bidsDepth)}
                        </span>
                        <span className="text-red-400">
                            Asks: {fmt(latestDepth.asksDepth)}
                        </span>
                    </div>
                )}
            </div>

            {depthHistory.length === 0 ? (
                <div className="text-gray-500 text-sm">No depth data available</div>
            ) : (
                <div ref={containerRef} className="w-full" style={{ height }} />
            )}
        </div>
    );
}

