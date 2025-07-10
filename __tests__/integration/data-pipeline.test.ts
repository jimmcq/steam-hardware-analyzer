import { DataIngestion } from '@/lib/data-processor/ingestion';
import { DataValidator } from '@/lib/data-processor/validator';
import { DataAggregator } from '@/lib/data-processor/aggregator';
import { MockDataGenerator } from '@/lib/data-processor/mock-data';
import { GPUDatabase } from '@/lib/gpu-database/specifications';

describe('Data Processing Pipeline Integration', () => {
    beforeAll(() => {
        // Initialize GPU database
        GPUDatabase.initialize();
    });

    describe('End-to-End Data Processing', () => {
        it('should process mock Steam survey data through complete pipeline', async () => {
            // Generate mock data
            const surveyData = MockDataGenerator.generateSteamSurveyData(new Date('2023-06-01'));

            // Process through ingestion pipeline
            const result = await DataIngestion.processSurveyData(surveyData);

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.errors).toEqual([]);

            if (result.data) {
                expect(result.data.date).toBeInstanceOf(Date);
                expect(result.data.gpuDistribution).toBeInstanceOf(Array);
                expect(result.data.cpuDistribution).toBeInstanceOf(Array);
                expect(result.data.gpuDistribution.length).toBeGreaterThan(0);
                expect(result.data.cpuDistribution.length).toBeGreaterThan(0);
            }
        });

        it('should process multiple survey entries and aggregate data', async () => {
            const entries = MockDataGenerator.generateMultipleSurveyEntries(
                new Date('2023-01-01'),
                new Date('2023-06-01'),
                30
            );

            // Process all entries through pipeline
            const processResults = await Promise.all(
                entries.map(entry => {
                    const surveyData = {
                        surveyDate: entry.date.toISOString().split('T')[0],
                        totalParticipants: 5000000,
                        graphics: entry.gpuDistribution.reduce(
                            (acc, gpu) => {
                                acc[gpu.gpuModel] = { percentage: gpu.percentage };
                                return acc;
                            },
                            {} as Record<string, { percentage: number }>
                        ),
                        processors: entry.cpuDistribution.reduce(
                            (acc, cpu) => {
                                acc[cpu.cpuModel] = { percentage: cpu.percentage };
                                return acc;
                            },
                            {} as Record<string, { percentage: number }>
                        ),
                        memory: entry.vramDistribution.reduce(
                            (acc, vram) => {
                                acc[vram.memory] = { percentage: vram.percentage };
                                return acc;
                            },
                            {} as Record<string, { percentage: number }>
                        ),
                        resolution: entry.resolutionData.reduce(
                            (acc, res) => {
                                acc[res.resolution] = { percentage: res.percentage };
                                return acc;
                            },
                            {} as Record<string, { percentage: number }>
                        ),
                    };
                    return DataIngestion.processSurveyData(surveyData);
                })
            );

            const successfulEntries = processResults
                .filter(result => result.success && result.data)
                .map(result => result.data!);

            expect(successfulEntries.length).toBeGreaterThan(0);

            // Aggregate the processed data
            const gpuTimeSeries = DataAggregator.aggregateGPUMarketShare(successfulEntries);
            expect(gpuTimeSeries.size).toBeGreaterThan(0);

            // Verify time series data structure
            for (const [gpuModel, timeSeries] of gpuTimeSeries) {
                expect(typeof gpuModel).toBe('string');
                expect(Array.isArray(timeSeries)).toBe(true);
                expect(timeSeries.length).toBeGreaterThan(0);

                timeSeries.forEach(dataPoint => {
                    expect(dataPoint.date).toBeInstanceOf(Date);
                    expect(typeof dataPoint.value).toBe('number');
                    expect(dataPoint.value).toBeGreaterThanOrEqual(0);
                });
            }
        });

        it('should handle validation errors gracefully', async () => {
            const invalidData = {
                surveyDate: 'invalid-date',
                totalParticipants: -1,
                graphics: 'not-an-object',
            };

            const result = await DataIngestion.processSurveyData(invalidData);

            expect(result.success).toBe(false);
            expect(result.data).toBeUndefined();
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('should validate data consistency across multiple entries', () => {
            const entries = MockDataGenerator.generateMultipleSurveyEntries(
                new Date('2023-01-01'),
                new Date('2023-03-01'),
                30
            );

            const validation = DataValidator.validateDataConsistency(entries);

            expect(validation.isValid).toBe(true);
            expect(validation.errors).toEqual([]);
        });
    });

    describe('GPU Database Integration', () => {
        it('should match GPU models from survey data with database', () => {
            const surveyData = MockDataGenerator.generateSteamSurveyData(new Date('2023-06-01'));

            // Convert to HardwareSurveyEntry format
            const entry = {
                date: new Date(surveyData.surveyDate),
                gpuDistribution: Object.entries(surveyData.graphics).map(([gpuModel, data]) => ({
                    gpuModel,
                    percentage: data.percentage,
                    date: new Date(surveyData.surveyDate),
                })),
                cpuDistribution: [],
                resolutionData: [],
                vramDistribution: [],
            };

            let matchedGPUs = 0;

            entry.gpuDistribution.forEach(gpu => {
                const dbGPU = GPUDatabase.findGPUByName(gpu.gpuModel);
                if (dbGPU) {
                    matchedGPUs++;
                    expect(dbGPU.model).toBeDefined();
                    expect(dbGPU.manufacturer).toBeDefined();
                    expect(dbGPU.tier).toBeDefined();
                }
            });

            // Should match some GPUs (mock data uses real GPU names)
            expect(matchedGPUs).toBeGreaterThan(0);
        });

        it('should provide performance context for market share data', () => {
            const rtx4090 = GPUDatabase.getGPU('RTX 4090');
            const rtx4060 = GPUDatabase.getGPU('RTX 4060');

            expect(rtx4090).toBeDefined();
            expect(rtx4060).toBeDefined();

            if (rtx4090 && rtx4060) {
                expect(rtx4090.performanceScore).toBeGreaterThan(rtx4060.performanceScore);
                expect(rtx4090.tier).toBe('Enthusiast');
                expect(rtx4060.tier).toBe('Entry');
            }
        });
    });

    describe('Error Handling and Data Quality', () => {
        it('should handle sparse data gracefully', () => {
            const sparseData = MockDataGenerator.generateSparseData(
                new Date('2023-01-01'),
                new Date('2023-06-01'),
                0.5 // 50% missing data
            );

            expect(sparseData.length).toBeGreaterThan(0);

            const validation = DataValidator.validateDataConsistency(sparseData);
            expect(validation.isValid).toBe(true);
        });

        it('should detect and handle outliers', () => {
            const dataWithOutliers = MockDataGenerator.generateDataWithOutliers(
                new Date('2023-01-01'),
                new Date('2023-03-01'),
                0.2 // 20% outlier probability
            );

            expect(dataWithOutliers.length).toBeGreaterThan(0);

            // Aggregate data and check for trend analysis
            const gpuTimeSeries = DataAggregator.aggregateGPUMarketShare(dataWithOutliers);

            for (const [, timeSeries] of gpuTimeSeries) {
                if (timeSeries.length >= 3) {
                    const trends = DataAggregator.calculateTrends(timeSeries);
                    expect(['growing', 'declining', 'stable']).toContain(trends.trend);
                    expect(typeof trends.growthRate).toBe('number');
                    expect(typeof trends.volatility).toBe('number');
                }
            }
        });

        it('should validate time series data properly', () => {
            const testScenarios = ['growth', 'decline', 'stable', 'volatile'] as const;

            testScenarios.forEach(scenario => {
                const timeSeries = MockDataGenerator.generateTestScenario(scenario);
                const validation = DataValidator.validateTimeSeries(timeSeries);

                expect(validation.isValid).toBe(true);
                expect(timeSeries.length).toBe(12);

                // Verify chronological order
                for (let i = 1; i < timeSeries.length; i++) {
                    expect(timeSeries[i].date.getTime()).toBeGreaterThan(
                        timeSeries[i - 1].date.getTime()
                    );
                }
            });
        });
    });

    describe('Performance and Scalability', () => {
        it('should process large datasets efficiently', async () => {
            const largeDataset = Array.from({ length: 100 }, (_, i) =>
                MockDataGenerator.generateSteamSurveyData(
                    new Date(2023, 0, 1 + i) // 100 days of data
                )
            );

            const startTime = Date.now();

            const results = await DataIngestion.processMultipleSurveyEntries(largeDataset);

            const endTime = Date.now();
            const processingTime = endTime - startTime;

            expect(results.success).toBe(true);
            expect(results.stats.processed).toBe(100);
            expect(results.stats.successful).toBeGreaterThan(0);

            // Should process 100 entries in reasonable time (< 5 seconds)
            expect(processingTime).toBeLessThan(5000);
        });
    });
});
