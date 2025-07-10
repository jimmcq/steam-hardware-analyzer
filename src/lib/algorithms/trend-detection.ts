import { GPUMarketShare, TimeSeriesData } from '../../types/hardware';
import { TrendAnalysis } from '../../types/analysis';

export function detectMarketTrends(
    historical: GPUMarketShare[],
    window: number = 6
): TrendAnalysis {
    if (historical.length === 0) {
        return createEmptyTrendAnalysis();
    }

    const timeframe = calculateTimeframe(historical);
    const trendsByModel = analyzeModelTrends(historical, window);

    const growing = Object.entries(trendsByModel)
        .filter(([, trend]) => trend.direction === 'growing')
        .map(([model]) => model);

    const declining = Object.entries(trendsByModel)
        .filter(([, trend]) => trend.direction === 'declining')
        .map(([model]) => model);

    const stable = Object.entries(trendsByModel)
        .filter(([, trend]) => trend.direction === 'stable')
        .map(([model]) => model);

    const fastestGrowth = findFastestGrowth(trendsByModel);
    const fastestDecline = findFastestDecline(trendsByModel);
    const marketLeader = findMarketLeader(historical);

    return {
        timeframe,
        growing,
        declining,
        stable,
        fastestGrowth,
        fastestDecline,
        marketLeader,
    };
}

interface ModelTrend {
    direction: 'growing' | 'declining' | 'stable';
    rate: number;
    confidence: number;
    dataPoints: number;
}

function analyzeModelTrends(
    historical: GPUMarketShare[],
    window: number
): Record<string, ModelTrend> {
    const modelGroups = groupByModel(historical);
    const trends: Record<string, ModelTrend> = {};

    Object.entries(modelGroups).forEach(([model, dataPoints]) => {
        const sortedPoints = dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());

        if (sortedPoints.length < 2) {
            trends[model] = {
                direction: 'stable',
                rate: 0,
                confidence: 0,
                dataPoints: sortedPoints.length,
            };
            return;
        }

        const movingAverages = calculateMovingAverages(sortedPoints, window);
        const trendSlope = calculateTrendSlope(movingAverages);
        const confidence = calculateTrendConfidence(sortedPoints, trendSlope);

        trends[model] = {
            direction: determineTrendDirection(trendSlope),
            rate: Math.abs(trendSlope),
            confidence,
            dataPoints: sortedPoints.length,
        };
    });

    return trends;
}

function groupByModel(historical: GPUMarketShare[]): Record<string, GPUMarketShare[]> {
    return historical.reduce(
        (groups, entry) => {
            const model = entry.gpuModel;
            if (!groups[model]) {
                groups[model] = [];
            }
            groups[model].push(entry);
            return groups;
        },
        {} as Record<string, GPUMarketShare[]>
    );
}

function calculateMovingAverages(dataPoints: GPUMarketShare[], window: number): TimeSeriesData[] {
    const averages: TimeSeriesData[] = [];

    for (let i = window - 1; i < dataPoints.length; i++) {
        const windowData = dataPoints.slice(i - window + 1, i + 1);
        const average = windowData.reduce((sum, point) => sum + point.percentage, 0) / window;

        averages.push({
            date: dataPoints[i].date,
            value: average,
        });
    }

    return averages;
}

function calculateTrendSlope(movingAverages: TimeSeriesData[]): number {
    if (movingAverages.length < 2) return 0;

    const n = movingAverages.length;
    const xValues = movingAverages.map((_, index) => index);
    const yValues = movingAverages.map(point => point.value);

    const sumX = xValues.reduce((sum, x) => sum + x, 0);
    const sumY = yValues.reduce((sum, y) => sum + y, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);

    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) return 0;

    const slope = (n * sumXY - sumX * sumY) / denominator;
    return isNaN(slope) ? 0 : slope;
}

function calculateTrendConfidence(dataPoints: GPUMarketShare[], slope: number): number {
    if (dataPoints.length < 3) return 0;

    const values = dataPoints.map(point => point.percentage);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return 1;

    const normalizedSlope = Math.abs(slope) / stdDev;
    const confidence = Math.min(normalizedSlope, 1);

    const dataPointsFactor = Math.min(dataPoints.length / 12, 1);

    return confidence * dataPointsFactor;
}

function determineTrendDirection(slope: number): 'growing' | 'declining' | 'stable' {
    const threshold = 0.1;

    if (slope > threshold) return 'growing';
    if (slope < -threshold) return 'declining';
    return 'stable';
}

function findFastestGrowth(trends: Record<string, ModelTrend>): {
    model: string;
    growthRate: number;
} {
    let fastestModel = '';
    let fastestRate = 0;

    Object.entries(trends).forEach(([model, trend]) => {
        if (trend.direction === 'growing' && trend.rate > fastestRate && trend.confidence > 0.3) {
            fastestModel = model;
            fastestRate = trend.rate;
        }
    });

    return {
        model: fastestModel || 'None',
        growthRate: fastestRate,
    };
}

function findFastestDecline(trends: Record<string, ModelTrend>): {
    model: string;
    declineRate: number;
} {
    let fastestModel = '';
    let fastestRate = 0;

    Object.entries(trends).forEach(([model, trend]) => {
        if (trend.direction === 'declining' && trend.rate > fastestRate && trend.confidence > 0.3) {
            fastestModel = model;
            fastestRate = trend.rate;
        }
    });

    return {
        model: fastestModel || 'None',
        declineRate: fastestRate,
    };
}

function findMarketLeader(historical: GPUMarketShare[]): { model: string; marketShare: number } {
    if (historical.length === 0) {
        return { model: 'None', marketShare: 0 };
    }

    const latestDate = new Date(Math.max(...historical.map(entry => entry.date.getTime())));
    const latestData = historical.filter(entry => entry.date.getTime() === latestDate.getTime());

    if (latestData.length === 0) {
        return { model: 'None', marketShare: 0 };
    }

    const leader = latestData.reduce((max, current) =>
        current.percentage > max.percentage ? current : max
    );

    return {
        model: leader.gpuModel,
        marketShare: leader.percentage,
    };
}

function calculateTimeframe(historical: GPUMarketShare[]): string {
    if (historical.length === 0) return 'No data';

    const dates = historical.map(entry => entry.date.getTime());
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    const monthsDiff =
        (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
        (maxDate.getMonth() - minDate.getMonth());

    if (monthsDiff < 1) return 'Less than 1 month';
    if (monthsDiff < 12) return `${monthsDiff} months`;

    const years = Math.floor(monthsDiff / 12);
    const remainingMonths = monthsDiff % 12;

    if (remainingMonths === 0) {
        return years === 1 ? '1 year' : `${years} years`;
    }

    return `${years} year${years > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
}

function createEmptyTrendAnalysis(): TrendAnalysis {
    return {
        timeframe: 'No data',
        growing: [],
        declining: [],
        stable: [],
        fastestGrowth: { model: 'None', growthRate: 0 },
        fastestDecline: { model: 'None', declineRate: 0 },
        marketLeader: { model: 'None', marketShare: 0 },
    };
}

export function predictMarketEvolution(
    historical: GPUMarketShare[],
    monthsAhead: number = 6
): GPUMarketShare[] {
    const modelGroups = groupByModel(historical);
    const predictions: GPUMarketShare[] = [];

    const latestDate = new Date(Math.max(...historical.map(entry => entry.date.getTime())));

    Object.entries(modelGroups).forEach(([model, dataPoints]) => {
        const sortedPoints = dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
        const latestPoint = sortedPoints[sortedPoints.length - 1];

        if (!latestPoint) return;

        const trendSlope = calculateTrendSlope(
            calculateMovingAverages(sortedPoints, Math.min(6, sortedPoints.length))
        );

        for (let month = 1; month <= monthsAhead; month++) {
            const futureDate = new Date(latestDate);
            futureDate.setMonth(futureDate.getMonth() + month);

            let predictedPercentage = latestPoint.percentage + trendSlope * month;
            predictedPercentage = Math.max(0, Math.min(100, predictedPercentage));

            predictions.push({
                gpuModel: model,
                percentage: predictedPercentage,
                date: futureDate,
            });
        }
    });

    return predictions;
}
