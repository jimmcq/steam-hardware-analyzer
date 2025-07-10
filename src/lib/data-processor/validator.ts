import { SteamSurveyData, HardwareSurveyEntry } from '@/types';

/**
 * Data validation and cleaning utilities
 */
export class DataValidator {
    /**
     * Validates Steam survey data structure and content
     */
    static validateSteamSurveyData(data: unknown): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!data || typeof data !== 'object') {
            errors.push('Data must be an object');
            return { isValid: false, errors, warnings };
        }

        const survey = data as SteamSurveyData;

        // Validate required fields
        if (!survey.surveyDate) {
            errors.push('Missing surveyDate field');
        } else if (typeof survey.surveyDate !== 'string') {
            errors.push('surveyDate must be a string');
        } else if (isNaN(Date.parse(survey.surveyDate))) {
            errors.push('surveyDate must be a valid date string');
        }

        if (typeof survey.totalParticipants !== 'number') {
            errors.push('totalParticipants must be a number');
        } else if (survey.totalParticipants <= 0) {
            errors.push('totalParticipants must be greater than 0');
        }

        // Validate data sections
        this.validateDataSection(survey.graphics, 'graphics', errors, warnings);
        this.validateDataSection(survey.processors, 'processors', errors, warnings);
        this.validateDataSection(survey.memory, 'memory', errors, warnings);
        this.validateDataSection(survey.resolution, 'resolution', errors, warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Validates a data section (graphics, processors, etc.)
     */
    private static validateDataSection(
        section: Record<string, { percentage: number; change?: number }>,
        sectionName: string,
        errors: string[],
        warnings: string[]
    ): void {
        if (!section || typeof section !== 'object') {
            errors.push(`${sectionName} section must be an object`);
            return;
        }

        let totalPercentage = 0;
        const entries = Object.entries(section);

        if (entries.length === 0) {
            warnings.push(`${sectionName} section is empty`);
            return;
        }

        entries.forEach(([key, value]) => {
            if (!value || typeof value !== 'object') {
                errors.push(`${sectionName}.${key} must be an object`);
                return;
            }

            if (typeof value.percentage !== 'number') {
                errors.push(`${sectionName}.${key}.percentage must be a number`);
            } else if (value.percentage < 0 || value.percentage > 100) {
                errors.push(`${sectionName}.${key}.percentage must be between 0 and 100`);
            } else {
                totalPercentage += value.percentage;
            }

            if (value.change !== undefined && typeof value.change !== 'number') {
                errors.push(`${sectionName}.${key}.change must be a number`);
            }
        });

        // Check if total percentage is reasonable (allowing some tolerance)
        if (Math.abs(totalPercentage - 100) > 5) {
            warnings.push(
                `${sectionName} total percentage is ${totalPercentage.toFixed(2)}%, expected ~100%`
            );
        }
    }

    /**
     * Validates normalized hardware survey entry
     */
    static validateHardwareSurveyEntry(entry: HardwareSurveyEntry): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate date
        if (!(entry.date instanceof Date) || isNaN(entry.date.getTime())) {
            errors.push('Invalid date');
        }

        // Validate distributions
        this.validateMarketShareArray(entry.gpuDistribution, 'GPU distribution', errors, warnings);
        this.validateMarketShareArray(entry.cpuDistribution, 'CPU distribution', errors, warnings);

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Validates market share array
     */
    private static validateMarketShareArray(
        distribution: Array<{ percentage: number; date: Date }>,
        distributionName: string,
        errors: string[],
        warnings: string[]
    ): void {
        if (!Array.isArray(distribution)) {
            errors.push(`${distributionName} must be an array`);
            return;
        }

        if (distribution.length === 0) {
            warnings.push(`${distributionName} is empty`);
            return;
        }

        let totalPercentage = 0;
        distribution.forEach((item, index) => {
            if (typeof item.percentage !== 'number') {
                errors.push(`${distributionName}[${index}].percentage must be a number`);
            } else if (item.percentage < 0 || item.percentage > 100) {
                errors.push(`${distributionName}[${index}].percentage must be between 0 and 100`);
            } else {
                totalPercentage += item.percentage;
            }

            if (!(item.date instanceof Date) || isNaN(item.date.getTime())) {
                errors.push(`${distributionName}[${index}].date must be a valid Date`);
            }
        });

        if (Math.abs(totalPercentage - 100) > 10) {
            warnings.push(
                `${distributionName} total percentage is ${totalPercentage.toFixed(2)}%, expected ~100%`
            );
        }
    }

    /**
     * Cleans and sanitizes GPU model names
     */
    static cleanGPUModelName(modelName: string): string {
        if (!modelName || typeof modelName !== 'string') {
            return '';
        }

        return modelName
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[^\w\s\-\.]/g, '')
            .replace(/\b(nvidia|amd|intel)\b/gi, match => match.toUpperCase())
            .replace(/\b(rtx|gtx|rx|radeon|geforce|arc)\b/gi, match => match.toUpperCase());
    }

    /**
     * Validates GPU model name format
     */
    static validateGPUModelName(modelName: string): boolean {
        if (!modelName || typeof modelName !== 'string') {
            return false;
        }

        const cleanName = this.cleanGPUModelName(modelName);

        // Check for common GPU patterns
        const patterns = [
            /^(NVIDIA\s+)?(RTX|GTX)\s+\d{4}(\s+(Ti|Super))?$/i,
            /^(AMD\s+)?(RX|Radeon)\s+\d{4}(\s+XT)?$/i,
            /^Intel\s+Arc\s+A\d{3}$/i,
        ];

        return patterns.some(pattern => pattern.test(cleanName));
    }

    /**
     * Removes outliers from percentage data
     */
    static removeOutliers(data: number[], threshold: number = 2): number[] {
        if (data.length < 3) return data;

        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        const standardDeviation = Math.sqrt(
            data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
        );

        return data.filter(val => Math.abs(val - mean) <= threshold * standardDeviation);
    }

    /**
     * Validates time series data for consistency
     */
    static validateTimeSeries(data: Array<{ date: Date; value: number }>): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!Array.isArray(data)) {
            errors.push('Time series data must be an array');
            return { isValid: false, errors, warnings };
        }

        if (data.length === 0) {
            warnings.push('Time series data is empty');
            return { isValid: true, errors, warnings };
        }

        // Check for chronological order
        for (let i = 1; i < data.length; i++) {
            if (data[i].date.getTime() <= data[i - 1].date.getTime()) {
                errors.push(`Time series data is not in chronological order at index ${i}`);
                break;
            }
        }

        // Check for extreme values
        const values = data.map(d => d.value);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);

        if (max > mean * 10) {
            warnings.push(`Detected potentially extreme maximum value: ${max}`);
        }

        if (min < 0) {
            warnings.push(`Detected negative value: ${min}`);
        }

        // Check for gaps in time series
        if (data.length > 1) {
            const intervals = [];
            for (let i = 1; i < data.length; i++) {
                const interval = data[i].date.getTime() - data[i - 1].date.getTime();
                intervals.push(interval);
            }

            const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
            const largeGaps = intervals.filter(interval => interval > avgInterval * 3);

            if (largeGaps.length > 0) {
                warnings.push(`Detected ${largeGaps.length} large gaps in time series data`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Validates data consistency across multiple survey entries
     */
    static validateDataConsistency(entries: HardwareSurveyEntry[]): {
        isValid: boolean;
        errors: string[];
        warnings: string[];
    } {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!Array.isArray(entries) || entries.length === 0) {
            errors.push('Survey entries must be a non-empty array');
            return { isValid: false, errors, warnings };
        }

        // Check for duplicate dates
        const dates = entries.map(entry => entry.date.toISOString().split('T')[0]);
        const uniqueDates = new Set(dates);
        if (dates.length !== uniqueDates.size) {
            errors.push('Duplicate survey dates detected');
        }

        // Check for reasonable progression in popular GPUs
        const popularGPUs = new Set<string>();
        entries.forEach(entry => {
            entry.gpuDistribution
                .filter(gpu => gpu.percentage > 1)
                .forEach(gpu => popularGPUs.add(gpu.gpuModel));
        });

        if (popularGPUs.size === 0) {
            warnings.push('No popular GPUs found across survey entries');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
}
