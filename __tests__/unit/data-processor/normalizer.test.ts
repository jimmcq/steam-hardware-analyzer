import { DataNormalizer } from '@/lib/data-processor/normalizer';
import { SteamSurveyData } from '@/types';

describe('DataNormalizer', () => {
    const mockSurveyData: SteamSurveyData = {
        surveyDate: '2023-06-01',
        totalParticipants: 1000000,
        graphics: {
            'NVIDIA GeForce RTX 4070': { percentage: 15.5, change: 2.1 },
            'NVIDIA GeForce RTX 3060': { percentage: 12.3, change: -0.5 },
            'AMD Radeon RX 6600 XT': { percentage: 8.7, change: 1.2 },
        },
        processors: {
            'Intel(R) Core(TM) i7-12700K @ 3.60GHz': { percentage: 18.2, change: 1.8 },
            'AMD Ryzen 5 5600X': { percentage: 14.6, change: 0.9 },
        },
        memory: {
            '16 GB': { percentage: 45.3, change: 2.1 },
            '32 GB': { percentage: 28.7, change: 1.5 },
        },
        resolution: {
            '1920 x 1080': { percentage: 65.8, change: -0.3 },
            '2560 x 1440': { percentage: 25.4, change: 1.2 },
        },
    };

    describe('normalizeSurveyEntry', () => {
        it('should normalize survey data correctly', () => {
            const result = DataNormalizer.normalizeSurveyEntry(mockSurveyData);

            expect(result.date).toEqual(new Date('2023-06-01'));
            expect(result.gpuDistribution).toHaveLength(3);
            expect(result.cpuDistribution).toHaveLength(2);
            expect(result.resolutionData).toHaveLength(2);
            expect(result.vramDistribution).toHaveLength(2);
        });

        it('should handle empty data sections', () => {
            const emptyData: SteamSurveyData = {
                ...mockSurveyData,
                graphics: {},
                processors: {},
            };

            const result = DataNormalizer.normalizeSurveyEntry(emptyData);

            expect(result.gpuDistribution).toHaveLength(0);
            expect(result.cpuDistribution).toHaveLength(0);
        });
    });

    describe('GPU name cleaning', () => {
        it('should clean NVIDIA GPU names correctly', () => {
            const testData: SteamSurveyData = {
                ...mockSurveyData,
                graphics: {
                    'NVIDIA GeForce RTX 4070 Ti': { percentage: 10.0 },
                    'NVIDIA GeForce GTX 1660 Super': { percentage: 5.0 },
                },
            };

            const result = DataNormalizer.normalizeSurveyEntry(testData);

            expect(result.gpuDistribution[0].gpuModel).toBe('RTX 4070 Ti');
            expect(result.gpuDistribution[1].gpuModel).toBe('GTX 1660 Super');
        });

        it('should clean AMD GPU names correctly', () => {
            const testData: SteamSurveyData = {
                ...mockSurveyData,
                graphics: {
                    'AMD Radeon RX 7900 XTX': { percentage: 8.0 },
                    'AMD Radeon RX 6700 XT': { percentage: 6.0 },
                },
            };

            const result = DataNormalizer.normalizeSurveyEntry(testData);

            expect(result.gpuDistribution[0].gpuModel).toBe('RX 7900 XTX');
            expect(result.gpuDistribution[1].gpuModel).toBe('RX 6700 XT');
        });

        it('should handle Intel GPU names', () => {
            const testData: SteamSurveyData = {
                ...mockSurveyData,
                graphics: {
                    'Intel Arc A770': { percentage: 2.0 },
                },
            };

            const result = DataNormalizer.normalizeSurveyEntry(testData);

            expect(result.gpuDistribution[0].gpuModel).toBe('Intel Arc A770');
        });
    });

    describe('CPU name cleaning', () => {
        it('should clean Intel CPU names correctly', () => {
            const testData: SteamSurveyData = {
                ...mockSurveyData,
                processors: {
                    'Intel(R) Core(TM) i9-13900K @ 3.0GHz': { percentage: 15.0 },
                },
            };

            const result = DataNormalizer.normalizeSurveyEntry(testData);

            expect(result.cpuDistribution[0].cpuModel).toBe('Intel Core i9-13900K');
        });

        it('should clean AMD CPU names correctly', () => {
            const testData: SteamSurveyData = {
                ...mockSurveyData,
                processors: {
                    'AMD Ryzen 9 7950X': { percentage: 12.0 },
                },
            };

            const result = DataNormalizer.normalizeSurveyEntry(testData);

            expect(result.cpuDistribution[0].cpuModel).toBe('AMD Ryzen 9 7950X');
        });
    });

    describe('validateSurveyData', () => {
        it('should validate correct survey data', () => {
            const isValid = DataNormalizer.validateSurveyData(mockSurveyData);
            expect(isValid).toBe(true);
        });

        it('should reject invalid survey data', () => {
            const invalidData = {
                surveyDate: '2023-06-01',
                // missing required fields
            };

            const isValid = DataNormalizer.validateSurveyData(invalidData);
            expect(isValid).toBe(false);
        });

        it('should reject null or undefined data', () => {
            expect(DataNormalizer.validateSurveyData(null)).toBe(false);
            expect(DataNormalizer.validateSurveyData(undefined)).toBe(false);
        });
    });

    describe('filterLowPercentageEntries', () => {
        it('should filter entries below threshold', () => {
            const entries = [
                { percentage: 15.0, model: 'High' },
                { percentage: 0.05, model: 'VeryLow' },
                { percentage: 5.0, model: 'Medium' },
                { percentage: 0.08, model: 'Low' },
            ];

            const filtered = DataNormalizer.filterLowPercentageEntries(entries, 0.1);
            expect(filtered).toHaveLength(2);
            expect(filtered[0].model).toBe('High');
            expect(filtered[1].model).toBe('Medium');
        });

        it('should use default threshold when not specified', () => {
            const entries = [
                { percentage: 15.0, model: 'High' },
                { percentage: 0.05, model: 'VeryLow' },
            ];

            const filtered = DataNormalizer.filterLowPercentageEntries(entries);
            expect(filtered).toHaveLength(1);
        });
    });

    describe('sortByPercentage', () => {
        it('should sort entries by percentage in descending order', () => {
            const entries = [
                { percentage: 5.0, model: 'Medium' },
                { percentage: 15.0, model: 'High' },
                { percentage: 1.0, model: 'Low' },
            ];

            const sorted = DataNormalizer.sortByPercentage(entries);
            expect(sorted[0].model).toBe('High');
            expect(sorted[1].model).toBe('Medium');
            expect(sorted[2].model).toBe('Low');
        });

        it('should not mutate the original array', () => {
            const entries = [
                { percentage: 5.0, model: 'Medium' },
                { percentage: 15.0, model: 'High' },
            ];

            const sorted = DataNormalizer.sortByPercentage(entries);
            expect(entries[0].model).toBe('Medium');
            expect(sorted[0].model).toBe('High');
        });
    });
});
