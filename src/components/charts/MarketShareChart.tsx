'use client';

import { useState, useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Brush,
} from 'recharts';
import { GPUData } from '@/types';

interface MarketShareChartProps {
    data: GPUData[];
    timeRange?: { start: Date; end: Date };
    selectedGPUs?: string[];
    onGPUToggle?: (gpuModel: string) => void;
}

interface ChartDataPoint {
    date: string;
    [key: string]: string | number;
}

const COLORS = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7c7c',
    '#8dd1e1',
    '#d084d0',
    '#ffb347',
    '#87ceeb',
    '#dda0dd',
    '#98fb98',
];

export function MarketShareChart({
    data,
    timeRange,
    selectedGPUs = [],
    onGPUToggle,
}: MarketShareChartProps) {
    const [hoveredGPU, setHoveredGPU] = useState<string | null>(null);

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Get all unique dates across all GPUs
        const allDates = new Set<string>();
        data.forEach(gpu => {
            gpu.marketShare.forEach(point => {
                allDates.add(point.date.toISOString().split('T')[0]);
            });
        });

        const sortedDates = Array.from(allDates).sort();

        // Filter by time range if provided
        const filteredDates = timeRange
            ? sortedDates.filter(date => {
                  const d = new Date(date);
                  return d >= timeRange.start && d <= timeRange.end;
              })
            : sortedDates;

        // Create chart data structure
        return filteredDates.map(date => {
            const dataPoint: ChartDataPoint = { date };

            data.forEach(gpu => {
                const sharePoint = gpu.marketShare.find(
                    point => point.date.toISOString().split('T')[0] === date
                );
                dataPoint[gpu.model] = sharePoint?.value || 0;
            });

            return dataPoint;
        });
    }, [data, timeRange]);

    const visibleGPUs = useMemo(() => {
        if (selectedGPUs.length === 0) {
            // Show top 5 GPUs by average market share if none selected
            return data
                .map(gpu => ({
                    model: gpu.model,
                    avgShare:
                        gpu.marketShare.reduce((sum, point) => sum + point.value, 0) /
                        gpu.marketShare.length,
                }))
                .sort((a, b) => b.avgShare - a.avgShare)
                .slice(0, 5)
                .map(gpu => gpu.model);
        }
        return selectedGPUs;
    }, [data, selectedGPUs]);

    const handleLegendClick = (legendData: { value?: string }) => {
        if (onGPUToggle && legendData.value) {
            onGPUToggle(legendData.value);
        }
    };

    const formatTooltip = (value: number, name: string) => {
        return [`${Number(value).toFixed(2)}%`, name];
    };

    const formatXAxisLabel = (tickItem: string) => {
        return new Date(tickItem).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="w-full h-96 p-4">
            <div className="mb-4 flex flex-wrap gap-2">
                {data.map((gpu, index) => (
                    <button
                        key={gpu.model}
                        onClick={() => onGPUToggle && onGPUToggle(gpu.model)}
                        onMouseEnter={() => setHoveredGPU(gpu.model)}
                        onMouseLeave={() => setHoveredGPU(null)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-2 transition-all ${
                            visibleGPUs.includes(gpu.model)
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400'
                        } ${hoveredGPU === gpu.model ? 'scale-105' : ''}`}
                        style={{
                            backgroundColor: visibleGPUs.includes(gpu.model)
                                ? COLORS[index % COLORS.length]
                                : undefined,
                        }}
                    >
                        {gpu.model}
                    </button>
                ))}
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatXAxisLabel}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        stroke="#666"
                    />
                    <YAxis
                        label={{ value: 'Market Share (%)', angle: -90, position: 'insideLeft' }}
                        stroke="#666"
                    />
                    <Tooltip
                        formatter={formatTooltip}
                        labelFormatter={label => `Date: ${formatXAxisLabel(label)}`}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                        }}
                    />
                    <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer' }} />

                    {visibleGPUs.map((gpuModel, index) => (
                        <Line
                            key={gpuModel}
                            type="monotone"
                            dataKey={gpuModel}
                            stroke={COLORS[index % COLORS.length]}
                            strokeWidth={hoveredGPU === gpuModel ? 3 : 2}
                            dot={false}
                            activeDot={{ r: 6 }}
                            connectNulls={false}
                        />
                    ))}

                    <Brush
                        dataKey="date"
                        height={30}
                        stroke="#8884d8"
                        tickFormatter={formatXAxisLabel}
                        onChange={() => {
                            // Brush change handling would be implemented here
                        }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
