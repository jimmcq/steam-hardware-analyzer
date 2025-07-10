import { SteamSurveyData, HardwareSurveyEntry, TimeSeriesData } from '@/types';

/**
 * Mock data generator for testing and development
 */
export class MockDataGenerator {
    private static readonly POPULAR_GPUS = [
        'RTX 4090',
        'RTX 4080',
        'RTX 4070 Ti',
        'RTX 4070',
        'RTX 4060 Ti',
        'RTX 4060',
        'RTX 3080',
        'RTX 3070',
        'RTX 3060 Ti',
        'RTX 3060',
        'RX 7900 XTX',
        'RX 7900 XT',
        'RX 7800 XT',
        'RX 7700 XT',
        'RX 6800 XT',
        'RX 6700 XT',
        'RX 6600 XT',
        'Intel Arc A770',
        'Intel Arc A750',
    ];

    private static readonly POPULAR_CPUS = [
        'Intel Core i9-13900K',
        'Intel Core i7-13700K',
        'Intel Core i5-13600K',
        'Intel Core i9-12900K',
        'Intel Core i7-12700K',
        'Intel Core i5-12600K',
        'AMD Ryzen 9 7950X',
        'AMD Ryzen 9 7900X',
        'AMD Ryzen 7 7700X',
        'AMD Ryzen 5 7600X',
        'AMD Ryzen 9 5950X',
        'AMD Ryzen 9 5900X',
        'AMD Ryzen 7 5800X',
        'AMD Ryzen 5 5600X',
    ];

    private static readonly RESOLUTIONS = [
        '1920 x 1080',
        '2560 x 1440',
        '3840 x 2160',
        '1680 x 1050',
        '1366 x 768',
    ];

    private static readonly MEMORY_SIZES = ['8 GB', '16 GB', '32 GB', '64 GB', '4 GB', '12 GB'];

    /**
     * Generate mock Steam survey data for a specific date
     */
    static generateSteamSurveyData(date: Date): SteamSurveyData {
        const surveyDate = date.toISOString().split('T')[0];
        const totalParticipants = Math.floor(Math.random() * 1000000) + 5000000;

        return {
            surveyDate,
            totalParticipants,
            graphics: this.generateGPUDistribution(date),
            processors: this.generateCPUDistribution(date),
            memory: this.generateMemoryDistribution(),
            resolution: this.generateResolutionDistribution(),
        };
    }

    /**
     * Generate GPU distribution with realistic market share
     */
    private static generateGPUDistribution(date: Date): SteamSurveyData['graphics'] {
        const distribution: SteamSurveyData['graphics'] = {};
        let remainingPercentage = 100;

        // Simulate market trends based on date
        const isRecent = date.getTime() > new Date('2023-01-01').getTime();
        const gpuList = isRecent ? this.POPULAR_GPUS : this.POPULAR_GPUS.slice(5);

        gpuList.forEach((gpu, index) => {
            if (remainingPercentage <= 0) return;

            // Create realistic distribution with diminishing returns
            const basePercentage = Math.max(0.1, 15 / Math.pow(index + 1, 0.8));
            let percentage = Math.min(
                remainingPercentage,
                basePercentage * (0.8 + Math.random() * 0.4)
            );

            // Add some variation for newer GPUs
            if (isRecent && gpu.includes('RTX 4')) {
                percentage *= 1.2;
            }

            if (percentage > 0.1) {
                distribution[gpu] = {
                    percentage: Math.round(percentage * 100) / 100,
                    change: (Math.random() - 0.5) * 2,
                };
                remainingPercentage -= percentage;
            }
        });

        // Add "Other" category for remaining percentage
        if (remainingPercentage > 0) {
            distribution['Other'] = {
                percentage: Math.round(remainingPercentage * 100) / 100,
                change: (Math.random() - 0.5) * 0.5,
            };
        }

        return distribution;
    }

    /**
     * Generate CPU distribution with realistic market share
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private static generateCPUDistribution(_date: Date): SteamSurveyData['processors'] {
        const distribution: SteamSurveyData['processors'] = {};
        let remainingPercentage = 100;

        this.POPULAR_CPUS.forEach((cpu, index) => {
            if (remainingPercentage <= 0) return;

            const basePercentage = Math.max(0.1, 12 / Math.pow(index + 1, 0.9));
            const percentage = Math.min(
                remainingPercentage,
                basePercentage * (0.8 + Math.random() * 0.4)
            );

            if (percentage > 0.1) {
                distribution[cpu] = {
                    percentage: Math.round(percentage * 100) / 100,
                    change: (Math.random() - 0.5) * 1.5,
                };
                remainingPercentage -= percentage;
            }
        });

        if (remainingPercentage > 0) {
            distribution['Other'] = {
                percentage: Math.round(remainingPercentage * 100) / 100,
                change: (Math.random() - 0.5) * 0.3,
            };
        }

        return distribution;
    }

    /**
     * Generate memory distribution
     */
    private static generateMemoryDistribution(): SteamSurveyData['memory'] {
        const distribution: SteamSurveyData['memory'] = {};
        const weights = [45, 35, 15, 3, 1.5, 0.5]; // Realistic memory distribution

        this.MEMORY_SIZES.forEach((memory, index) => {
            const percentage = weights[index] || 0;
            distribution[memory] = {
                percentage,
                change: (Math.random() - 0.5) * 1,
            };
        });

        return distribution;
    }

    /**
     * Generate resolution distribution
     */
    private static generateResolutionDistribution(): SteamSurveyData['resolution'] {
        const distribution: SteamSurveyData['resolution'] = {};
        const weights = [65, 25, 8, 1.5, 0.5]; // 1080p dominance

        this.RESOLUTIONS.forEach((resolution, index) => {
            const percentage = weights[index] || 0;
            distribution[resolution] = {
                percentage,
                change: (Math.random() - 0.5) * 0.8,
            };
        });

        return distribution;
    }

    /**
     * Generate hardware survey data for a specified number of months
     */
    static generateHardwareSurveyData(months: number): HardwareSurveyEntry[] {
        const entries: HardwareSurveyEntry[] = [];
        const currentDate = new Date();
        currentDate.setMonth(currentDate.getMonth() - months);

        for (let i = 0; i < months; i++) {
            const entryDate = new Date(currentDate);
            entryDate.setMonth(entryDate.getMonth() + i);

            const surveyData = this.generateSteamSurveyData(entryDate);
            entries.push(this.convertToHardwareSurveyEntry(surveyData));
        }

        return entries;
    }

    /**
     * Generate multiple survey entries over time
     */
    static generateMultipleSurveyEntries(
        startDate: Date,
        endDate: Date,
        intervalDays: number = 30
    ): HardwareSurveyEntry[] {
        const entries: HardwareSurveyEntry[] = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const surveyData = this.generateSteamSurveyData(currentDate);
            entries.push(this.convertToHardwareSurveyEntry(surveyData));
            currentDate.setDate(currentDate.getDate() + intervalDays);
        }

        return entries;
    }

    /**
     * Convert SteamSurveyData to HardwareSurveyEntry
     */
    private static convertToHardwareSurveyEntry(surveyData: SteamSurveyData): HardwareSurveyEntry {
        const date = new Date(surveyData.surveyDate);

        return {
            date,
            gpuDistribution: Object.entries(surveyData.graphics).map(([gpuModel, data]) => ({
                gpuModel,
                percentage: data.percentage,
                date,
            })),
            cpuDistribution: Object.entries(surveyData.processors).map(([cpuModel, data]) => ({
                cpuModel,
                percentage: data.percentage,
                date,
            })),
            resolutionData: Object.entries(surveyData.resolution).map(([resolution, data]) => ({
                resolution,
                percentage: data.percentage,
                date,
            })),
            vramDistribution: Object.entries(surveyData.memory).map(([memory, data]) => ({
                memory,
                percentage: data.percentage,
                date,
            })),
        };
    }

    /**
     * Generate time series data for a specific GPU
     */
    static generateGPUTimeSeries(
        gpuModel: string,
        startDate: Date,
        endDate: Date,
        intervalDays: number = 30
    ): TimeSeriesData[] {
        const timeSeries: TimeSeriesData[] = [];
        const currentDate = new Date(startDate);

        // Base popularity for the GPU (0-20%)
        const baseValue = Math.random() * 15 + 1;

        // Add trend based on GPU type
        let trendDirection = 0;
        if (gpuModel.includes('RTX 4')) {
            trendDirection = 0.1; // Growing
        } else if (gpuModel.includes('RTX 3')) {
            trendDirection = -0.05; // Declining
        }

        while (currentDate <= endDate) {
            // Add some noise and trend
            const noise = (Math.random() - 0.5) * 2;
            const trendValue = trendDirection * timeSeries.length;
            const value = Math.max(0.1, baseValue + trendValue + noise);

            timeSeries.push({
                date: new Date(currentDate),
                value: Math.round(value * 100) / 100,
            });

            currentDate.setDate(currentDate.getDate() + intervalDays);
        }

        return timeSeries;
    }

    /**
     * Generate sparse data with missing entries
     */
    static generateSparseData(
        startDate: Date,
        endDate: Date,
        missingProbability: number = 0.3
    ): HardwareSurveyEntry[] {
        const allEntries = this.generateMultipleSurveyEntries(startDate, endDate);

        return allEntries.filter(() => Math.random() > missingProbability);
    }

    /**
     * Generate data with outliers for testing robustness
     */
    static generateDataWithOutliers(
        startDate: Date,
        endDate: Date,
        outlierProbability: number = 0.1
    ): HardwareSurveyEntry[] {
        const entries = this.generateMultipleSurveyEntries(startDate, endDate);

        return entries.map(entry => {
            if (Math.random() < outlierProbability) {
                // Add outlier to random GPU
                const randomGPU =
                    entry.gpuDistribution[Math.floor(Math.random() * entry.gpuDistribution.length)];
                if (randomGPU) {
                    randomGPU.percentage *= 3; // Create outlier
                }
            }
            return entry;
        });
    }

    /**
     * Generate test data for specific scenarios
     */
    static generateTestScenario(
        scenario: 'growth' | 'decline' | 'stable' | 'volatile'
    ): TimeSeriesData[] {
        const data: TimeSeriesData[] = [];
        const startDate = new Date('2023-01-01');
        const baseValue = 10;

        for (let i = 0; i < 12; i++) {
            const date = new Date(startDate);
            date.setMonth(date.getMonth() + i);

            let value = baseValue;

            switch (scenario) {
                case 'growth':
                    value = baseValue + i * 0.5;
                    break;
                case 'decline':
                    value = baseValue - i * 0.3;
                    break;
                case 'stable':
                    value = baseValue + (Math.random() - 0.5) * 0.5;
                    break;
                case 'volatile':
                    value = baseValue + (Math.random() - 0.5) * 5;
                    break;
            }

            data.push({
                date,
                value: Math.max(0.1, value),
            });
        }

        return data;
    }
}
