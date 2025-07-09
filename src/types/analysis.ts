import { GPUData, CPUData, UserCluster } from './hardware';
import { GameRequirements } from './steam-data';

export interface TrendAnalysis {
    timeframe: string;
    growing: string[];
    declining: string[];
    stable: string[];
    fastestGrowth: {
        model: string;
        growthRate: number;
    };
    fastestDecline: {
        model: string;
        declineRate: number;
    };
    marketLeader: {
        model: string;
        marketShare: number;
    };
}

export interface BottleneckAnalysis {
    configuration: {
        gpu: GPUData;
        cpu: CPUData;
    };
    targetGame: GameRequirements;
    bottleneckType: 'GPU' | 'CPU' | 'Memory' | 'None';
    performanceScore: number;
    expectedFPS: number;
    recommendations: string[];
    upgradeOptions: {
        component: 'GPU' | 'CPU' | 'Memory';
        suggestions: string[];
        expectedImprovement: number;
    }[];
}

export interface UpgradePrediction {
    currentProfile: UserCluster;
    likelyUpgrades: {
        component: 'GPU' | 'CPU';
        targetModels: string[];
        probability: number;
        timeframe: string;
    }[];
    marketTrends: {
        risingPopularity: string[];
        decliningPopularity: string[];
    };
}

export interface PerformanceInsight {
    title: string;
    description: string;
    metric: string | number;
    trend: 'up' | 'down' | 'stable';
    confidence: number;
    timeframe: string;
}

export interface AnalysisData {
    trends: TrendAnalysis;
    bottlenecks: BottleneckAnalysis[];
    predictions: UpgradePrediction[];
    insights: PerformanceInsight[];
    lastUpdated: Date;
}
