import { NextResponse } from 'next/server';
import { MockDataGenerator } from '@/lib/data-processor/mock-data';
import { clusterUserProfiles } from '@/lib/algorithms/clustering';
import { detectMarketTrends } from '@/lib/algorithms/trend-detection';
import { AnalysisData } from '@/types/analysis';

export async function GET() {
    try {
        const mockData = MockDataGenerator.generateHardwareSurveyData(12);
        const marketShareData = mockData.flatMap(entry => entry.gpuDistribution);

        const clusters = clusterUserProfiles(mockData);
        const trends = detectMarketTrends(marketShareData);

        const analysisData: AnalysisData = {
            trends,
            bottlenecks: [], // Will be populated by bottleneck endpoint
            predictions: [], // Will be populated by prediction endpoint
            insights: [
                {
                    title: 'Market Leader',
                    description: `${trends.marketLeader.model} dominates with ${trends.marketLeader.marketShare.toFixed(1)}% market share`,
                    metric: `${trends.marketLeader.marketShare.toFixed(1)}%`,
                    trend: 'stable',
                    confidence: 0.9,
                    timeframe: trends.timeframe,
                },
                {
                    title: 'Fastest Growing GPU',
                    description: `${trends.fastestGrowth.model} showing strongest growth trend`,
                    metric: `+${(trends.fastestGrowth.growthRate * 100).toFixed(1)}%`,
                    trend: 'up',
                    confidence: 0.8,
                    timeframe: trends.timeframe,
                },
                {
                    title: 'User Segments',
                    description: `${clusters.length} distinct user profiles identified`,
                    metric: clusters.length,
                    trend: 'stable',
                    confidence: 0.95,
                    timeframe: 'Current analysis',
                },
            ],
            lastUpdated: new Date(),
        };

        return NextResponse.json({
            message: 'Comprehensive hardware analysis',
            status: 'available',
            phase: 'analysis-engine',
            data: analysisData,
            user_clusters: clusters,
            metadata: {
                data_points: marketShareData.length,
                analysis_date: new Date().toISOString(),
                cluster_count: clusters.length,
            },
        });
    } catch (error) {
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Analysis API error:', error);
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
