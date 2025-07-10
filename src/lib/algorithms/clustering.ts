import { HardwareSurveyEntry, UserCluster } from '../../types';

interface ClusterPoint {
    gpuPerformance: number;
    cpuPerformance: number;
    memoryTier: number;
    userId: string;
}

export function clusterUserProfiles(
    surveyData: HardwareSurveyEntry[],
    k: number = 5
): UserCluster[] {
    if (surveyData.length === 0) {
        return [];
    }

    const points = extractClusterPoints(surveyData);
    if (points.length === 0) {
        return [];
    }

    const clusters = performKMeansClustering(points, k);
    return formatClusters(clusters, surveyData);
}

function extractClusterPoints(surveyData: HardwareSurveyEntry[]): ClusterPoint[] {
    const points: ClusterPoint[] = [];

    surveyData.forEach((entry, entryIndex) => {
        entry.gpuDistribution.forEach((gpu, gpuIndex) => {
            const cpuData = entry.cpuDistribution[gpuIndex] || entry.cpuDistribution[0];
            const memoryData = entry.vramDistribution[0] || { memory: '8GB', percentage: 50 };

            points.push({
                gpuPerformance: estimateGPUPerformance(gpu.gpuModel),
                cpuPerformance: estimateCPUPerformance(cpuData?.cpuModel || 'Unknown'),
                memoryTier: parseMemoryTier(memoryData.memory),
                userId: `${entryIndex}-${gpuIndex}`,
            });
        });
    });

    return points;
}

function performKMeansClustering(points: ClusterPoint[], k: number): ClusterPoint[][] {
    const maxIterations = 100;
    const tolerance = 1e-4;

    let centroids = initializeCentroids(points, k);
    let clusters: ClusterPoint[][] = [];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        clusters = assignPointsToClusters(points, centroids);
        const newCentroids = calculateNewCentroids(clusters);

        if (centroidsConverged(centroids, newCentroids, tolerance)) {
            break;
        }

        centroids = newCentroids;
    }

    return clusters;
}

function initializeCentroids(points: ClusterPoint[], k: number): ClusterPoint[] {
    const centroids: ClusterPoint[] = [];

    for (let i = 0; i < k; i++) {
        const randomIndex = Math.floor(Math.random() * points.length);
        centroids.push({ ...points[randomIndex], userId: `centroid-${i}` });
    }

    return centroids;
}

function assignPointsToClusters(
    points: ClusterPoint[],
    centroids: ClusterPoint[]
): ClusterPoint[][] {
    const clusters: ClusterPoint[][] = Array(centroids.length)
        .fill(null)
        .map(() => []);

    points.forEach(point => {
        let closestCentroidIndex = 0;
        let minDistance = calculateDistance(point, centroids[0]);

        for (let i = 1; i < centroids.length; i++) {
            const distance = calculateDistance(point, centroids[i]);
            if (distance < minDistance) {
                minDistance = distance;
                closestCentroidIndex = i;
            }
        }

        clusters[closestCentroidIndex].push(point);
    });

    return clusters;
}

function calculateDistance(point1: ClusterPoint, point2: ClusterPoint): number {
    const gpuDiff = point1.gpuPerformance - point2.gpuPerformance;
    const cpuDiff = point1.cpuPerformance - point2.cpuPerformance;
    const memoryDiff = point1.memoryTier - point2.memoryTier;

    return Math.sqrt(gpuDiff * gpuDiff + cpuDiff * cpuDiff + memoryDiff * memoryDiff);
}

function calculateNewCentroids(clusters: ClusterPoint[][]): ClusterPoint[] {
    return clusters.map((cluster, index) => {
        if (cluster.length === 0) {
            return {
                gpuPerformance: 0,
                cpuPerformance: 0,
                memoryTier: 0,
                userId: `empty-centroid-${index}`,
            };
        }

        const avgGpuPerf =
            cluster.reduce((sum, point) => sum + point.gpuPerformance, 0) / cluster.length;
        const avgCpuPerf =
            cluster.reduce((sum, point) => sum + point.cpuPerformance, 0) / cluster.length;
        const avgMemory =
            cluster.reduce((sum, point) => sum + point.memoryTier, 0) / cluster.length;

        return {
            gpuPerformance: avgGpuPerf,
            cpuPerformance: avgCpuPerf,
            memoryTier: avgMemory,
            userId: `centroid-${index}`,
        };
    });
}

function centroidsConverged(old: ClusterPoint[], new_: ClusterPoint[], tolerance: number): boolean {
    if (old.length !== new_.length) return false;

    for (let i = 0; i < old.length; i++) {
        const distance = calculateDistance(old[i], new_[i]);
        if (distance > tolerance) return false;
    }

    return true;
}

function formatClusters(
    clusters: ClusterPoint[][],
    surveyData: HardwareSurveyEntry[]
): UserCluster[] {
    return clusters
        .map((cluster, index) => {
            const avgPerformance =
                cluster.length > 0
                    ? cluster.reduce(
                          (sum, point) => sum + point.gpuPerformance + point.cpuPerformance,
                          0
                      ) /
                      (cluster.length * 2)
                    : 0;

            const clusterName = getClusterName(avgPerformance);
            const totalUsers = surveyData.reduce(
                (sum, entry) =>
                    sum +
                    entry.gpuDistribution.reduce(
                        (gpuSum, gpu) => gpuSum + (gpu.percentage || 1),
                        0
                    ),
                0
            );

            return {
                id: `cluster-${index}`,
                name: clusterName,
                avgPerformanceScore: avgPerformance,
                commonGPUs: extractCommonGPUs(cluster, surveyData),
                commonCPUs: extractCommonCPUs(cluster, surveyData),
                userCount: cluster.length,
                percentage: totalUsers > 0 ? (cluster.length / totalUsers) * 100 : 0,
            };
        })
        .filter(cluster => cluster.userCount > 0);
}

function getClusterName(avgPerformance: number): string {
    if (avgPerformance >= 80) return 'Enthusiast Gamers';
    if (avgPerformance >= 60) return 'High-End Users';
    if (avgPerformance >= 40) return 'Mid-Range Gaming';
    if (avgPerformance >= 20) return 'Budget Gaming';
    return 'Entry-Level Users';
}

function extractCommonGPUs(cluster: ClusterPoint[], surveyData: HardwareSurveyEntry[]): string[] {
    const gpuCounts: { [key: string]: number } = {};

    surveyData.forEach(entry => {
        entry.gpuDistribution.forEach(gpu => {
            gpuCounts[gpu.gpuModel] = (gpuCounts[gpu.gpuModel] || 0) + (gpu.percentage || 1);
        });
    });

    return Object.entries(gpuCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([model]) => model);
}

function extractCommonCPUs(cluster: ClusterPoint[], surveyData: HardwareSurveyEntry[]): string[] {
    const cpuCounts: { [key: string]: number } = {};

    surveyData.forEach(entry => {
        entry.cpuDistribution.forEach(cpu => {
            cpuCounts[cpu.cpuModel] = (cpuCounts[cpu.cpuModel] || 0) + (cpu.percentage || 1);
        });
    });

    return Object.entries(cpuCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([model]) => model);
}

function estimateGPUPerformance(gpuModel: string): number {
    const model = gpuModel.toLowerCase();

    if (model.includes('rtx 4090')) return 100;
    if (model.includes('rtx 4080')) return 95;
    if (model.includes('rtx 4070')) return 85;
    if (model.includes('rtx 4060')) return 75;
    if (model.includes('rtx 3090')) return 90;
    if (model.includes('rtx 3080')) return 88;
    if (model.includes('rtx 3070')) return 80;
    if (model.includes('rtx 3060')) return 70;
    if (model.includes('rx 7900')) return 92;
    if (model.includes('rx 7800')) return 82;
    if (model.includes('rx 7700')) return 78;
    if (model.includes('rx 6900')) return 85;
    if (model.includes('rx 6800')) return 83;
    if (model.includes('rx 6700')) return 75;
    if (model.includes('rx 6600')) return 65;
    if (model.includes('gtx 1660')) return 55;
    if (model.includes('gtx 1650')) return 45;
    if (model.includes('gtx 1060')) return 50;

    return 40;
}

function estimateCPUPerformance(cpuModel: string): number {
    const model = cpuModel.toLowerCase();

    if (model.includes('i9') || model.includes('ryzen 9')) return 95;
    if (model.includes('i7') || model.includes('ryzen 7')) return 85;
    if (model.includes('i5') || model.includes('ryzen 5')) return 75;
    if (model.includes('i3') || model.includes('ryzen 3')) return 60;

    return 50;
}

function parseMemoryTier(memory: string): number {
    const memoryValue = parseInt(memory.replace(/[^0-9]/g, ''), 10);

    if (memoryValue >= 32) return 4;
    if (memoryValue >= 16) return 3;
    if (memoryValue >= 8) return 2;
    if (memoryValue >= 4) return 1;

    return 0;
}
