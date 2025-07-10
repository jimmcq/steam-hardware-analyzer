import { DataAggregator } from '@/lib/data-processor/aggregator';
import { HardwareSurveyEntry, GPUMarketShare, TimeSeriesData } from '@/types';

describe('DataAggregator', () => {
    const mockEntries: HardwareSurveyEntry[] = [
        {
            date: new Date('2023-01-01'),
            gpuDistribution: [
                { gpuModel: 'RTX 4070', percentage: 15.0, date: new Date('2023-01-01') },
                { gpuModel: 'RTX 3060', percentage: 12.0, date: new Date('2023-01-01') },
            ],
            cpuDistribution: [
                { cpuModel: 'Intel Core i7-12700K', percentage: 18.0, date: new Date('2023-01-01') },
            ],
            resolutionData: [],
            vramDistribution: [],
        },
        {
            date: new Date('2023-02-01'),
            gpuDistribution: [
                { gpuModel: 'RTX 4070', percentage: 16.0, date: new Date('2023-02-01') },
                { gpuModel: 'RTX 3060', percentage: 11.5, date: new Date('2023-02-01') },
                { gpuModel: 'RX 7900 XT', percentage: 8.0, date: new Date('2023-02-01') },
            ],
            cpuDistribution: [
                { cpuModel: 'Intel Core i7-12700K', percentage: 17.5, date: new Date('2023-02-01') },
            ],
            resolutionData: [],
            vramDistribution: [],
        },
    ];

    describe('aggregateGPUMarketShare', () => {
        it('should aggregate GPU market share data correctly', () => {
            const result = DataAggregator.aggregateGPUMarketShare(mockEntries);

            expect(result.size).toBe(3);
            expect(result.has('RTX 4070')).toBe(true);
            expect(result.has('RTX 3060')).toBe(true);
            expect(result.has('RX 7900 XT')).toBe(true);

            const rtx4070Data = result.get('RTX 4070')!;
            expect(rtx4070Data).toHaveLength(2);
            expect(rtx4070Data[0].value).toBe(15.0);
            expect(rtx4070Data[1].value).toBe(16.0);
        });

        it('should sort time series data by date', () => {
            const result = DataAggregator.aggregateGPUMarketShare(mockEntries);
            const rtx4070Data = result.get('RTX 4070')!;

            expect(rtx4070Data[0].date.getTime()).toBeLessThan(rtx4070Data[1].date.getTime());
        });

        it('should handle empty entries', () => {
            const result = DataAggregator.aggregateGPUMarketShare([]);

            expect(result.size).toBe(0);
        });

        it('should handle GPUs that appear in only some entries', () => {
            const result = DataAggregator.aggregateGPUMarketShare(mockEntries);
            const rx7900Data = result.get('RX 7900 XT')!;

            expect(rx7900Data).toHaveLength(1);
            expect(rx7900Data[0].value).toBe(8.0);
        });
    });

    describe('aggregateCPUMarketShare', () => {
        it('should aggregate CPU market share data correctly', () => {
            const result = DataAggregator.aggregateCPUMarketShare(mockEntries);

            expect(result.size).toBe(1);
            expect(result.has('Intel Core i7-12700K')).toBe(true);

            const cpuData = result.get('Intel Core i7-12700K')!;
            expect(cpuData).toHaveLength(2);
            expect(cpuData[0].value).toBe(18.0);
            expect(cpuData[1].value).toBe(17.5);
        });
    });

    describe('calculateTrends', () => {
        it('should identify growing trends', () => {
            const timeSeries: TimeSeriesData[] = [
                { date: new Date('2023-01-01'), value: 10 },
                { date: new Date('2023-02-01'), value: 12 },
                { date: new Date('2023-03-01'), value: 15 },
                { date: new Date('2023-04-01'), value: 18 },
            ];

            const result = DataAggregator.calculateTrends(timeSeries, 3);

            expect(result.trend).toBe('growing');
            expect(result.growthRate).toBeGreaterThan(0);
        });

        it('should identify declining trends', () => {
            const timeSeries: TimeSeriesData[] = [
                { date: new Date('2023-01-01'), value: 20 },
                { date: new Date('2023-02-01'), value: 18 },
                { date: new Date('2023-03-01'), value: 15 },
                { date: new Date('2023-04-01'), value: 12 },
            ];

            const result = DataAggregator.calculateTrends(timeSeries, 3);

            expect(result.trend).toBe('declining');
            expect(result.growthRate).toBeLessThan(0);
        });

        it('should identify stable trends', () => {
            const timeSeries: TimeSeriesData[] = [
                { date: new Date('2023-01-01'), value: 15 },
                { date: new Date('2023-02-01'), value: 15.2 },
                { date: new Date('2023-03-01'), value: 14.8 },
                { date: new Date('2023-04-01'), value: 15.1 },
            ];

            const result = DataAggregator.calculateTrends(timeSeries, 3);

            expect(result.trend).toBe('stable');
            expect(Math.abs(result.growthRate)).toBeLessThan(1);
        });

        it('should handle insufficient data', () => {
            const timeSeries: TimeSeriesData[] = [
                { date: new Date('2023-01-01'), value: 10 },
            ];

            const result = DataAggregator.calculateTrends(timeSeries, 3);

            expect(result.trend).toBe('stable');
            expect(result.growthRate).toBe(0);
            expect(result.volatility).toBe(0);
        });

        it('should calculate volatility correctly', () => {
            const volatileTimeSeries: TimeSeriesData[] = [
                { date: new Date('2023-01-01'), value: 10 },
                { date: new Date('2023-02-01'), value: 20 },
                { date: new Date('2023-03-01'), value: 5 },
                { date: new Date('2023-04-01'), value: 25 },
                { date: new Date('2023-05-01'), value: 8 },
            ];

            const stableTimeSeries: TimeSeriesData[] = [
                { date: new Date('2023-01-01'), value: 10 },
                { date: new Date('2023-02-01'), value: 11 },
                { date: new Date('2023-03-01'), value: 12 },
                { date: new Date('2023-04-01'), value: 13 },
                { date: new Date('2023-05-01'), value: 14 },
            ];

            const volatileResult = DataAggregator.calculateTrends(volatileTimeSeries, 3);
            const stableResult = DataAggregator.calculateTrends(stableTimeSeries, 3);

            expect(volatileResult.volatility).toBeGreaterThan(stableResult.volatility);
        });
    });

    describe('groupByManufacturer', () => {
        const gpuEntries: GPUMarketShare[] = [
            { gpuModel: 'RTX 4070', percentage: 15.0, date: new Date() },
            { gpuModel: 'RTX 3060', percentage: 12.0, date: new Date() },
            { gpuModel: 'RX 7900 XT', percentage: 8.0, date: new Date() },
            { gpuModel: 'Intel Arc A770', percentage: 2.0, date: new Date() },
        ];

        it('should group GPUs by manufacturer correctly', () => {
            const result = DataAggregator.groupByManufacturer(gpuEntries);

            expect(result.size).toBe(3);
            expect(result.has('NVIDIA')).toBe(true);
            expect(result.has('AMD')).toBe(true);
            expect(result.has('Intel')).toBe(true);

            const nvidiaGPUs = result.get('NVIDIA')!;
            expect(nvidiaGPUs).toHaveLength(2);
            expect(nvidiaGPUs[0].gpuModel).toBe('RTX 4070');
            expect(nvidiaGPUs[1].gpuModel).toBe('RTX 3060');

            const amdGPUs = result.get('AMD')!;
            expect(amdGPUs).toHaveLength(1);
            expect(amdGPUs[0].gpuModel).toBe('RX 7900 XT');

            const intelGPUs = result.get('Intel')!;
            expect(intelGPUs).toHaveLength(1);
            expect(intelGPUs[0].gpuModel).toBe('Intel Arc A770');
        });

        it('should handle unknown manufacturers', () => {
            const unknownGPUs: GPUMarketShare[] = [
                { gpuModel: 'Unknown GPU', percentage: 1.0, date: new Date() },
            ];

            const result = DataAggregator.groupByManufacturer(unknownGPUs);

            expect(result.has('Unknown')).toBe(true);
        });
    });

    describe('getTopEntries', () => {
        const entries = [
            { percentage: 5.0, model: 'Low' },
            { percentage: 15.0, model: 'High' },
            { percentage: 10.0, model: 'Medium' },
            { percentage: 20.0, model: 'Highest' },
        ];

        it('should return top entries sorted by percentage', () => {
            const result = DataAggregator.getTopEntries(entries, 3);

            expect(result).toHaveLength(3);
            expect(result[0].model).toBe('Highest');
            expect(result[1].model).toBe('High');
            expect(result[2].model).toBe('Medium');
        });

        it('should return all entries if count exceeds array length', () => {
            const result = DataAggregator.getTopEntries(entries, 10);

            expect(result).toHaveLength(4);
        });

        it('should use default count of 10', () => {
            const manyEntries = Array.from({ length: 15 }, (_, i) => ({
                percentage: i + 1,
                model: `Model${i}`,
            }));

            const result = DataAggregator.getTopEntries(manyEntries);

            expect(result).toHaveLength(10);
        });
    });

    describe('calculateManufacturerShare', () => {
        const gpuEntries: GPUMarketShare[] = [
            { gpuModel: 'RTX 4070', percentage: 15.0, date: new Date() },
            { gpuModel: 'RTX 3060', percentage: 12.0, date: new Date() },
            { gpuModel: 'RX 7900 XT', percentage: 8.0, date: new Date() },
            { gpuModel: 'RX 6700 XT', percentage: 6.0, date: new Date() },
            { gpuModel: 'Intel Arc A770', percentage: 2.0, date: new Date() },
        ];

        it('should calculate total market share by manufacturer', () => {
            const result = DataAggregator.calculateManufacturerShare(gpuEntries);

            expect(result.get('NVIDIA')).toBe(27.0); // 15.0 + 12.0
            expect(result.get('AMD')).toBe(14.0); // 8.0 + 6.0
            expect(result.get('Intel')).toBe(2.0);
        });

        it('should handle empty entries', () => {
            const result = DataAggregator.calculateManufacturerShare([]);

            expect(result.size).toBe(0);
        });
    });
});