import { HardwareSurveyEntry, GPUMarketShare, TimeSeriesData } from '@/types';

/**
 * Aggregates and processes normalized hardware survey data
 */
export class DataAggregator {
    /**
     * Aggregates GPU market share data across multiple survey entries
     */
    static aggregateGPUMarketShare(entries: HardwareSurveyEntry[]): Map<string, TimeSeriesData[]> {
        const gpuData = new Map<string, TimeSeriesData[]>();

        entries.forEach(entry => {
            entry.gpuDistribution.forEach(gpu => {
                if (!gpuData.has(gpu.gpuModel)) {
                    gpuData.set(gpu.gpuModel, []);
                }
                gpuData.get(gpu.gpuModel)!.push({
                    date: entry.date,
                    value: gpu.percentage,
                });
            });
        });

        // Sort time series data by date
        gpuData.forEach(timeSeries => {
            timeSeries.sort((a, b) => a.date.getTime() - b.date.getTime());
        });

        return gpuData;
    }

    /**
     * Aggregates CPU market share data across multiple survey entries
     */
    static aggregateCPUMarketShare(entries: HardwareSurveyEntry[]): Map<string, TimeSeriesData[]> {
        const cpuData = new Map<string, TimeSeriesData[]>();

        entries.forEach(entry => {
            entry.cpuDistribution.forEach(cpu => {
                if (!cpuData.has(cpu.cpuModel)) {
                    cpuData.set(cpu.cpuModel, []);
                }
                cpuData.get(cpu.cpuModel)!.push({
                    date: entry.date,
                    value: cpu.percentage,
                });
            });
        });

        // Sort time series data by date
        cpuData.forEach(timeSeries => {
            timeSeries.sort((a, b) => a.date.getTime() - b.date.getTime());
        });

        return cpuData;
    }

    /**
     * Calculates market share trends over time
     */
    static calculateTrends(
        timeSeries: TimeSeriesData[],
        windowSize: number = 3
    ): {
        trend: 'growing' | 'declining' | 'stable';
        growthRate: number;
        volatility: number;
    } {
        if (timeSeries.length < windowSize) {
            return { trend: 'stable', growthRate: 0, volatility: 0 };
        }

        // Calculate moving averages
        const movingAverages = this.calculateMovingAverage(timeSeries, windowSize);

        // Calculate overall trend
        const firstAvg = movingAverages[0];
        const lastAvg = movingAverages[movingAverages.length - 1];
        const growthRate = ((lastAvg - firstAvg) / firstAvg) * 100;

        // Calculate volatility (standard deviation of changes)
        const changes = movingAverages.slice(1).map((avg, i) => avg - movingAverages[i]);
        const volatility = this.calculateStandardDeviation(changes);

        // Determine trend
        let trend: 'growing' | 'declining' | 'stable';
        if (Math.abs(growthRate) < 1) {
            trend = 'stable';
        } else if (growthRate > 0) {
            trend = 'growing';
        } else {
            trend = 'declining';
        }

        return { trend, growthRate, volatility };
    }

    /**
     * Calculates moving average for time series data
     */
    private static calculateMovingAverage(
        timeSeries: TimeSeriesData[],
        windowSize: number
    ): number[] {
        const averages: number[] = [];

        for (let i = 0; i <= timeSeries.length - windowSize; i++) {
            const window = timeSeries.slice(i, i + windowSize);
            const average = window.reduce((sum, point) => sum + point.value, 0) / windowSize;
            averages.push(average);
        }

        return averages;
    }

    /**
     * Calculates standard deviation
     */
    private static calculateStandardDeviation(values: number[]): number {
        if (values.length === 0) return 0;

        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;

        return Math.sqrt(variance);
    }

    /**
     * Groups hardware models by manufacturer
     */
    static groupByManufacturer(entries: GPUMarketShare[]): Map<string, GPUMarketShare[]> {
        const grouped = new Map<string, GPUMarketShare[]>();

        entries.forEach(entry => {
            const manufacturer = this.extractManufacturer(entry.gpuModel);
            if (!grouped.has(manufacturer)) {
                grouped.set(manufacturer, []);
            }
            grouped.get(manufacturer)!.push(entry);
        });

        return grouped;
    }

    /**
     * Extracts manufacturer from GPU model name
     */
    private static extractManufacturer(gpuModel: string): string {
        if (
            gpuModel.toLowerCase().includes('nvidia') ||
            gpuModel.toLowerCase().includes('rtx') ||
            gpuModel.toLowerCase().includes('gtx')
        ) {
            return 'NVIDIA';
        } else if (
            gpuModel.toLowerCase().includes('amd') ||
            gpuModel.toLowerCase().includes('radeon') ||
            gpuModel.toLowerCase().includes('rx')
        ) {
            return 'AMD';
        } else if (gpuModel.toLowerCase().includes('intel')) {
            return 'Intel';
        }
        return 'Unknown';
    }

    /**
     * Calculates market share for top N entries
     */
    static getTopEntries<T extends { percentage: number }>(entries: T[], count: number = 10): T[] {
        return entries.sort((a, b) => b.percentage - a.percentage).slice(0, count);
    }

    /**
     * Calculates total market share for a manufacturer
     */
    static calculateManufacturerShare(entries: GPUMarketShare[]): Map<string, number> {
        const manufacturerShare = new Map<string, number>();

        entries.forEach(entry => {
            const manufacturer = this.extractManufacturer(entry.gpuModel);
            const currentShare = manufacturerShare.get(manufacturer) || 0;
            manufacturerShare.set(manufacturer, currentShare + entry.percentage);
        });

        return manufacturerShare;
    }
}
