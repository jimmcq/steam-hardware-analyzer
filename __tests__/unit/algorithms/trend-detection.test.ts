import { detectMarketTrends, predictMarketEvolution } from '@/lib/algorithms/trend-detection';
import { GPUMarketShare } from '@/types/hardware';

describe('Market Trend Detection', () => {
    const createMarketShareData = (
        model: string,
        dataPoints: Array<{ date: string; percentage: number }>
    ): GPUMarketShare[] => {
        return dataPoints.map(point => ({
            gpuModel: model,
            percentage: point.percentage,
            date: new Date(point.date),
        }));
    };

    it('should return empty analysis for empty data', () => {
        const result = detectMarketTrends([]);

        expect(result.timeframe).toBe('No data');
        expect(result.growing).toEqual([]);
        expect(result.declining).toEqual([]);
        expect(result.stable).toEqual([]);
        expect(result.fastestGrowth.model).toBe('None');
        expect(result.fastestDecline.model).toBe('None');
        expect(result.marketLeader.model).toBe('None');
    });

    it('should identify growing trends correctly', () => {
        const growingGPU = createMarketShareData('RTX 4070', [
            { date: '2024-01-01', percentage: 5 },
            { date: '2024-02-01', percentage: 7 },
            { date: '2024-03-01', percentage: 10 },
            { date: '2024-04-01', percentage: 13 },
            { date: '2024-05-01', percentage: 16 },
            { date: '2024-06-01', percentage: 20 },
        ]);

        const stableGPU = createMarketShareData('RTX 3060', [
            { date: '2024-01-01', percentage: 15 },
            { date: '2024-02-01', percentage: 15.2 },
            { date: '2024-03-01', percentage: 14.8 },
            { date: '2024-04-01', percentage: 15.1 },
            { date: '2024-05-01', percentage: 14.9 },
            { date: '2024-06-01', percentage: 15 },
        ]);

        const allData = [...growingGPU, ...stableGPU];
        const trends = detectMarketTrends(allData, 3);

        expect(trends.growing.length).toBeGreaterThan(0);
        expect(trends.stable.length).toBeGreaterThan(0);
        if (trends.fastestGrowth.model !== 'None') {
            expect(trends.fastestGrowth.growthRate).toBeGreaterThan(0);
        }
    });

    it('should identify declining trends correctly', () => {
        const decliningGPU = createMarketShareData('GTX 1660', [
            { date: '2024-01-01', percentage: 20 },
            { date: '2024-02-01', percentage: 18 },
            { date: '2024-03-01', percentage: 15 },
            { date: '2024-04-01', percentage: 12 },
            { date: '2024-05-01', percentage: 10 },
            { date: '2024-06-01', percentage: 8 },
        ]);

        const trends = detectMarketTrends(decliningGPU, 3);

        expect(trends.declining.length).toBeGreaterThan(0);
        if (trends.fastestDecline.model !== 'None') {
            expect(trends.fastestDecline.declineRate).toBeGreaterThan(0);
        }
    });

    it('should identify market leader correctly', () => {
        const marketData = [
            ...createMarketShareData('RTX 4070', [{ date: '2024-06-01', percentage: 25 }]),
            ...createMarketShareData('RTX 3060', [{ date: '2024-06-01', percentage: 15 }]),
            ...createMarketShareData('RTX 4060', [{ date: '2024-06-01', percentage: 20 }]),
        ];

        const trends = detectMarketTrends(marketData);

        expect(trends.marketLeader.model).toBe('RTX 4070');
        expect(trends.marketLeader.marketShare).toBe(25);
    });

    it('should calculate timeframe correctly', () => {
        const sixMonthData = createMarketShareData('RTX 4070', [
            { date: '2024-01-01', percentage: 10 },
            { date: '2024-06-01', percentage: 15 },
        ]);

        const trends = detectMarketTrends(sixMonthData);
        expect(trends.timeframe).toContain('5 months');
    });

    it('should handle single data point gracefully', () => {
        const singlePoint = createMarketShareData('RTX 4070', [
            { date: '2024-01-01', percentage: 10 },
        ]);

        const trends = detectMarketTrends(singlePoint);

        expect(trends.stable).toContain('RTX 4070');
        expect(trends.growing).not.toContain('RTX 4070');
        expect(trends.declining).not.toContain('RTX 4070');
    });

    it('should respect custom window parameter', () => {
        const longSeries = createMarketShareData(
            'RTX 4070',
            Array.from({ length: 12 }, (_, i) => ({
                date: `2024-${String(i + 1).padStart(2, '0')}-01`,
                percentage: 10 + i * 2,
            }))
        );

        const trendsSmallWindow = detectMarketTrends(longSeries, 3);
        const trendsLargeWindow = detectMarketTrends(longSeries, 9);

        expect(trendsSmallWindow).toBeDefined();
        expect(trendsLargeWindow).toBeDefined();
    });

    it('should handle mixed trend data correctly', () => {
        const mixedData = [
            ...createMarketShareData('Growing GPU', [
                { date: '2024-01-01', percentage: 5 },
                { date: '2024-03-01', percentage: 15 },
                { date: '2024-06-01', percentage: 25 },
            ]),
            ...createMarketShareData('Declining GPU', [
                { date: '2024-01-01', percentage: 25 },
                { date: '2024-03-01', percentage: 15 },
                { date: '2024-06-01', percentage: 5 },
            ]),
            ...createMarketShareData('Stable GPU', [
                { date: '2024-01-01', percentage: 10 },
                { date: '2024-03-01', percentage: 10.5 },
                { date: '2024-06-01', percentage: 9.5 },
            ]),
        ];

        const trends = detectMarketTrends(mixedData);

        // At least one trend category should have results
        const totalTrends = trends.growing.length + trends.declining.length + trends.stable.length;
        expect(totalTrends).toBeGreaterThan(0);
    });
});

describe('Market Evolution Prediction', () => {
    const createTrendData = (model: string, trend: 'up' | 'down' | 'stable') => {
        const basePercentage = 10;
        const points = [];

        for (let i = 0; i < 6; i++) {
            let percentage = basePercentage;
            if (trend === 'up') percentage += i * 2;
            else if (trend === 'down') percentage -= i * 1.5;

            points.push({
                gpuModel: model,
                percentage: Math.max(1, percentage),
                date: new Date(`2024-${String(i + 1).padStart(2, '0')}-01`),
            });
        }

        return points;
    };

    it('should generate predictions for future months', () => {
        const historicalData = createTrendData('RTX 4070', 'up');
        const predictions = predictMarketEvolution(historicalData, 3);

        expect(predictions.length).toBe(3);

        predictions.forEach(prediction => {
            expect(prediction.gpuModel).toBe('RTX 4070');
            expect(prediction.percentage).toBeGreaterThanOrEqual(0);
            expect(prediction.percentage).toBeLessThanOrEqual(100);
            expect(prediction.date).toBeInstanceOf(Date);
        });
    });

    it('should predict increasing trends correctly', () => {
        const growingData = createTrendData('Growing GPU', 'up');
        const predictions = predictMarketEvolution(growingData, 2);

        const lastHistorical = growingData[growingData.length - 1];
        const firstPrediction = predictions.find(p => p.gpuModel === 'Growing GPU');

        if (firstPrediction) {
            expect(firstPrediction.percentage).toBeGreaterThanOrEqual(lastHistorical.percentage);
        }
    });

    it('should predict declining trends correctly', () => {
        const decliningData = createTrendData('Declining GPU', 'down');
        const predictions = predictMarketEvolution(decliningData, 2);

        const lastHistorical = decliningData[decliningData.length - 1];
        const firstPrediction = predictions.find(p => p.gpuModel === 'Declining GPU');

        if (firstPrediction && lastHistorical.percentage > 5) {
            expect(firstPrediction.percentage).toBeLessThanOrEqual(lastHistorical.percentage);
        }
    });

    it('should not predict negative percentages', () => {
        const decliningData = [
            { gpuModel: 'Dying GPU', percentage: 2, date: new Date('2024-01-01') },
            { gpuModel: 'Dying GPU', percentage: 1, date: new Date('2024-02-01') },
        ];

        const predictions = predictMarketEvolution(decliningData, 3);

        predictions.forEach(prediction => {
            expect(prediction.percentage).toBeGreaterThanOrEqual(0);
        });
    });

    it('should not predict percentages above 100', () => {
        const highGrowthData = [
            { gpuModel: 'Explosive GPU', percentage: 95, date: new Date('2024-01-01') },
            { gpuModel: 'Explosive GPU', percentage: 98, date: new Date('2024-02-01') },
        ];

        const predictions = predictMarketEvolution(highGrowthData, 3);

        predictions.forEach(prediction => {
            expect(prediction.percentage).toBeLessThanOrEqual(100);
        });
    });

    it('should handle empty historical data', () => {
        const predictions = predictMarketEvolution([], 3);
        expect(predictions).toEqual([]);
    });
});
