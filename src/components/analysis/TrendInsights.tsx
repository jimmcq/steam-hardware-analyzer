'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Zap, Users, Award, AlertTriangle } from 'lucide-react';
import { AnalysisData } from '@/types';

interface TrendInsightsProps {
    data: AnalysisData;
    timeframe?: 'month' | 'quarter' | 'year';
}

interface InsightCardProps {
    title: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    description?: string;
    icon?: React.ReactNode;
    severity?: 'info' | 'warning' | 'success' | 'error';
}

function InsightCard({
    title,
    value,
    trend,
    trendValue,
    description,
    icon,
    severity = 'info',
}: InsightCardProps) {
    const trendIcon =
        trend === 'up' ? (
            <TrendingUp className="w-4 h-4" />
        ) : trend === 'down' ? (
            <TrendingDown className="w-4 h-4" />
        ) : null;

    const trendColor =
        trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

    const cardColor = {
        info: 'border-blue-200 bg-blue-50',
        warning: 'border-yellow-200 bg-yellow-50',
        success: 'border-green-200 bg-green-50',
        error: 'border-red-200 bg-red-50',
    };

    return (
        <div
            className={`p-4 rounded-lg border-2 ${cardColor[severity]} transition-all hover:shadow-md`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="text-sm font-medium text-gray-700">{title}</h3>
                </div>
                {trendIcon && (
                    <div className={`flex items-center gap-1 ${trendColor}`}>
                        {trendIcon}
                        {trendValue && <span className="text-xs font-medium">{trendValue}</span>}
                    </div>
                )}
            </div>
            <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
            </div>
            {description && <p className="text-sm text-gray-600">{description}</p>}
        </div>
    );
}

export function TrendInsights({ data, timeframe = 'quarter' }: TrendInsightsProps) {
    const insights = useMemo(() => {
        if (!data) return [];

        const results = [];

        // Fastest Growing GPU
        if (data.fastestGrowingGPU) {
            results.push({
                title: 'Fastest Growing GPU',
                value: data.fastestGrowingGPU.model,
                trend: 'up' as const,
                trendValue: `+${data.fastestGrowingGPU.growthRate.toFixed(1)}%`,
                description: `Market share increased by ${data.fastestGrowingGPU.growthRate.toFixed(1)}% this ${timeframe}`,
                icon: <TrendingUp className="w-4 h-4 text-green-600" />,
                severity: 'success' as const,
            });
        }

        // Declining GPU
        if (data.decliningGPU) {
            results.push({
                title: 'Steepest Decline',
                value: data.decliningGPU.model,
                trend: 'down' as const,
                trendValue: `${data.decliningGPU.declineRate.toFixed(1)}%`,
                description: `Market share decreased by ${Math.abs(data.decliningGPU.declineRate).toFixed(1)}% this ${timeframe}`,
                icon: <TrendingDown className="w-4 h-4 text-red-600" />,
                severity: 'error' as const,
            });
        }

        // Most Popular GPU
        if (data.mostPopularGPU) {
            results.push({
                title: 'Market Leader',
                value: data.mostPopularGPU.model,
                trend: 'neutral' as const,
                trendValue: `${data.mostPopularGPU.marketShare.toFixed(1)}%`,
                description: `Currently holds ${data.mostPopularGPU.marketShare.toFixed(1)}% of the market`,
                icon: <Award className="w-4 h-4 text-blue-600" />,
                severity: 'info' as const,
            });
        }

        // Most Common Bottleneck
        if (data.commonBottleneck) {
            results.push({
                title: 'Common Bottleneck',
                value: data.commonBottleneck.type,
                trend: 'neutral' as const,
                trendValue: `${data.commonBottleneck.percentage.toFixed(1)}%`,
                description: `Affects ${data.commonBottleneck.percentage.toFixed(1)}% of gaming setups`,
                icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
                severity: 'warning' as const,
            });
        }

        // Performance Leader
        if (data.performanceLeader) {
            results.push({
                title: 'Performance Champion',
                value: data.performanceLeader.model,
                trend: 'neutral' as const,
                trendValue: `${data.performanceLeader.score}`,
                description: `Highest performance score of ${data.performanceLeader.score}`,
                icon: <Zap className="w-4 h-4 text-purple-600" />,
                severity: 'info' as const,
            });
        }

        // Adoption Rate
        if (data.adoptionRate) {
            results.push({
                title: 'New GPU Adoption',
                value: `${data.adoptionRate.rate.toFixed(1)}%`,
                trend: data.adoptionRate.trend,
                trendValue: data.adoptionRate.change
                    ? `${data.adoptionRate.change > 0 ? '+' : ''}${data.adoptionRate.change.toFixed(1)}%`
                    : undefined,
                description: `Users upgrading to newer GPUs this ${timeframe}`,
                icon: <Users className="w-4 h-4 text-indigo-600" />,
                severity: 'info' as const,
            });
        }

        return results;
    }, [data, timeframe]);

    if (!data || insights.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <div className="text-lg font-medium mb-2">No insights available</div>
                <p>Analysis data is being processed...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Market Insights</h2>
                <p className="text-gray-600">
                    Key trends and patterns in GPU adoption for the current {timeframe}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {insights.map(insight => (
                    <InsightCard key={insight.title} {...insight} />
                ))}
            </div>

            {/* Additional Analysis Summary */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Analysis Summary</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Market Dynamics</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• {data.totalGPUs || 0} GPU models tracked</li>
                            <li>• {data.activeManufacturers || 0} active manufacturers</li>
                            <li>
                                •{' '}
                                {data.marketVolatility
                                    ? `${data.marketVolatility.toFixed(1)}% volatility`
                                    : 'Market volatility: N/A'}
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Performance Trends</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>
                                • Average performance score:{' '}
                                {data.averagePerformance?.toFixed(1) || 'N/A'}
                            </li>
                            <li>
                                • Performance improvement:{' '}
                                {data.performanceGrowth
                                    ? `+${data.performanceGrowth.toFixed(1)}%`
                                    : 'N/A'}
                            </li>
                            <li>• VRAM trend: {data.vramTrend || 'Steady increase'}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
