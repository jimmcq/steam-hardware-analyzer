'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MarketShareChart } from '@/components/charts/MarketShareChart';
import { PerformanceScatter } from '@/components/charts/PerformanceScatter';
import { AdoptionCurve } from '@/components/charts/AdoptionCurve';
import { TrendInsights } from '@/components/analysis/TrendInsights';
import { GPUDatabase } from '@/lib/gpu-database/specifications';
import { GPUData, AnalysisData, TimeSeriesData } from '@/types';

// Mock data generator for demonstration
function generateMockMarketShareData(gpu: GPUData): TimeSeriesData[] {
    const data: TimeSeriesData[] = [];
    const startDate = new Date(gpu.releaseDate);
    const endDate = new Date();

    // Generate monthly data points
    const currentDate = new Date(startDate);
    let baseShare = Math.random() * 15; // Base market share

    while (currentDate <= endDate) {
        // Add some realistic variance
        const variance = (Math.random() - 0.5) * 2;
        const timeEffect = Math.min(
            (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365),
            2
        );

        // Newer, higher-performance GPUs tend to have higher shares
        const performanceMultiplier =
            gpu.performanceScore > 80 ? 1.5 : gpu.performanceScore > 60 ? 1.2 : 1.0;

        baseShare = Math.max(0, baseShare + variance + timeEffect * 0.5 * performanceMultiplier);

        data.push({
            date: new Date(currentDate),
            value: Math.min(baseShare, 25), // Cap at 25%
        });

        // Move to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return data;
}

function generateMockAnalysisData(gpuData: GPUData[]): AnalysisData {
    // Find fastest growing GPU (mock calculation)
    const fastestGrowingGPU = gpuData
        .filter(gpu => gpu.marketShare.length > 0)
        .map(gpu => ({
            model: gpu.model,
            growthRate: Math.random() * 15 + 2, // 2-17% growth
        }))
        .sort((a, b) => b.growthRate - a.growthRate)[0];

    // Find declining GPU
    const decliningGPU = gpuData
        .filter(gpu => gpu.releaseDate < new Date('2023-01-01'))
        .map(gpu => ({
            model: gpu.model,
            declineRate: -(Math.random() * 8 + 1), // -1 to -9% decline
        }))
        .sort((a, b) => a.declineRate - b.declineRate)[0];

    // Find most popular GPU
    const mostPopularGPU = gpuData
        .map(gpu => ({
            model: gpu.model,
            marketShare:
                gpu.marketShare.length > 0
                    ? gpu.marketShare.reduce((sum, point) => sum + point.value, 0) /
                      gpu.marketShare.length
                    : Math.random() * 20,
        }))
        .sort((a, b) => b.marketShare - a.marketShare)[0];

    return {
        fastestGrowingGPU,
        decliningGPU,
        mostPopularGPU,
        commonBottleneck: {
            type: 'GPU',
            percentage: 35.2,
        },
        performanceLeader: {
            model: 'RTX 5090',
            score: 150,
        },
        adoptionRate: {
            rate: 12.5,
            trend: 'up',
            change: 2.3,
        },
        totalGPUs: gpuData.length,
        activeManufacturers: 3,
        marketVolatility: 8.7,
        averagePerformance:
            gpuData.reduce((sum, gpu) => sum + gpu.performanceScore, 0) / gpuData.length,
        performanceGrowth: 15.2,
        vramTrend: 'Increasing - average 12GB in new releases',
    };
}

export default function Dashboard() {
    const [gpuData, setGpuData] = useState<GPUData[]>([]);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [selectedGPUs, setSelectedGPUs] = useState<string[]>([]);
    const [timeRange, setTimeRange] = useState<{ start: Date; end: Date } | undefined>();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // Initialize GPU data
        const allGPUs = GPUDatabase.getAllGPUs();

        // Generate mock market share data for each GPU
        const gpusWithMarketShare = allGPUs.map(gpu => ({
            ...gpu,
            marketShare: generateMockMarketShareData(gpu),
        }));

        setGpuData(gpusWithMarketShare);
        setAnalysisData(generateMockAnalysisData(gpusWithMarketShare));
        setMounted(true);
    }, []);

    const handleGPUToggle = (gpuModel: string) => {
        setSelectedGPUs(prev =>
            prev.includes(gpuModel) ? prev.filter(gpu => gpu !== gpuModel) : [...prev, gpuModel]
        );
    };

    const handleTimeRangeChange = (range: string) => {
        const end = new Date();
        let start: Date;

        switch (range) {
            case '6months':
                start = new Date(end.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
                break;
            case '1year':
                start = new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            case '2years':
                start = new Date(end.getTime() - 2 * 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                setTimeRange(undefined);
                return;
        }

        setTimeRange({ start, end });
    };

    if (!mounted) {
        return null; // Prevent hydration mismatch
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Hardware Analysis Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Interactive visualization of Steam Hardware Survey data
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                ← Back to Home
                            </Link>
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Time Range:
                                </label>
                                <select
                                    onChange={e => handleTimeRangeChange(e.target.value)}
                                    className="text-sm border rounded px-2 py-1"
                                >
                                    <option value="all">All Time</option>
                                    <option value="2years">Last 2 Years</option>
                                    <option value="1year">Last Year</option>
                                    <option value="6months">Last 6 Months</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Insights Section */}
                {analysisData && (
                    <section className="mb-8">
                        <TrendInsights data={analysisData} timeframe="quarter" />
                    </section>
                )}

                {/* Charts Grid */}
                <div className="grid gap-8">
                    {/* Market Share Chart */}
                    <section className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                GPU Market Share Timeline
                            </h2>
                            <p className="text-gray-600">
                                Track market share evolution for different GPU models over time
                            </p>
                        </div>
                        <MarketShareChart
                            data={gpuData}
                            timeRange={timeRange}
                            selectedGPUs={selectedGPUs}
                            onGPUToggle={handleGPUToggle}
                        />
                    </section>

                    {/* Performance Scatter Plot */}
                    <section className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Performance vs Market Share
                            </h2>
                            <p className="text-gray-600">
                                Explore the relationship between GPU performance and market adoption
                            </p>
                        </div>
                        <PerformanceScatter
                            data={gpuData}
                            xMetric="performanceScore"
                            yMetric="marketShare"
                            colorBy="manufacturer"
                        />
                    </section>

                    {/* Adoption Curve */}
                    <section className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                GPU Adoption Curves
                            </h2>
                            <p className="text-gray-600">
                                Analyze how quickly different GPUs gain market share after release
                            </p>
                        </div>
                        <AdoptionCurve data={gpuData} showPrediction={true} />
                    </section>
                </div>

                {/* Navigation to Other Tools */}
                <section className="mt-8 bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Additional Analysis Tools
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <a
                            href="/analysis"
                            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Bottleneck Detector
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Analyze your hardware setup for potential performance bottlenecks
                            </p>
                        </a>
                        <a
                            href="/trends"
                            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <h3 className="font-semibold text-gray-900 mb-2">Market Trends</h3>
                            <p className="text-gray-600 text-sm">
                                Deep dive into market trends and upgrade predictions
                            </p>
                        </a>
                    </div>
                </section>
            </main>
        </div>
    );
}
