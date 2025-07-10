'use client';

import { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { GPUData } from '@/types';

interface AdoptionCurveProps {
    data: GPUData[];
    selectedGPU?: string;
    showPrediction?: boolean;
    onGPUSelect?: (gpuModel: string) => void;
}

interface AdoptionDataPoint {
    monthsFromRelease: number;
    marketShare: number;
    predicted?: boolean;
    gpuModel: string;
}

const CURVE_COLORS = {
    'RTX 40': '#76B900',
    'RTX 30': '#4CAF50',
    'RTX 20': '#2196F3',
    'RX 7000': '#ED1C24',
    'RX 6000': '#FF5722',
    default: '#9E9E9E',
};

export function AdoptionCurve({
    data,
    selectedGPU,
    showPrediction = false,
    onGPUSelect,
}: AdoptionCurveProps) {
    const [hoveredCurve, setHoveredCurve] = useState<string | null>(null);

    const adoptionData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const processedData: AdoptionDataPoint[] = [];

        data.forEach(gpu => {
            if (gpu.marketShare.length === 0) return;

            const releaseDate = gpu.releaseDate;
            const sortedMarketShare = [...gpu.marketShare].sort(
                (a, b) => a.date.getTime() - b.date.getTime()
            );

            // Calculate months from release for each data point
            sortedMarketShare.forEach(point => {
                const monthsFromRelease = Math.round(
                    (point.date.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
                );

                if (monthsFromRelease >= 0) {
                    processedData.push({
                        monthsFromRelease,
                        marketShare: point.value,
                        gpuModel: gpu.model,
                        predicted: false,
                    });
                }
            });

            // Add prediction data if requested
            if (showPrediction && gpu.marketShare.length > 0) {
                const lastPoint = sortedMarketShare[sortedMarketShare.length - 1];
                const lastMonthsFromRelease = Math.round(
                    (lastPoint.date.getTime() - releaseDate.getTime()) /
                        (1000 * 60 * 60 * 24 * 30.44)
                );

                // Simple prediction: logistic growth model
                const currentShare = lastPoint.value;
                const maxPredictedShare = Math.min(currentShare * 2, 25); // Cap at 25%
                const growthRate = 0.1; // Monthly growth rate

                for (let i = 1; i <= 12; i++) {
                    const months = lastMonthsFromRelease + i;
                    const predictedShare = maxPredictedShare * (1 - Math.exp(-growthRate * i));

                    processedData.push({
                        monthsFromRelease: months,
                        marketShare: currentShare + predictedShare,
                        gpuModel: gpu.model,
                        predicted: true,
                    });
                }
            }
        });

        return processedData;
    }, [data, showPrediction]);

    const groupedData = useMemo(() => {
        // Group by months from release
        const grouped = new Map<number, { [key: string]: number | boolean }>();

        adoptionData.forEach(point => {
            if (!grouped.has(point.monthsFromRelease)) {
                grouped.set(point.monthsFromRelease, {
                    monthsFromRelease: point.monthsFromRelease,
                });
            }

            const group = grouped.get(point.monthsFromRelease)!;
            const key = point.predicted ? `${point.gpuModel}_predicted` : point.gpuModel;
            group[key] = point.marketShare;
        });

        return Array.from(grouped.values()).sort(
            (a, b) => (a.monthsFromRelease as number) - (b.monthsFromRelease as number)
        );
    }, [adoptionData]);

    const getGPUsSeries = useMemo(() => {
        const series = new Set<string>();
        adoptionData.forEach(point => {
            series.add(point.gpuModel);
        });
        return Array.from(series);
    }, [adoptionData]);

    const getSeriesColor = (gpuModel: string) => {
        // Determine series based on GPU model
        if (gpuModel.includes('RTX 40') || gpuModel.includes('RTX 50'))
            return CURVE_COLORS['RTX 40'];
        if (gpuModel.includes('RTX 30')) return CURVE_COLORS['RTX 30'];
        if (gpuModel.includes('RTX 20')) return CURVE_COLORS['RTX 20'];
        if (gpuModel.includes('RX 7') || gpuModel.includes('RX 9')) return CURVE_COLORS['RX 7000'];
        if (gpuModel.includes('RX 6')) return CURVE_COLORS['RX 6000'];
        return CURVE_COLORS['default'];
    };

    const formatTooltip = (value: number, name: string) => {
        const isPredicted = name.includes('_predicted');
        const gpuName = isPredicted ? name.replace('_predicted', '') : name;
        const label = isPredicted ? `${gpuName} (Predicted)` : gpuName;
        return [`${Number(value).toFixed(2)}%`, label];
    };

    const milestoneMonths = [3, 6, 12, 24, 36]; // Common adoption milestones

    return (
        <div className="w-full h-96 p-4">
            <div className="mb-4 flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Focus GPU:</label>
                    <select
                        value={selectedGPU || ''}
                        onChange={e => onGPUSelect && onGPUSelect(e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                    >
                        <option value="">All GPUs</option>
                        {getGPUsSeries.map(gpu => (
                            <option key={gpu} value={gpu}>
                                {gpu}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={showPrediction}
                        onChange={() => {
                            // This would need to be handled by parent component
                        }}
                        className="rounded"
                    />
                    <label className="text-sm font-medium">Show Predictions</label>
                </div>
            </div>

            <div className="mb-4">
                <div className="text-sm text-gray-600">
                    <p>This chart shows GPU adoption rates over time since release.</p>
                    <p>X-axis: Months from release date | Y-axis: Market share percentage</p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={groupedData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                        dataKey="monthsFromRelease"
                        label={{
                            value: 'Months from Release',
                            position: 'insideBottom',
                            offset: -10,
                        }}
                        stroke="#666"
                    />
                    <YAxis
                        label={{ value: 'Market Share (%)', angle: -90, position: 'insideLeft' }}
                        stroke="#666"
                    />
                    <Tooltip
                        formatter={formatTooltip}
                        labelFormatter={label => `${label} months from release`}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                    />

                    {/* Milestone reference lines */}
                    {milestoneMonths.map(month => (
                        <ReferenceLine
                            key={month}
                            x={month}
                            stroke="#ddd"
                            strokeDasharray="2 2"
                            label={{ value: `${month}m`, position: 'top' }}
                        />
                    ))}

                    {/* Render lines for each GPU */}
                    {getGPUsSeries.map(gpu => {
                        if (selectedGPU && selectedGPU !== gpu) return null;

                        return (
                            <Line
                                key={gpu}
                                type="monotone"
                                dataKey={gpu}
                                stroke={getSeriesColor(gpu)}
                                strokeWidth={hoveredCurve === gpu ? 3 : 2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 5 }}
                                connectNulls={false}
                                onMouseEnter={() => setHoveredCurve(gpu)}
                                onMouseLeave={() => setHoveredCurve(null)}
                            />
                        );
                    })}

                    {/* Render prediction lines if enabled */}
                    {showPrediction &&
                        getGPUsSeries.map(gpu => {
                            if (selectedGPU && selectedGPU !== gpu) return null;

                            return (
                                <Line
                                    key={`${gpu}_predicted`}
                                    type="monotone"
                                    dataKey={`${gpu}_predicted`}
                                    stroke={getSeriesColor(gpu)}
                                    strokeWidth={1}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    activeDot={{ r: 3 }}
                                    connectNulls={false}
                                />
                            );
                        })}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
