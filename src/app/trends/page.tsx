'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MarketShareChart } from '@/components/charts/MarketShareChart';
import { PerformanceScatter } from '@/components/charts/PerformanceScatter';
import { AdoptionCurve } from '@/components/charts/AdoptionCurve';
import { TrendInsights } from '@/components/analysis/TrendInsights';
import { GPUDatabase } from '@/lib/gpu-database/specifications';
import { GPUData, AnalysisData, TimeSeriesData } from '@/types';

// Enhanced mock data generator for market trends
function generateDetailedMarketShareData(gpu: GPUData): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    const startDate = new Date(
        Math.max(gpu.releaseDate.getTime(), new Date('2020-01-01').getTime())
    );
    const endDate = new Date();

    const currentDate = new Date(startDate);
    let baseShare = 0;

    // Different adoption patterns based on GPU tier and manufacturer
    const adoptionPattern = {
        Entry: { maxShare: 8, growthRate: 0.3 },
        'Mid-Range': { maxShare: 15, growthRate: 0.5 },
        'High-End': { maxShare: 12, growthRate: 0.4 },
        Enthusiast: { maxShare: 6, growthRate: 0.2 },
    };

    const pattern = adoptionPattern[gpu.tier];
    const isNVIDIA = gpu.manufacturer === 'NVIDIA';

    while (currentDate <= endDate) {
        const monthsFromRelease =
            (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);

        // Logistic growth curve
        const growthFactor =
            pattern.maxShare / (1 + Math.exp(-pattern.growthRate * (monthsFromRelease - 6)));

        // Market dynamics
        const nvidiaBias = isNVIDIA ? 1.2 : 0.9; // NVIDIA typically has higher adoption
        const seasonality = 1 + 0.1 * Math.sin((monthsFromRelease / 12) * 2 * Math.PI); // Annual cycles
        const randomVariance = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier

        baseShare = growthFactor * nvidiaBias * seasonality * randomVariance;

        // Decline for older GPUs
        if (monthsFromRelease > 24) {
            const declineRate = Math.max(0, 1 - (monthsFromRelease - 24) * 0.02);
            baseShare *= declineRate;
        }

        data.push({
            date: new Date(currentDate),
            value: Math.max(0, Math.min(baseShare, pattern.maxShare * 1.5)),
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return data;
}

function generateTrendAnalysisData(gpuData: GPUData[]): AnalysisData {
    // Calculate more realistic trend data
    const recentGPUs = gpuData.filter(gpu => gpu.releaseDate > new Date('2022-01-01'));
    const legacyGPUs = gpuData.filter(gpu => gpu.releaseDate < new Date('2021-01-01'));

    // Find fastest growing (recent releases with good performance)
    const fastestGrowingGPU = recentGPUs
        .filter(gpu => gpu.tier === 'Mid-Range' || gpu.tier === 'High-End')
        .map(gpu => ({
            model: gpu.model,
            growthRate: gpu.performanceScore > 70 ? Math.random() * 8 + 5 : Math.random() * 5 + 2,
        }))
        .sort((a, b) => b.growthRate - a.growthRate)[0];

    // Find declining GPU (older models)
    const decliningGPU = legacyGPUs
        .map(gpu => ({
            model: gpu.model,
            declineRate: -(Math.random() * 6 + 2),
        }))
        .sort((a, b) => a.declineRate - b.declineRate)[0];

    // Most popular based on mid-range performance and good availability
    const mostPopularGPU = gpuData
        .filter(gpu => gpu.tier === 'Mid-Range' && gpu.performanceScore > 50)
        .map(gpu => ({
            model: gpu.model,
            marketShare: 8 + Math.random() * 12, // 8-20% range for popular mid-range
        }))
        .sort((a, b) => b.marketShare - a.marketShare)[0];

    return {
        fastestGrowingGPU,
        decliningGPU,
        mostPopularGPU,
        commonBottleneck: {
            type: 'VRAM',
            percentage: 42.7,
        },
        performanceLeader: {
            model:
                gpuData.find(
                    gpu =>
                        gpu.performanceScore === Math.max(...gpuData.map(g => g.performanceScore))
                )?.model || 'RTX 5090',
            score: Math.max(...gpuData.map(g => g.performanceScore)),
        },
        adoptionRate: {
            rate: 18.3,
            trend: 'up',
            change: 4.2,
        },
        totalGPUs: gpuData.length,
        activeManufacturers: 3,
        marketVolatility: 12.4,
        averagePerformance:
            gpuData.reduce((sum, gpu) => sum + gpu.performanceScore, 0) / gpuData.length,
        performanceGrowth: 22.8,
        vramTrend: 'Rapid increase - 16GB becoming standard for high-end',
    };
}

export default function Trends() {
    const [gpuData, setGpuData] = useState<GPUData[]>([]);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [selectedGPUs, setSelectedGPUs] = useState<string[]>([]);
    const [focusedManufacturer, setFocusedManufacturer] = useState<
        'All' | 'NVIDIA' | 'AMD' | 'Intel'
    >('All');
    const [chartType, setChartType] = useState<'timeline' | 'scatter' | 'adoption'>('timeline');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const allGPUs = GPUDatabase.getAllGPUs();

        // Generate more realistic market share data
        const gpusWithMarketShare = allGPUs.map(gpu => ({
            ...gpu,
            marketShare: generateDetailedMarketShareData(gpu),
        }));

        setGpuData(gpusWithMarketShare);
        setAnalysisData(generateTrendAnalysisData(gpusWithMarketShare));

        // Pre-select some interesting GPUs
        const preSelected = ['RTX 5090', 'RTX 4060', 'RX 9070 XT', 'RTX 3060'];
        setSelectedGPUs(preSelected.filter(gpu => allGPUs.some(g => g.model === gpu)));

        setMounted(true);
    }, []);

    const filteredGPUData = gpuData.filter(gpu => {
        if (focusedManufacturer === 'All') return true;
        return gpu.manufacturer === focusedManufacturer;
    });

    const handleGPUToggle = (gpuModel: string) => {
        setSelectedGPUs(prev =>
            prev.includes(gpuModel) ? prev.filter(gpu => gpu !== gpuModel) : [...prev, gpuModel]
        );
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Market Trends Analysis
                            </h1>
                            <p className="text-gray-600">
                                Deep dive into GPU market dynamics and trends
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                ← Back to Home
                            </Link>
                            <Link
                                href="/dashboard"
                                className="text-purple-600 hover:text-purple-800 font-medium"
                            >
                                View Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Controls */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Chart Type:</label>
                            <select
                                value={chartType}
                                onChange={e =>
                                    setChartType(
                                        e.target.value as 'timeline' | 'scatter' | 'adoption'
                                    )
                                }
                                className="text-sm border rounded px-3 py-1"
                            >
                                <option value="timeline">Market Share Timeline</option>
                                <option value="scatter">Performance Analysis</option>
                                <option value="adoption">Adoption Curves</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                Manufacturer:
                            </label>
                            <select
                                value={focusedManufacturer}
                                onChange={e =>
                                    setFocusedManufacturer(
                                        e.target.value as 'All' | 'NVIDIA' | 'AMD' | 'Intel'
                                    )
                                }
                                className="text-sm border rounded px-3 py-1"
                            >
                                <option value="All">All Manufacturers</option>
                                <option value="NVIDIA">NVIDIA</option>
                                <option value="AMD">AMD</option>
                                <option value="Intel">Intel</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Quick Select:</span>
                            <button
                                onClick={() =>
                                    setSelectedGPUs(
                                        ['RTX 5090', 'RTX 5080', 'RTX 5070'].filter(gpu =>
                                            gpuData.some(g => g.model === gpu)
                                        )
                                    )
                                }
                                className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                            >
                                RTX 50 Series
                            </button>
                            <button
                                onClick={() =>
                                    setSelectedGPUs(
                                        ['RX 9070 XT', 'RX 9070'].filter(gpu =>
                                            gpuData.some(g => g.model === gpu)
                                        )
                                    )
                                }
                                className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                            >
                                RX 9000 Series
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                {/* Market Insights */}
                {analysisData && (
                    <section className="mb-8">
                        <TrendInsights data={analysisData} timeframe="quarter" />
                    </section>
                )}

                {/* Main Chart Section */}
                <section className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                    {chartType === 'timeline' && (
                        <>
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Market Share Evolution
                                </h2>
                                <p className="text-gray-600">
                                    Track how GPU market share changes over time across different
                                    manufacturers and tiers
                                </p>
                            </div>
                            <MarketShareChart
                                data={filteredGPUData}
                                selectedGPUs={selectedGPUs}
                                onGPUToggle={handleGPUToggle}
                            />
                        </>
                    )}

                    {chartType === 'scatter' && (
                        <>
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Performance vs Market Position
                                </h2>
                                <p className="text-gray-600">
                                    Analyze the relationship between GPU performance metrics and
                                    market success
                                </p>
                            </div>
                            <PerformanceScatter
                                data={filteredGPUData}
                                xMetric="performanceScore"
                                yMetric="marketShare"
                                colorBy="manufacturer"
                            />
                        </>
                    )}

                    {chartType === 'adoption' && (
                        <>
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                    Adoption Rate Analysis
                                </h2>
                                <p className="text-gray-600">
                                    Compare how quickly different GPUs gain market share after their
                                    release
                                </p>
                            </div>
                            <AdoptionCurve data={filteredGPUData} showPrediction={true} />
                        </>
                    )}
                </section>

                {/* Market Statistics */}
                <section className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Manufacturer Distribution
                        </h3>
                        <div className="space-y-3">
                            {['NVIDIA', 'AMD', 'Intel'].map(manufacturer => {
                                const count = gpuData.filter(
                                    gpu => gpu.manufacturer === manufacturer
                                ).length;
                                const percentage = (count / gpuData.length) * 100;
                                return (
                                    <div
                                        key={manufacturer}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-sm font-medium">{manufacturer}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        manufacturer === 'NVIDIA'
                                                            ? 'bg-green-500'
                                                            : manufacturer === 'AMD'
                                                              ? 'bg-red-500'
                                                              : 'bg-blue-500'
                                                    }`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Performance Tiers
                        </h3>
                        <div className="space-y-3">
                            {['Enthusiast', 'High-End', 'Mid-Range', 'Entry'].map(tier => {
                                const count = gpuData.filter(gpu => gpu.tier === tier).length;
                                const percentage = (count / gpuData.length) * 100;
                                return (
                                    <div key={tier} className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{tier}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${
                                                        tier === 'Enthusiast'
                                                            ? 'bg-purple-500'
                                                            : tier === 'High-End'
                                                              ? 'bg-blue-500'
                                                              : tier === 'Mid-Range'
                                                                ? 'bg-green-500'
                                                                : 'bg-gray-500'
                                                    }`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Release Timeline
                        </h3>
                        <div className="space-y-3">
                            {['2025', '2024', '2023', '2022'].map(year => {
                                const count = gpuData.filter(
                                    gpu => gpu.releaseDate.getFullYear().toString() === year
                                ).length;
                                const percentage = count > 0 ? (count / gpuData.length) * 100 : 0;
                                return (
                                    <div key={year} className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{year}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="h-2 rounded-full bg-indigo-500"
                                                    style={{ width: `${Math.max(percentage, 5)}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">{count}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Analysis Notes */}
                <section className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Market Analysis Notes
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Current Trends</h4>
                            <ul className="space-y-1">
                                <li>• RTX 50 Series showing strong initial adoption</li>
                                <li>• AMD RX 9000 Series gaining traction in mid-range</li>
                                <li>• VRAM requirements increasing across all tiers</li>
                                <li>• Price-performance balance shifting toward higher tiers</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Market Dynamics</h4>
                            <ul className="space-y-1">
                                <li>• Mid-range GPUs (60-80 performance score) most popular</li>
                                <li>• Enthusiast tier limited by pricing and availability</li>
                                <li>• Entry-level market declining as requirements increase</li>
                                <li>• Ray tracing adoption driving architectural improvements</li>
                            </ul>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
