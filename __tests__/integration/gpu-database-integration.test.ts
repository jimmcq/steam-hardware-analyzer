import { GPUDatabase } from '@/lib/gpu-database/specifications';
import { DataAggregator } from '@/lib/data-processor/aggregator';
import { MockDataGenerator } from '@/lib/data-processor/mock-data';

describe('GPU Database Integration Tests', () => {
    beforeAll(() => {
        GPUDatabase.initialize();
    });

    describe('Database Completeness and Consistency', () => {
        it('should have all major GPU manufacturers represented', () => {
            const allGPUs = GPUDatabase.getAllGPUs();
            const manufacturers = new Set(allGPUs.map(gpu => gpu.manufacturer));

            expect(manufacturers.has('NVIDIA')).toBe(true);
            expect(manufacturers.has('AMD')).toBe(true);
            expect(manufacturers.has('Intel')).toBe(true);
            expect(allGPUs.length).toBeGreaterThan(15);
        });

        it('should have consistent performance tiers', () => {
            const tierDistribution = GPUDatabase.getPerformanceTierDistribution();

            expect(tierDistribution.has('Entry')).toBe(true);
            expect(tierDistribution.has('Mid-Range')).toBe(true);
            expect(tierDistribution.has('High-End')).toBe(true);
            expect(tierDistribution.has('Enthusiast')).toBe(true);

            // Verify performance scores align with tiers
            const enthusiastGPUs = GPUDatabase.getGPUsByTier('Enthusiast');
            const entryGPUs = GPUDatabase.getGPUsByTier('Entry');

            const avgEnthusiastScore =
                enthusiastGPUs.reduce((sum, gpu) => sum + gpu.performanceScore, 0) /
                enthusiastGPUs.length;
            const avgEntryScore =
                entryGPUs.reduce((sum, gpu) => sum + gpu.performanceScore, 0) / entryGPUs.length;

            expect(avgEnthusiastScore).toBeGreaterThan(avgEntryScore);
        });

        it('should have reasonable release date ranges', () => {
            const allGPUs = GPUDatabase.getAllGPUs();
            const releaseYears = allGPUs.map(gpu => gpu.releaseDate.getFullYear());

            const minYear = Math.min(...releaseYears);
            const maxYear = Math.max(...releaseYears);

            expect(minYear).toBeGreaterThanOrEqual(2020);
            expect(maxYear).toBeLessThanOrEqual(new Date().getFullYear());
        });
    });

    describe('Market Share Analysis Integration', () => {
        it('should correlate GPU performance with market trends', () => {
            const mockEntries = MockDataGenerator.generateMultipleSurveyEntries(
                new Date('2023-01-01'),
                new Date('2023-12-01'),
                30
            );

            const gpuTimeSeries = DataAggregator.aggregateGPUMarketShare(mockEntries);
            let performanceCorrelations = 0;

            for (const [gpuModel, timeSeries] of gpuTimeSeries) {
                const gpuSpec = GPUDatabase.findGPUByName(gpuModel);

                if (gpuSpec && timeSeries.length > 1) {
                    const trends = DataAggregator.calculateTrends(timeSeries);

                    // Higher-end GPUs might have different trend patterns
                    if (gpuSpec.tier === 'Enthusiast' || gpuSpec.tier === 'High-End') {
                        expect(typeof trends.growthRate).toBe('number');
                        performanceCorrelations++;
                    }
                }
            }

            expect(performanceCorrelations).toBeGreaterThan(0);
        });

        it('should provide manufacturer market share insights', () => {
            const mockEntries = MockDataGenerator.generateMultipleSurveyEntries(
                new Date('2023-01-01'),
                new Date('2023-06-01'),
                30
            );

            // Get latest entry for current market share
            const latestEntry = mockEntries[mockEntries.length - 1];
            const manufacturerShare = DataAggregator.calculateManufacturerShare(
                latestEntry.gpuDistribution
            );

            // Should have data for major manufacturers
            const totalShare = Array.from(manufacturerShare.values()).reduce(
                (sum, share) => sum + share,
                0
            );
            expect(totalShare).toBeGreaterThan(0);

            // Verify manufacturer names are recognized
            for (const manufacturer of manufacturerShare.keys()) {
                expect(['NVIDIA', 'AMD', 'Intel', 'Unknown']).toContain(manufacturer);
            }
        });
    });

    describe('Fuzzy Matching and Search', () => {
        it('should find GPUs with partial names', () => {
            const testCases = [
                { search: 'RTX 4090', expected: 'RTX 4090' },
                { search: '4090', expected: 'RTX 4090' },
                { search: 'RX 7900', expected: 'RX 7900 XTX' }, // Should match first occurrence
                { search: 'Intel Arc', expected: 'Intel Arc A770' },
            ];

            testCases.forEach(({ search, expected }) => {
                const found = GPUDatabase.findGPUByName(search);
                expect(found).toBeDefined();
                if (found) {
                    expect(found.model).toContain(expected.split(' ')[1]); // Should contain the number part
                }
            });
        });

        it('should handle case-insensitive searches', () => {
            const searchTerms = ['rtx 4090', 'RTX 4090', 'Rtx 4090'];

            searchTerms.forEach(term => {
                const found = GPUDatabase.findGPUByName(term);
                expect(found).toBeDefined();
                expect(found?.model).toBe('RTX 4090');
            });
        });
    });

    describe('Date Range Filtering', () => {
        it('should filter GPUs by release date ranges', () => {
            const recentGPUs = GPUDatabase.getGPUsByDateRange(
                new Date('2022-01-01'),
                new Date('2024-01-01')
            );

            const olderGPUs = GPUDatabase.getGPUsByDateRange(
                new Date('2020-01-01'),
                new Date('2022-01-01')
            );

            expect(recentGPUs.length).toBeGreaterThan(0);
            expect(olderGPUs.length).toBeGreaterThan(0);

            // Verify date filtering works correctly
            recentGPUs.forEach(gpu => {
                expect(gpu.releaseDate.getTime()).toBeGreaterThanOrEqual(
                    new Date('2022-01-01').getTime()
                );
                expect(gpu.releaseDate.getTime()).toBeLessThan(new Date('2024-01-01').getTime());
            });
        });

        it('should correlate release dates with architecture generations', () => {
            const rtx40Series = GPUDatabase.getAllGPUs().filter(
                gpu => gpu.architecture === 'Ada Lovelace'
            );

            const rtx30Series = GPUDatabase.getAllGPUs().filter(
                gpu => gpu.architecture === 'Ampere'
            );

            // RTX 40 series should be newer than RTX 30 series
            if (rtx40Series.length > 0 && rtx30Series.length > 0) {
                const avgRtx40Date =
                    rtx40Series.reduce((sum, gpu) => sum + gpu.releaseDate.getTime(), 0) /
                    rtx40Series.length;
                const avgRtx30Date =
                    rtx30Series.reduce((sum, gpu) => sum + gpu.releaseDate.getTime(), 0) /
                    rtx30Series.length;

                expect(avgRtx40Date).toBeGreaterThan(avgRtx30Date);
            }
        });
    });

    describe('Performance Metrics Validation', () => {
        it('should have consistent performance scores within tiers', () => {
            const tiers = ['Entry', 'Mid-Range', 'High-End', 'Enthusiast'] as const;

            tiers.forEach(tier => {
                const gpusInTier = GPUDatabase.getGPUsByTier(tier);

                if (gpusInTier.length > 1) {
                    const scores = gpusInTier.map(gpu => gpu.performanceScore);
                    const minScore = Math.min(...scores);
                    const maxScore = Math.max(...scores);

                    // Within a tier, scores shouldn't vary too wildly
                    const variation = (maxScore - minScore) / minScore;
                    expect(variation).toBeLessThan(1.0); // Less than 100% variation within tier
                }
            });
        });

        it('should have logical VRAM amounts for performance tiers', () => {
            const enthusiastGPUs = GPUDatabase.getGPUsByTier('Enthusiast');
            const entryGPUs = GPUDatabase.getGPUsByTier('Entry');

            if (enthusiastGPUs.length > 0 && entryGPUs.length > 0) {
                const avgEnthusiastVRAM =
                    enthusiastGPUs.reduce((sum, gpu) => sum + gpu.vram, 0) / enthusiastGPUs.length;
                const avgEntryVRAM =
                    entryGPUs.reduce((sum, gpu) => sum + gpu.vram, 0) / entryGPUs.length;

                expect(avgEnthusiastVRAM).toBeGreaterThan(avgEntryVRAM);
            }
        });
    });
});
