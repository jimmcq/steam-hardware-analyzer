import { calculateBottleneck } from '@/lib/algorithms/bottleneck-calc';
import { clusterUserProfiles } from '@/lib/algorithms/clustering';
import { detectMarketTrends } from '@/lib/algorithms/trend-detection';
import { GPUData, CPUData, HardwareSurveyEntry, GPUMarketShare } from '@/types';
import { GameRequirements } from '@/types/steam-data';

describe('Additional Coverage Tests', () => {
    describe('Bottleneck Calculator Edge Cases', () => {
        const createMockGPU = (overrides: Partial<GPUData> = {}): GPUData => ({
            model: 'RTX 4070',
            manufacturer: 'NVIDIA',
            tier: 'High-End',
            releaseDate: new Date('2023-04-01'),
            performanceScore: 85,
            marketShare: [],
            vram: 12,
            architecture: 'Ada Lovelace',
            ...overrides,
        });

        const createMockCPU = (overrides: Partial<CPUData> = {}): CPUData => ({
            model: 'i7-13700K',
            manufacturer: 'Intel',
            cores: 16,
            threads: 24,
            baseFreq: 3.4,
            boostFreq: 5.4,
            releaseDate: new Date('2022-10-01'),
            performanceScore: 90,
            ...overrides,
        });

        const createMockGame = (overrides: Partial<GameRequirements> = {}): GameRequirements => ({
            gameId: 'test',
            name: 'Test Game',
            minimumGPU: 'GTX 1060',
            recommendedGPU: 'RTX 3070',
            minimumCPU: 'i5-8400',
            recommendedCPU: 'i7-10700K',
            minimumRAM: 8,
            recommendedRAM: 16,
            minimumVRAM: 4,
            recommendedVRAM: 8,
            ...overrides,
        });

        it('should handle different architecture types', () => {
            const ampereGPU = createMockGPU({ architecture: 'Ampere' });
            const rdna2GPU = createMockGPU({ architecture: 'RDNA2' });
            const turingGPU = createMockGPU({ architecture: 'Turing' });
            const rdnaGPU = createMockGPU({ architecture: 'RDNA' });
            const unknownGPU = createMockGPU({ architecture: 'Unknown' });
            const cpu = createMockCPU();
            const game = createMockGame();

            const ampereAnalysis = calculateBottleneck(ampereGPU, cpu, game);
            const rdna2Analysis = calculateBottleneck(rdna2GPU, cpu, game);
            const turingAnalysis = calculateBottleneck(turingGPU, cpu, game);
            const rdnaAnalysis = calculateBottleneck(rdnaGPU, cpu, game);
            const unknownAnalysis = calculateBottleneck(unknownGPU, cpu, game);

            expect(ampereAnalysis.performanceScore).toBeDefined();
            expect(rdna2Analysis.performanceScore).toBeDefined();
            expect(turingAnalysis.performanceScore).toBeDefined();
            expect(rdnaAnalysis.performanceScore).toBeDefined();
            expect(unknownAnalysis.performanceScore).toBeDefined();
        });

        it('should handle various CPU configurations', () => {
            const gpu = createMockGPU();
            const game = createMockGame();

            // Test different core/thread combinations
            const quadCore = createMockCPU({ cores: 4, threads: 4, performanceScore: 60 });
            const hexaCore = createMockCPU({ cores: 6, threads: 12, performanceScore: 70 });
            const octoCore = createMockCPU({ cores: 8, threads: 16, performanceScore: 80 });
            const highEndCPU = createMockCPU({ cores: 24, threads: 32, performanceScore: 95 });

            const quadAnalysis = calculateBottleneck(gpu, quadCore, game);
            const hexaAnalysis = calculateBottleneck(gpu, hexaCore, game);
            const octoAnalysis = calculateBottleneck(gpu, octoCore, game);
            const highEndAnalysis = calculateBottleneck(gpu, highEndCPU, game);

            expect(quadAnalysis.performanceScore).toBeLessThan(hexaAnalysis.performanceScore);
            expect(hexaAnalysis.performanceScore).toBeLessThan(octoAnalysis.performanceScore);
            expect(octoAnalysis.performanceScore).toBeLessThan(highEndAnalysis.performanceScore);
        });

        it('should handle different CPU manufacturers', () => {
            const gpu = createMockGPU({ performanceScore: 50 });
            const game = createMockGame();

            const intelCPU = createMockCPU({ manufacturer: 'Intel', performanceScore: 60 });
            const amdCPU = createMockCPU({ manufacturer: 'AMD', performanceScore: 60 });

            const intelAnalysis = calculateBottleneck(gpu, intelCPU, game);
            const amdAnalysis = calculateBottleneck(gpu, amdCPU, game);

            expect(intelAnalysis.upgradeOptions.length).toBeGreaterThan(0);
            expect(amdAnalysis.upgradeOptions.length).toBeGreaterThan(0);

            // Check that Intel suggestions contain Intel CPUs
            const intelCPUUpgrade = intelAnalysis.upgradeOptions.find(
                opt => opt.component === 'CPU'
            );
            if (intelCPUUpgrade) {
                expect(intelCPUUpgrade.suggestions.some(s => s.includes('Intel'))).toBe(true);
            }

            // Check that AMD suggestions contain AMD CPUs
            const amdCPUUpgrade = amdAnalysis.upgradeOptions.find(opt => opt.component === 'CPU');
            if (amdCPUUpgrade) {
                expect(amdCPUUpgrade.suggestions.some(s => s.includes('AMD'))).toBe(true);
            }
        });

        it('should handle different game types for FPS estimation', () => {
            const gpu = createMockGPU({ performanceScore: 80 });
            const cpu = createMockCPU({ performanceScore: 80 });

            const games = [
                createMockGame({ name: 'Cyberpunk 2077' }),
                createMockGame({ name: 'Red Dead Redemption' }),
                createMockGame({ name: 'Call of Duty' }),
                createMockGame({ name: 'Fortnite' }),
                createMockGame({ name: 'Valorant' }),
                createMockGame({ name: 'Counter-Strike' }),
                createMockGame({ name: 'Apex Legends' }),
                createMockGame({ name: 'Battlefield' }),
                createMockGame({ name: "Assassin's Creed" }),
                createMockGame({ name: 'Witcher' }),
                createMockGame({ name: 'Unknown Game' }),
            ];

            games.forEach(game => {
                const analysis = calculateBottleneck(gpu, cpu, game);
                expect(analysis.expectedFPS).toBeGreaterThan(0);
                expect(analysis.expectedFPS).toBeLessThan(500);
            });
        });

        it('should handle different VRAM configurations', () => {
            const cpu = createMockCPU();
            const game = createMockGame({ recommendedVRAM: 8 });

            const lowVRAM = createMockGPU({ vram: 4 });
            const adequateVRAM = createMockGPU({ vram: 8 });
            const highVRAM = createMockGPU({ vram: 16 });
            const ultraVRAM = createMockGPU({ vram: 32 });

            const lowAnalysis = calculateBottleneck(lowVRAM, cpu, game);
            const adequateAnalysis = calculateBottleneck(adequateVRAM, cpu, game);
            const highAnalysis = calculateBottleneck(highVRAM, cpu, game);
            const ultraAnalysis = calculateBottleneck(ultraVRAM, cpu, game);

            expect(lowAnalysis.performanceScore).toBeLessThan(adequateAnalysis.performanceScore);
            expect(adequateAnalysis.performanceScore).toBeLessThan(highAnalysis.performanceScore);
            expect(highAnalysis.performanceScore).toBeLessThanOrEqual(
                ultraAnalysis.performanceScore
            );
        });
    });

    describe('Clustering Edge Cases', () => {
        it('should handle empty survey data', () => {
            const result = clusterUserProfiles([]);
            expect(result).toEqual([]);
        });

        it('should handle single data point', () => {
            const singleEntry: HardwareSurveyEntry = {
                date: new Date(),
                gpuDistribution: [{ gpuModel: 'RTX 4070', percentage: 100, date: new Date() }],
                cpuDistribution: [{ cpuModel: 'i7-13700K', percentage: 100, date: new Date() }],
                resolutionData: [{ resolution: '1920x1080', percentage: 100, date: new Date() }],
                vramDistribution: [{ memory: '8GB', percentage: 100, date: new Date() }],
            };

            const result = clusterUserProfiles([singleEntry], 1);
            expect(result.length).toBe(1);
            expect(result[0].userCount).toBe(1);
        });

        it('should handle mismatched GPU/CPU distribution lengths', () => {
            const mismatchedEntry: HardwareSurveyEntry = {
                date: new Date(),
                gpuDistribution: [
                    { gpuModel: 'RTX 4070', percentage: 60, date: new Date() },
                    { gpuModel: 'RTX 3060', percentage: 40, date: new Date() },
                ],
                cpuDistribution: [{ cpuModel: 'i7-13700K', percentage: 100, date: new Date() }],
                resolutionData: [],
                vramDistribution: [{ memory: '8GB', percentage: 100, date: new Date() }],
            };

            const result = clusterUserProfiles([mismatchedEntry], 2);
            expect(result.length).toBeGreaterThan(0);
        });

        it('should handle empty VRAM distribution', () => {
            const noVRAMEntry: HardwareSurveyEntry = {
                date: new Date(),
                gpuDistribution: [{ gpuModel: 'RTX 4070', percentage: 100, date: new Date() }],
                cpuDistribution: [{ cpuModel: 'i7-13700K', percentage: 100, date: new Date() }],
                resolutionData: [],
                vramDistribution: [],
            };

            const result = clusterUserProfiles([noVRAMEntry], 1);
            expect(result.length).toBe(1);
        });
    });

    describe('Trend Detection Edge Cases', () => {
        it('should handle single data point gracefully', () => {
            const singlePoint: GPUMarketShare[] = [
                { gpuModel: 'RTX 4070', percentage: 50, date: new Date() },
            ];

            const trends = detectMarketTrends(singlePoint);
            expect(trends.stable).toContain('RTX 4070');
            expect(trends.growing).not.toContain('RTX 4070');
            expect(trends.declining).not.toContain('RTX 4070');
        });

        it('should handle very short timeframes', () => {
            const shortData: GPUMarketShare[] = [
                { gpuModel: 'RTX 4070', percentage: 10, date: new Date('2024-01-01') },
                { gpuModel: 'RTX 4070', percentage: 10.5, date: new Date('2024-01-02') },
            ];

            const trends = detectMarketTrends(shortData);
            expect(trends.timeframe).toBe('1 months');
        });

        it('should handle exactly 12 months timeframe', () => {
            const yearData: GPUMarketShare[] = [
                { gpuModel: 'RTX 4070', percentage: 10, date: new Date('2023-01-01') },
                { gpuModel: 'RTX 4070', percentage: 15, date: new Date('2024-01-01') },
            ];

            const trends = detectMarketTrends(yearData);
            expect(trends.timeframe).toBe('1 year');
        });

        it('should handle multiple years timeframe', () => {
            const multiYearData: GPUMarketShare[] = [
                { gpuModel: 'RTX 4070', percentage: 10, date: new Date('2021-01-01') },
                { gpuModel: 'RTX 4070', percentage: 15, date: new Date('2024-01-01') },
            ];

            const trends = detectMarketTrends(multiYearData);
            expect(trends.timeframe).toBe('3 years');
        });

        it('should handle years with remaining months', () => {
            const mixedTimeData: GPUMarketShare[] = [
                { gpuModel: 'RTX 4070', percentage: 10, date: new Date('2021-01-01') },
                { gpuModel: 'RTX 4070', percentage: 15, date: new Date('2023-07-01') },
            ];

            const trends = detectMarketTrends(mixedTimeData);
            expect(trends.timeframe).toContain('year');
            expect(trends.timeframe).toContain('month');
        });

        it('should handle low confidence trends', () => {
            const noiseData: GPUMarketShare[] = [
                { gpuModel: 'Noisy GPU', percentage: 10, date: new Date('2024-01-01') },
                { gpuModel: 'Noisy GPU', percentage: 10.1, date: new Date('2024-02-01') },
                { gpuModel: 'Noisy GPU', percentage: 9.9, date: new Date('2024-03-01') },
            ];

            const trends = detectMarketTrends(noiseData);
            // Should not identify as fastest growth/decline due to low confidence
            expect(trends.fastestGrowth.model).toBe('None');
            expect(trends.fastestDecline.model).toBe('None');
        });
    });
});
