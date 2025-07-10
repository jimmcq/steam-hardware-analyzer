import { SteamSurveyData, HardwareSurveyEntry, GPUMarketShare, CPUMarketShare, ResolutionStats, MemoryStats } from '@/types';

/**
 * Normalizes raw Steam Hardware Survey data into standardized format
 */
export class DataNormalizer {
    /**
     * Normalizes a single Steam survey entry
     */
    static normalizeSurveyEntry(rawData: SteamSurveyData): HardwareSurveyEntry {
        const date = new Date(rawData.surveyDate);
        
        return {
            date,
            gpuDistribution: this.normalizeGPUData(rawData.graphics, date),
            cpuDistribution: this.normalizeCPUData(rawData.processors, date),
            resolutionData: this.normalizeResolutionData(rawData.resolution, date),
            vramDistribution: this.normalizeMemoryData(rawData.memory, date),
        };
    }

    /**
     * Normalizes GPU distribution data
     */
    private static normalizeGPUData(
        graphics: SteamSurveyData['graphics'],
        date: Date
    ): GPUMarketShare[] {
        return Object.entries(graphics).map(([gpuModel, data]) => ({
            gpuModel: this.cleanGPUName(gpuModel),
            percentage: data.percentage,
            date,
        }));
    }

    /**
     * Normalizes CPU distribution data
     */
    private static normalizeCPUData(
        processors: SteamSurveyData['processors'],
        date: Date
    ): CPUMarketShare[] {
        return Object.entries(processors).map(([cpuModel, data]) => ({
            cpuModel: this.cleanCPUName(cpuModel),
            percentage: data.percentage,
            date,
        }));
    }

    /**
     * Normalizes resolution data
     */
    private static normalizeResolutionData(
        resolution: SteamSurveyData['resolution'],
        date: Date
    ): ResolutionStats[] {
        return Object.entries(resolution).map(([res, data]) => ({
            resolution: res,
            percentage: data.percentage,
            date,
        }));
    }

    /**
     * Normalizes memory data
     */
    private static normalizeMemoryData(
        memory: SteamSurveyData['memory'],
        date: Date
    ): MemoryStats[] {
        return Object.entries(memory).map(([mem, data]) => ({
            memory: mem,
            percentage: data.percentage,
            date,
        }));
    }

    /**
     * Cleans and standardizes GPU names
     */
    private static cleanGPUName(gpuName: string): string {
        return gpuName
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/NVIDIA\s+GeForce\s+RTX\s+/i, 'RTX ')
            .replace(/NVIDIA\s+GeForce\s+GTX\s+/i, 'GTX ')
            .replace(/AMD\s+Radeon\s+RX\s+/i, 'RX ')
            .replace(/Intel\s+Arc\s+/i, 'Intel Arc ')
            .replace(/\s+Ti\s*$/i, ' Ti')
            .replace(/\s+Super\s*$/i, ' Super');
    }

    /**
     * Cleans and standardizes CPU names
     */
    private static cleanCPUName(cpuName: string): string {
        return cpuName
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/Intel\(R\)\s+Core\(TM\)\s+/i, 'Intel Core ')
            .replace(/AMD\s+Ryzen\s+/i, 'AMD Ryzen ')
            .replace(/\s+@\s+[\d.]+GHz/i, '');
    }

    /**
     * Validates survey data structure
     */
    static validateSurveyData(data: unknown): data is SteamSurveyData {
        if (!data || typeof data !== 'object') return false;
        
        const survey = data as SteamSurveyData;
        
        return (
            typeof survey.surveyDate === 'string' &&
            typeof survey.totalParticipants === 'number' &&
            typeof survey.graphics === 'object' &&
            typeof survey.processors === 'object' &&
            typeof survey.memory === 'object' &&
            typeof survey.resolution === 'object'
        );
    }

    /**
     * Filters out low-percentage entries to reduce noise
     */
    static filterLowPercentageEntries<T extends { percentage: number }>(
        entries: T[],
        threshold: number = 0.1
    ): T[] {
        return entries.filter(entry => entry.percentage >= threshold);
    }

    /**
     * Sorts entries by percentage in descending order
     */
    static sortByPercentage<T extends { percentage: number }>(entries: T[]): T[] {
        return [...entries].sort((a, b) => b.percentage - a.percentage);
    }
}