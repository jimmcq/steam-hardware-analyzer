'use client';

import { useState, useMemo } from 'react';
import {
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import { GPUData } from '@/types';

interface PerformanceScatterProps {
    data: GPUData[];
    xMetric?: 'performanceScore' | 'vram' | 'releaseDate';
    yMetric?: 'marketShare' | 'performanceScore';
    colorBy?: 'manufacturer' | 'tier';
    onGPUClick?: (gpu: GPUData) => void;
}

interface ScatterDataPoint {
    x: number;
    y: number;
    z: number; // bubble size
    gpu: GPUData;
    label: string;
}

const MANUFACTURER_COLORS = {
    NVIDIA: '#76B900',
    AMD: '#ED1C24',
    Intel: '#0071C5',
};

const TIER_COLORS = {
    Entry: '#94a3b8',
    'Mid-Range': '#3b82f6',
    'High-End': '#f59e0b',
    Enthusiast: '#ef4444',
};

export function PerformanceScatter({
    data,
    xMetric = 'performanceScore',
    yMetric = 'marketShare',
    colorBy = 'manufacturer',
    onGPUClick,
}: PerformanceScatterProps) {
    const [hoveredGPU, setHoveredGPU] = useState<string | null>(null);

    const scatterData = useMemo(() => {
        if (!data || data.length === 0) return [];

        return data.map(gpu => {
            let x: number, y: number;
            const z: number = Math.max(gpu.vram * 2, 20); // Minimum size 20

            // Calculate X value
            switch (xMetric) {
                case 'performanceScore':
                    x = gpu.performanceScore;
                    break;
                case 'vram':
                    x = gpu.vram;
                    break;
                case 'releaseDate':
                    x = gpu.releaseDate.getTime();
                    break;
                default:
                    x = gpu.performanceScore;
            }

            // Calculate Y value
            switch (yMetric) {
                case 'marketShare':
                    const avgMarketShare =
                        gpu.marketShare.length > 0
                            ? gpu.marketShare.reduce((sum, point) => sum + point.value, 0) /
                              gpu.marketShare.length
                            : 0;
                    y = avgMarketShare;
                    break;
                case 'performanceScore':
                    y = gpu.performanceScore;
                    break;
                default:
                    y = gpu.performanceScore;
            }

            return {
                x,
                y,
                z,
                gpu,
                label: gpu.model,
            };
        });
    }, [data, xMetric, yMetric]);

    const getColor = (dataPoint: ScatterDataPoint) => {
        if (colorBy === 'manufacturer') {
            return MANUFACTURER_COLORS[dataPoint.gpu.manufacturer] || '#64748b';
        } else {
            return TIER_COLORS[dataPoint.gpu.tier] || '#64748b';
        }
    };

    const formatXAxisLabel = (value: number) => {
        if (xMetric === 'releaseDate') {
            return new Date(value).getFullYear().toString();
        }
        return value.toString();
    };

    const formatTooltip = (
        _value: unknown,
        _name: string,
        props: { payload: ScatterDataPoint }
    ) => {
        const dataPoint = props.payload as ScatterDataPoint;
        if (!dataPoint) return null;

        const gpu = dataPoint.gpu;

        return (
            <div className="bg-white p-3 border rounded-lg shadow-lg">
                <div className="font-semibold text-lg mb-2">{gpu.model}</div>
                <div className="space-y-1 text-sm">
                    <div>
                        Manufacturer: <span className="font-medium">{gpu.manufacturer}</span>
                    </div>
                    <div>
                        Tier: <span className="font-medium">{gpu.tier}</span>
                    </div>
                    <div>
                        Performance Score:{' '}
                        <span className="font-medium">{gpu.performanceScore}</span>
                    </div>
                    <div>
                        VRAM: <span className="font-medium">{gpu.vram}GB</span>
                    </div>
                    <div>
                        Release Date:{' '}
                        <span className="font-medium">{gpu.releaseDate.toLocaleDateString()}</span>
                    </div>
                    {gpu.marketShare.length > 0 && (
                        <div>
                            Avg Market Share:{' '}
                            <span className="font-medium">
                                {(
                                    gpu.marketShare.reduce((sum, point) => sum + point.value, 0) /
                                    gpu.marketShare.length
                                ).toFixed(2)}
                                %
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const getAxisLabel = (metric: string) => {
        switch (metric) {
            case 'performanceScore':
                return 'Performance Score';
            case 'vram':
                return 'VRAM (GB)';
            case 'releaseDate':
                return 'Release Year';
            case 'marketShare':
                return 'Market Share (%)';
            default:
                return metric;
        }
    };

    const legendData = useMemo(() => {
        if (colorBy === 'manufacturer') {
            return Object.entries(MANUFACTURER_COLORS).map(([key, color]) => ({
                value: key,
                color,
            }));
        } else {
            return Object.entries(TIER_COLORS).map(([key, color]) => ({
                value: key,
                color,
            }));
        }
    }, [colorBy]);

    return (
        <div className="w-full h-96 p-4">
            <div className="mb-4 flex flex-wrap gap-4">
                <div className="flex gap-2">
                    <label className="text-sm font-medium">X-Axis:</label>
                    <select
                        value={xMetric}
                        onChange={() => {
                            // This would need to be handled by parent component
                        }}
                        className="text-sm border rounded px-2 py-1"
                    >
                        <option value="performanceScore">Performance Score</option>
                        <option value="vram">VRAM (GB)</option>
                        <option value="releaseDate">Release Date</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <label className="text-sm font-medium">Y-Axis:</label>
                    <select
                        value={yMetric}
                        onChange={() => {
                            // This would need to be handled by parent component
                        }}
                        className="text-sm border rounded px-2 py-1"
                    >
                        <option value="marketShare">Market Share</option>
                        <option value="performanceScore">Performance Score</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <label className="text-sm font-medium">Color By:</label>
                    <select
                        value={colorBy}
                        onChange={() => {
                            // This would need to be handled by parent component
                        }}
                        className="text-sm border rounded px-2 py-1"
                    >
                        <option value="manufacturer">Manufacturer</option>
                        <option value="tier">Performance Tier</option>
                    </select>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex flex-wrap gap-4">
                    {legendData.map(({ value, color }) => (
                        <div key={value} className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-sm">{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                    data={scatterData}
                    margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis
                        type="number"
                        dataKey="x"
                        name={getAxisLabel(xMetric)}
                        tickFormatter={formatXAxisLabel}
                        label={{
                            value: getAxisLabel(xMetric),
                            position: 'insideBottom',
                            offset: -10,
                        }}
                        stroke="#666"
                    />
                    <YAxis
                        type="number"
                        dataKey="y"
                        name={getAxisLabel(yMetric)}
                        label={{
                            value: getAxisLabel(yMetric),
                            angle: -90,
                            position: 'insideLeft',
                        }}
                        stroke="#666"
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length > 0) {
                                return formatTooltip(
                                    null,
                                    '',
                                    payload[0]
                                ) as React.ReactElement | null;
                            }
                            return null;
                        }}
                    />
                    <Scatter
                        data={scatterData}
                        fill="#8884d8"
                        onClick={clickData => onGPUClick && onGPUClick(clickData.gpu)}
                        onMouseEnter={dataPoint => setHoveredGPU(dataPoint.gpu.model)}
                        onMouseLeave={() => setHoveredGPU(null)}
                        style={{ cursor: onGPUClick ? 'pointer' : 'default' }}
                    >
                        {scatterData.map(entry => (
                            <Cell
                                key={`cell-${entry.gpu.model}`}
                                fill={getColor(entry)}
                                stroke={hoveredGPU === entry.gpu.model ? '#000' : 'none'}
                                strokeWidth={hoveredGPU === entry.gpu.model ? 2 : 0}
                                r={entry.z}
                            />
                        ))}
                    </Scatter>
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
}
