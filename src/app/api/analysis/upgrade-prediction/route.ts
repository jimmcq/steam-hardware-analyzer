import { NextResponse } from 'next/server';
import { MockDataGenerator } from '@/lib/data-processor/mock-data';
import { clusterUserProfiles } from '@/lib/algorithms/clustering';
import { detectMarketTrends } from '@/lib/algorithms/trend-detection';
import { UpgradePrediction } from '@/types/analysis';
import { UserCluster } from '@/types/hardware';
import { TrendAnalysis } from '@/types/analysis';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const clusterId = searchParams.get('cluster');

        const mockData = MockDataGenerator.generateHardwareSurveyData(12);
        const marketShareData = mockData.flatMap(entry => entry.gpuDistribution);
        const clusters = clusterUserProfiles(mockData);
        const trends = detectMarketTrends(marketShareData);

        let targetClusters = clusters;
        if (clusterId) {
            targetClusters = clusters.filter(cluster => cluster.id === clusterId);
        }

        const predictions: UpgradePrediction[] = targetClusters.map(cluster => ({
            currentProfile: cluster,
            likelyUpgrades: generateUpgradePredictions(cluster, trends),
            marketTrends: {
                risingPopularity: trends.growing.slice(0, 5),
                decliningPopularity: trends.declining.slice(0, 5),
            },
        }));

        return NextResponse.json({
            message: 'Upgrade predictions analysis',
            status: 'success',
            predictions,
            metadata: {
                total_clusters: clusters.length,
                analysis_date: new Date().toISOString(),
                prediction_horizon: '6-12 months',
                confidence_level: 'Medium-High',
            },
        });
    } catch (error) {
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Upgrade prediction error:', error);
        }
        return NextResponse.json(
            { error: 'Failed to generate upgrade predictions' },
            { status: 500 }
        );
    }
}

function generateUpgradePredictions(
    cluster: UserCluster,
    trends: TrendAnalysis
): UpgradePrediction['likelyUpgrades'] {
    const upgrades: UpgradePrediction['likelyUpgrades'] = [];

    if (cluster.avgPerformanceScore < 60) {
        upgrades.push({
            component: 'GPU',
            targetModels: trends.growing.slice(0, 3),
            probability: 0.75,
            timeframe: '3-6 months',
        });

        upgrades.push({
            component: 'CPU',
            targetModels: ['i7-13700K', 'Ryzen 7 7700X', 'i5-13600K'],
            probability: 0.45,
            timeframe: '6-12 months',
        });
    } else if (cluster.avgPerformanceScore < 80) {
        upgrades.push({
            component: 'GPU',
            targetModels: trends.growing
                .filter(gpu => gpu.includes('RTX 40') || gpu.includes('RX 7'))
                .slice(0, 3),
            probability: 0.55,
            timeframe: '6-12 months',
        });

        upgrades.push({
            component: 'CPU',
            targetModels: ['i9-13900K', 'Ryzen 9 7900X', 'i7-14700K'],
            probability: 0.25,
            timeframe: '12+ months',
        });
    } else {
        upgrades.push({
            component: 'GPU',
            targetModels: ['RTX 4090', 'RTX 4080 Super', 'RX 7900 XTX'],
            probability: 0.3,
            timeframe: '12+ months',
        });
    }

    return upgrades;
}
