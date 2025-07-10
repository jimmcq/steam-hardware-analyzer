import { GPUDatabase } from '@/lib/gpu-database/specifications';

describe('GPUDatabase', () => {
    beforeAll(() => {
        // Ensure database is initialized
        GPUDatabase.initialize();
    });

    describe('getGPU', () => {
        it('should return GPU specifications by model', () => {
            const rtx4090 = GPUDatabase.getGPU('RTX 4090');

            expect(rtx4090).toBeDefined();
            expect(rtx4090?.manufacturer).toBe('NVIDIA');
            expect(rtx4090?.tier).toBe('Enthusiast');
            expect(rtx4090?.vram).toBe(24);
            expect(rtx4090?.architecture).toBe('Ada Lovelace');
        });

        it('should return undefined for unknown GPU', () => {
            const unknownGPU = GPUDatabase.getGPU('Unknown GPU');

            expect(unknownGPU).toBeUndefined();
        });
    });

    describe('getGPUsByManufacturer', () => {
        it('should return NVIDIA GPUs', () => {
            const nvidiaGPUs = GPUDatabase.getGPUsByManufacturer('NVIDIA');

            expect(nvidiaGPUs.length).toBeGreaterThan(0);
            nvidiaGPUs.forEach(gpu => {
                expect(gpu.manufacturer).toBe('NVIDIA');
            });
        });

        it('should return AMD GPUs', () => {
            const amdGPUs = GPUDatabase.getGPUsByManufacturer('AMD');

            expect(amdGPUs.length).toBeGreaterThan(0);
            amdGPUs.forEach(gpu => {
                expect(gpu.manufacturer).toBe('AMD');
            });
        });

        it('should return Intel GPUs', () => {
            const intelGPUs = GPUDatabase.getGPUsByManufacturer('Intel');

            expect(intelGPUs.length).toBeGreaterThan(0);
            intelGPUs.forEach(gpu => {
                expect(gpu.manufacturer).toBe('Intel');
            });
        });
    });

    describe('getGPUsByTier', () => {
        it('should return Enthusiast tier GPUs', () => {
            const enthusiastGPUs = GPUDatabase.getGPUsByTier('Enthusiast');

            expect(enthusiastGPUs.length).toBeGreaterThan(0);
            enthusiastGPUs.forEach(gpu => {
                expect(gpu.tier).toBe('Enthusiast');
                expect(gpu.performanceScore).toBeGreaterThanOrEqual(80);
            });
        });

        it('should return High-End tier GPUs', () => {
            const highEndGPUs = GPUDatabase.getGPUsByTier('High-End');

            expect(highEndGPUs.length).toBeGreaterThan(0);
            highEndGPUs.forEach(gpu => {
                expect(gpu.tier).toBe('High-End');
            });
        });

        it('should return Mid-Range tier GPUs', () => {
            const midRangeGPUs = GPUDatabase.getGPUsByTier('Mid-Range');

            expect(midRangeGPUs.length).toBeGreaterThan(0);
            midRangeGPUs.forEach(gpu => {
                expect(gpu.tier).toBe('Mid-Range');
            });
        });

        it('should return Entry tier GPUs', () => {
            const entryGPUs = GPUDatabase.getGPUsByTier('Entry');

            expect(entryGPUs.length).toBeGreaterThan(0);
            entryGPUs.forEach(gpu => {
                expect(gpu.tier).toBe('Entry');
            });
        });
    });

    describe('getGPUsByDateRange', () => {
        it('should return GPUs released in 2022', () => {
            const start2022 = new Date('2022-01-01');
            const end2022 = new Date('2022-12-31');
            const gpus2022 = GPUDatabase.getGPUsByDateRange(start2022, end2022);

            expect(gpus2022.length).toBeGreaterThan(0);
            gpus2022.forEach(gpu => {
                expect(gpu.releaseDate.getFullYear()).toBe(2022);
            });
        });

        it('should return GPUs released in 2023', () => {
            const start2023 = new Date('2023-01-01');
            const end2023 = new Date('2023-12-31');
            const gpus2023 = GPUDatabase.getGPUsByDateRange(start2023, end2023);

            expect(gpus2023.length).toBeGreaterThan(0);
            gpus2023.forEach(gpu => {
                expect(gpu.releaseDate.getFullYear()).toBe(2023);
            });
        });

        it('should return empty array for future date range', () => {
            const futureStart = new Date('2030-01-01');
            const futureEnd = new Date('2030-12-31');
            const futureGPUs = GPUDatabase.getGPUsByDateRange(futureStart, futureEnd);

            expect(futureGPUs).toHaveLength(0);
        });
    });

    describe('getAllGPUs', () => {
        it('should return all GPU specifications', () => {
            const allGPUs = GPUDatabase.getAllGPUs();

            expect(allGPUs.length).toBeGreaterThan(0);
            expect(allGPUs.every(gpu => gpu.model && gpu.manufacturer && gpu.tier)).toBe(true);
        });
    });

    describe('findGPUByName', () => {
        it('should find GPU by exact match', () => {
            const gpu = GPUDatabase.findGPUByName('RTX 4090');

            expect(gpu).toBeDefined();
            expect(gpu?.model).toBe('RTX 4090');
        });

        it('should find GPU by partial match', () => {
            const gpu = GPUDatabase.findGPUByName('4090');

            expect(gpu).toBeDefined();
            expect(gpu?.model).toContain('4090');
        });

        it('should find GPU by case-insensitive match', () => {
            const gpu = GPUDatabase.findGPUByName('rtx 4090');

            expect(gpu).toBeDefined();
            expect(gpu?.model).toBe('RTX 4090');
        });

        it('should return undefined for no match', () => {
            const gpu = GPUDatabase.findGPUByName('NonExistent GPU');

            expect(gpu).toBeUndefined();
        });
    });

    describe('getPerformanceTierDistribution', () => {
        it('should return tier distribution', () => {
            const distribution = GPUDatabase.getPerformanceTierDistribution();

            expect(distribution.size).toBeGreaterThan(0);
            expect(distribution.has('Enthusiast')).toBe(true);
            expect(distribution.has('High-End')).toBe(true);
            expect(distribution.has('Mid-Range')).toBe(true);
            expect(distribution.has('Entry')).toBe(true);

            // Check that counts are positive
            distribution.forEach(count => {
                expect(count).toBeGreaterThan(0);
            });
        });
    });

    describe('getManufacturerDistribution', () => {
        it('should return manufacturer distribution', () => {
            const distribution = GPUDatabase.getManufacturerDistribution();

            expect(distribution.size).toBe(3);
            expect(distribution.has('NVIDIA')).toBe(true);
            expect(distribution.has('AMD')).toBe(true);
            expect(distribution.has('Intel')).toBe(true);

            // Check that counts are positive
            distribution.forEach(count => {
                expect(count).toBeGreaterThan(0);
            });

            // NVIDIA should have the most GPUs in our database
            const nvidiaCount = distribution.get('NVIDIA')!;
            const amdCount = distribution.get('AMD')!;
            const intelCount = distribution.get('Intel')!;

            expect(nvidiaCount).toBeGreaterThanOrEqual(amdCount);
            expect(intelCount).toBeLessThan(nvidiaCount);
        });
    });

    describe('Performance Score Validation', () => {
        it('should have performance scores in correct ranges by tier', () => {
            const allGPUs = GPUDatabase.getAllGPUs();

            allGPUs.forEach(gpu => {
                switch (gpu.tier) {
                    case 'Enthusiast':
                        expect(gpu.performanceScore).toBeGreaterThanOrEqual(80);
                        break;
                    case 'High-End':
                        expect(gpu.performanceScore).toBeGreaterThanOrEqual(60);
                        expect(gpu.performanceScore).toBeLessThan(90);
                        break;
                    case 'Mid-Range':
                        expect(gpu.performanceScore).toBeGreaterThanOrEqual(40);
                        expect(gpu.performanceScore).toBeLessThan(70);
                        break;
                    case 'Entry':
                        expect(gpu.performanceScore).toBeGreaterThanOrEqual(20);
                        expect(gpu.performanceScore).toBeLessThan(60);
                        break;
                }
            });
        });
    });

    describe('VRAM Validation', () => {
        it('should have reasonable VRAM amounts', () => {
            const allGPUs = GPUDatabase.getAllGPUs();

            allGPUs.forEach(gpu => {
                expect(gpu.vram).toBeGreaterThan(0);
                expect(gpu.vram).toBeLessThanOrEqual(24);
                expect([4, 6, 8, 10, 12, 16, 20, 24]).toContain(gpu.vram);
            });
        });
    });

    describe('Release Date Validation', () => {
        it('should have reasonable release dates', () => {
            const allGPUs = GPUDatabase.getAllGPUs();
            const minDate = new Date('2020-01-01');
            const maxDate = new Date('2024-12-31');

            allGPUs.forEach(gpu => {
                expect(gpu.releaseDate.getTime()).toBeGreaterThanOrEqual(minDate.getTime());
                expect(gpu.releaseDate.getTime()).toBeLessThanOrEqual(maxDate.getTime());
            });
        });
    });
});