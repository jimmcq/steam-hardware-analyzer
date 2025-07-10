import { clusterUserProfiles } from '@/lib/algorithms/clustering';
import { HardwareSurveyEntry } from '@/types';

describe('User Profile Clustering', () => {
    const createMockSurveyEntry = (
        gpus: Array<{ model: string; percentage: number }>,
        cpus: Array<{ model: string; percentage: number }>
    ): HardwareSurveyEntry => ({
        date: new Date('2024-01-01'),
        gpuDistribution: gpus.map(gpu => ({
            gpuModel: gpu.model,
            percentage: gpu.percentage,
            date: new Date('2024-01-01'),
        })),
        cpuDistribution: cpus.map(cpu => ({
            cpuModel: cpu.model,
            percentage: cpu.percentage,
            date: new Date('2024-01-01'),
        })),
        resolutionData: [],
        vramDistribution: [{ memory: '8GB', percentage: 50, date: new Date('2024-01-01') }],
    });

    it('should return empty array for empty input', () => {
        const result = clusterUserProfiles([]);
        expect(result).toEqual([]);
    });

    it('should create clusters for diverse hardware profiles', () => {
        const surveyData = [
            createMockSurveyEntry(
                [
                    { model: 'RTX 4090', percentage: 10 },
                    { model: 'RTX 3060', percentage: 20 },
                ],
                [
                    { model: 'i9-13900K', percentage: 15 },
                    { model: 'i5-12400', percentage: 15 },
                ]
            ),
            createMockSurveyEntry(
                [
                    { model: 'RTX 4080', percentage: 15 },
                    { model: 'GTX 1660', percentage: 25 },
                ],
                [
                    { model: 'i7-13700K', percentage: 20 },
                    { model: 'i3-10100', percentage: 20 },
                ]
            ),
        ];

        const clusters = clusterUserProfiles(surveyData, 3);

        expect(clusters).toBeDefined();
        expect(clusters.length).toBeGreaterThan(0);
        expect(clusters.length).toBeLessThanOrEqual(3);

        clusters.forEach(cluster => {
            expect(cluster.id).toBeDefined();
            expect(cluster.name).toBeDefined();
            expect(cluster.avgPerformanceScore).toBeGreaterThanOrEqual(0);
            expect(cluster.avgPerformanceScore).toBeLessThanOrEqual(100);
            expect(cluster.commonGPUs).toBeDefined();
            expect(cluster.commonCPUs).toBeDefined();
            expect(cluster.userCount).toBeGreaterThan(0);
            expect(cluster.percentage).toBeGreaterThanOrEqual(0);
        });
    });

    it('should assign appropriate cluster names based on performance', () => {
        const highEndData = [
            createMockSurveyEntry(
                [{ model: 'RTX 4090', percentage: 50 }],
                [{ model: 'i9-13900K', percentage: 50 }]
            ),
        ];

        const clusters = clusterUserProfiles(highEndData, 2);
        const highEndCluster = clusters.find(c => c.avgPerformanceScore > 80);

        if (highEndCluster) {
            expect(['Enthusiast Gamers', 'High-End Users']).toContain(highEndCluster.name);
        }
    });

    it('should handle single GPU/CPU entries', () => {
        const singleEntryData = [
            createMockSurveyEntry(
                [{ model: 'RTX 4070', percentage: 100 }],
                [{ model: 'i7-13700K', percentage: 100 }]
            ),
        ];

        const clusters = clusterUserProfiles(singleEntryData, 1);

        expect(clusters.length).toBe(1);
        expect(clusters[0].userCount).toBe(1);
        expect(clusters[0].commonGPUs).toContain('RTX 4070');
        expect(clusters[0].commonCPUs).toContain('i7-13700K');
    });

    it('should filter out empty clusters', () => {
        const sparseData = [
            createMockSurveyEntry(
                [{ model: 'RTX 4060', percentage: 5 }],
                [{ model: 'i5-13600K', percentage: 5 }]
            ),
        ];

        const clusters = clusterUserProfiles(sparseData, 5);

        clusters.forEach(cluster => {
            expect(cluster.userCount).toBeGreaterThan(0);
        });
    });

    it('should handle k value larger than data points', () => {
        const smallData = [
            createMockSurveyEntry(
                [{ model: 'RTX 4070', percentage: 50 }],
                [{ model: 'i7-13700K', percentage: 50 }]
            ),
        ];

        const clusters = clusterUserProfiles(smallData, 10);

        expect(clusters.length).toBeLessThanOrEqual(smallData.length);
    });

    it('should maintain consistency across multiple runs', () => {
        const testData = [
            createMockSurveyEntry(
                [
                    { model: 'RTX 4070', percentage: 30 },
                    { model: 'RTX 3060', percentage: 40 },
                ],
                [
                    { model: 'i7-13700K', percentage: 35 },
                    { model: 'i5-12400', percentage: 35 },
                ]
            ),
            createMockSurveyEntry(
                [
                    { model: 'RTX 4080', percentage: 20 },
                    { model: 'GTX 1660', percentage: 30 },
                ],
                [
                    { model: 'i9-13900K', percentage: 25 },
                    { model: 'i3-10100', percentage: 25 },
                ]
            ),
        ];

        const clusters1 = clusterUserProfiles(testData, 3);
        const clusters2 = clusterUserProfiles(testData, 3);

        // Allow for some variation in clustering due to randomness
        expect(Math.abs(clusters1.length - clusters2.length)).toBeLessThanOrEqual(1);

        const totalUsers1 = clusters1.reduce((sum, c) => sum + c.userCount, 0);
        const totalUsers2 = clusters2.reduce((sum, c) => sum + c.userCount, 0);
        expect(totalUsers1).toBe(totalUsers2);
    });
});
