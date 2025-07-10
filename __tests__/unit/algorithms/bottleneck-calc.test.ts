import { calculateBottleneck } from '@/lib/algorithms/bottleneck-calc';
import { GPUData, CPUData } from '@/types/hardware';
import { GameRequirements } from '@/types/steam-data';

describe('Bottleneck Calculation', () => {
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
        gameId: 'cyberpunk2077',
        name: 'Cyberpunk 2077',
        minimumGPU: 'GTX 1060',
        recommendedGPU: 'RTX 3070',
        minimumCPU: 'i5-3570K',
        recommendedCPU: 'i7-4790',
        minimumRAM: 8,
        recommendedRAM: 12,
        minimumVRAM: 3,
        recommendedVRAM: 8,
        ...overrides,
    });

    it('should identify GPU bottleneck correctly', () => {
        const weakGPU = createMockGPU({ performanceScore: 30, vram: 4 });
        const strongCPU = createMockCPU({ performanceScore: 95 });
        const demandingGame = createMockGame({ recommendedVRAM: 8 });

        const analysis = calculateBottleneck(weakGPU, strongCPU, demandingGame);

        expect(['GPU', 'Memory']).toContain(analysis.bottleneckType);
        expect(analysis.configuration.gpu).toEqual(weakGPU);
        expect(analysis.configuration.cpu).toEqual(strongCPU);
        expect(analysis.targetGame).toEqual(demandingGame);
        expect(analysis.recommendations.some(rec => /GPU|graphics|VRAM/i.test(rec))).toBe(true);
    });

    it('should identify CPU bottleneck correctly', () => {
        const strongGPU = createMockGPU({ performanceScore: 95, vram: 16 });
        const weakCPU = createMockCPU({ performanceScore: 35, cores: 4, threads: 4 });
        const game = createMockGame();

        const analysis = calculateBottleneck(strongGPU, weakCPU, game);

        expect(analysis.bottleneckType).toBe('CPU');
        expect(analysis.recommendations.some(rec => /CPU.*limiting/i.test(rec))).toBe(true);
    });

    it('should identify memory bottleneck correctly', () => {
        const lowVRAMGPU = createMockGPU({ performanceScore: 85, vram: 4 });
        const strongCPU = createMockCPU({ performanceScore: 90 });
        const vramHungryGame = createMockGame({ recommendedVRAM: 12 });

        const analysis = calculateBottleneck(lowVRAMGPU, strongCPU, vramHungryGame);

        expect(analysis.bottleneckType).toBe('Memory');
        expect(analysis.recommendations.some(rec => /VRAM.*performance/i.test(rec))).toBe(true);
    });

    it('should detect no bottleneck for balanced system', () => {
        const balancedGPU = createMockGPU({ performanceScore: 90, vram: 12 });
        const balancedCPU = createMockCPU({ performanceScore: 90 });
        const moderateGame = createMockGame({ recommendedVRAM: 8 });

        const analysis = calculateBottleneck(balancedGPU, balancedCPU, moderateGame);

        expect(analysis.bottleneckType).toBe('None');
        expect(analysis.recommendations.some(rec => /well-balanced/i.test(rec))).toBe(true);
    });

    it('should calculate performance score correctly', () => {
        const gpu = createMockGPU({ performanceScore: 80 });
        const cpu = createMockCPU({ performanceScore: 70 });
        const game = createMockGame();

        const analysis = calculateBottleneck(gpu, cpu, game);

        expect(analysis.performanceScore).toBeGreaterThan(0);
        expect(analysis.performanceScore).toBeLessThanOrEqual(100);
    });

    it('should estimate realistic FPS values', () => {
        const gpu = createMockGPU({ performanceScore: 85 });
        const cpu = createMockCPU({ performanceScore: 80 });
        const game = createMockGame({ name: 'Counter-Strike 2' });

        const analysis = calculateBottleneck(gpu, cpu, game);

        expect(analysis.expectedFPS).toBeGreaterThan(0);
        expect(analysis.expectedFPS).toBeLessThan(500);
    });

    it('should provide relevant recommendations', () => {
        const weakGPU = createMockGPU({ performanceScore: 45 });
        const decentCPU = createMockCPU({ performanceScore: 70 });
        const game = createMockGame();

        const analysis = calculateBottleneck(weakGPU, decentCPU, game);

        expect(analysis.recommendations.length).toBeGreaterThan(0);
        expect(
            analysis.recommendations.some(
                rec => rec.toLowerCase().includes('gpu') || rec.toLowerCase().includes('graphics')
            )
        ).toBe(true);
    });

    it('should suggest appropriate upgrades', () => {
        const oldGPU = createMockGPU({ performanceScore: 50, vram: 6 });
        const oldCPU = createMockCPU({ performanceScore: 60 });
        const modernGame = createMockGame({ recommendedVRAM: 10 });

        const analysis = calculateBottleneck(oldGPU, oldCPU, modernGame);

        expect(analysis.upgradeOptions.length).toBeGreaterThan(0);

        const gpuUpgrade = analysis.upgradeOptions.find(opt => opt.component === 'GPU');
        expect(gpuUpgrade).toBeDefined();
        expect(gpuUpgrade?.suggestions.length).toBeGreaterThan(0);
        expect(gpuUpgrade?.expectedImprovement).toBeGreaterThan(0);
    });

    it('should handle edge cases with very low performance', () => {
        const veryWeakGPU = createMockGPU({ performanceScore: 10, vram: 2 });
        const veryWeakCPU = createMockCPU({ performanceScore: 15, cores: 2, threads: 2 });
        const demandingGame = createMockGame({ recommendedVRAM: 16 });

        const analysis = calculateBottleneck(veryWeakGPU, veryWeakCPU, demandingGame);

        expect(['GPU', 'CPU', 'Memory']).toContain(analysis.bottleneckType);
        expect(analysis.performanceScore).toBeGreaterThanOrEqual(0);
        expect(analysis.upgradeOptions.length).toBeGreaterThan(0);
    });

    it('should handle high-end configurations appropriately', () => {
        const topTierGPU = createMockGPU({ performanceScore: 100, vram: 24 });
        const topTierCPU = createMockCPU({ performanceScore: 100, cores: 24, threads: 32 });
        const lightGame = createMockGame({ name: 'Valorant', recommendedVRAM: 4 });

        const analysis = calculateBottleneck(topTierGPU, topTierCPU, lightGame);

        expect(analysis.bottleneckType).toBe('None');
        expect(analysis.performanceScore).toBeGreaterThan(90);
        expect(
            analysis.recommendations.some(rec =>
                /increase.*settings|ray tracing|enhanced features/i.test(rec)
            )
        ).toBe(true);
    });

    it('should respect VRAM requirements in calculations', () => {
        const adequateGPU = createMockGPU({ performanceScore: 80, vram: 12 });
        const inadequateGPU = createMockGPU({ performanceScore: 80, vram: 4 });
        const cpu = createMockCPU({ performanceScore: 80 });
        const vramHeavyGame = createMockGame({ recommendedVRAM: 10 });

        const adequateAnalysis = calculateBottleneck(adequateGPU, cpu, vramHeavyGame);
        const inadequateAnalysis = calculateBottleneck(inadequateGPU, cpu, vramHeavyGame);

        expect(adequateAnalysis.performanceScore).toBeGreaterThan(
            inadequateAnalysis.performanceScore
        );
    });

    it('should consider CPU core count in performance calculation', () => {
        const quadCoreStrongCPU = createMockCPU({
            performanceScore: 85,
            cores: 4,
            threads: 8,
        });
        const octoCoreWeakCPU = createMockCPU({
            performanceScore: 70,
            cores: 8,
            threads: 16,
        });
        const gpu = createMockGPU({ performanceScore: 80 });
        const game = createMockGame();

        const quadCoreAnalysis = calculateBottleneck(gpu, quadCoreStrongCPU, game);
        const octoCoreAnalysis = calculateBottleneck(gpu, octoCoreWeakCPU, game);

        expect(octoCoreAnalysis.performanceScore).toBeGreaterThanOrEqual(
            quadCoreAnalysis.performanceScore - 10
        );
    });
});

expect.extend({
    toBeOneOf(received, expected) {
        const pass = expected.includes(received);
        if (pass) {
            return {
                message: () => `expected ${received} not to be one of ${expected}`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected ${received} to be one of ${expected}`,
                pass: false,
            };
        }
    },
});
