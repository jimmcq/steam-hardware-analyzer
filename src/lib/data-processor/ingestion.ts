import { SteamSurveyData, HardwareSurveyEntry } from '@/types';
import { DataNormalizer } from './normalizer';
import { DataValidator } from './validator';

/**
 * Data ingestion pipeline for Steam Hardware Survey data
 */
export class DataIngestion {
    private static readonly STEAM_SURVEY_URLS = [
        'https://store.steampowered.com/hwsurvey/Steam-Hardware-Software-Survey-Welcome-to-Steam',
    ];

    /**
     * Process raw survey data through the complete pipeline
     */
    static async processSurveyData(rawData: unknown): Promise<{
        success: boolean;
        data?: HardwareSurveyEntry;
        errors: string[];
        warnings: string[];
    }> {
        const errors: string[] = [];
        const warnings: string[] = [];

        try {
            // Step 1: Validate raw data
            const validation = DataValidator.validateSteamSurveyData(rawData);
            errors.push(...validation.errors);
            warnings.push(...validation.warnings);

            if (!validation.isValid) {
                return { success: false, errors, warnings };
            }

            // Step 2: Normalize data
            const normalizedData = DataNormalizer.normalizeSurveyEntry(rawData as SteamSurveyData);

            // Step 3: Validate normalized data
            const normalizedValidation = DataValidator.validateHardwareSurveyEntry(normalizedData);
            errors.push(...normalizedValidation.errors);
            warnings.push(...normalizedValidation.warnings);

            if (!normalizedValidation.isValid) {
                return { success: false, errors, warnings };
            }

            // Step 4: Apply filters and cleaning
            const cleanedData = this.applyDataCleaning(normalizedData);

            return {
                success: true,
                data: cleanedData,
                errors,
                warnings,
            };
        } catch (error) {
            errors.push(
                `Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            return { success: false, errors, warnings };
        }
    }

    /**
     * Process multiple survey entries
     */
    static async processMultipleSurveyEntries(rawDataArray: unknown[]): Promise<{
        success: boolean;
        data: HardwareSurveyEntry[];
        errors: string[];
        warnings: string[];
        stats: {
            processed: number;
            successful: number;
            failed: number;
        };
    }> {
        const processedData: HardwareSurveyEntry[] = [];
        const allErrors: string[] = [];
        const allWarnings: string[] = [];
        let successful = 0;
        let failed = 0;

        // Process all entries in parallel to avoid await in loop
        const results = await Promise.all(
            rawDataArray.map((rawData, i) =>
                this.processSurveyData(rawData).then(result => ({ result, index: i }))
            )
        );

        results.forEach(({ result, index: i }) => {
            if (result.success && result.data) {
                processedData.push(result.data);
                successful++;
            } else {
                failed++;
                allErrors.push(`Entry ${i}: ${result.errors.join(', ')}`);
            }

            allWarnings.push(...result.warnings);
        });

        // Validate consistency across all entries
        if (processedData.length > 1) {
            const consistencyValidation = DataValidator.validateDataConsistency(processedData);
            allErrors.push(...consistencyValidation.errors);
            allWarnings.push(...consistencyValidation.warnings);
        }

        return {
            success: successful > 0,
            data: processedData,
            errors: allErrors,
            warnings: allWarnings,
            stats: {
                processed: rawDataArray.length,
                successful,
                failed,
            },
        };
    }

    /**
     * Apply data cleaning and filtering
     */
    private static applyDataCleaning(entry: HardwareSurveyEntry): HardwareSurveyEntry {
        return {
            ...entry,
            gpuDistribution: this.cleanGPUDistribution(entry.gpuDistribution),
            cpuDistribution: this.cleanCPUDistribution(entry.cpuDistribution),
            resolutionData: DataNormalizer.filterLowPercentageEntries(entry.resolutionData, 0.1),
            vramDistribution: DataNormalizer.filterLowPercentageEntries(
                entry.vramDistribution,
                0.1
            ),
        };
    }

    /**
     * Clean GPU distribution data
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static cleanGPUDistribution(gpuDistribution: any[]): any[] {
        return gpuDistribution
            .map(gpu => ({
                ...gpu,
                gpuModel: DataValidator.cleanGPUModelName(gpu.gpuModel),
            }))
            .filter(gpu => gpu.gpuModel.length > 0)
            .filter(gpu => gpu.percentage >= 0.1);
    }

    /**
     * Clean CPU distribution data
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static cleanCPUDistribution(cpuDistribution: any[]): any[] {
        return cpuDistribution
            .map(cpu => ({
                ...cpu,
                cpuModel: cpu.cpuModel.trim(),
            }))
            .filter(cpu => cpu.cpuModel.length > 0)
            .filter(cpu => cpu.percentage >= 0.1);
    }

    /**
     * Simulate fetching data from Steam (placeholder for actual implementation)
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async fetchFromSteam(_url?: string): Promise<{
        success: boolean;
        data?: unknown;
        error?: string;
    }> {
        // This would be implemented with actual HTTP requests to Steam's API
        // For now, return a placeholder response
        return {
            success: false,
            error: 'Steam API integration not implemented yet',
        };
    }

    /**
     * Load data from local JSON file
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static async loadFromFile(_filePath: string): Promise<{
        success: boolean;
        data?: unknown;
        error?: string;
    }> {
        try {
            // In a real implementation, this would use fs.readFile or similar
            // For now, return a placeholder response
            return {
                success: false,
                error: 'File loading not implemented yet',
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to load file: ${error instanceof Error ? error.message : 'Unknown error'}`,
            };
        }
    }

    /**
     * Create a data ingestion job
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static createIngestionJob(_config: {
        sources: string[];
        outputPath?: string;
        validationLevel: 'strict' | 'standard' | 'lenient';
        filters?: {
            minPercentage?: number;
            excludeModels?: string[];
        };
    }): {
        execute: () => Promise<{
            success: boolean;
            processedCount: number;
            errors: string[];
            warnings: string[];
        }>;
    } {
        return {
            execute: async () => {
                // Placeholder implementation
                return {
                    success: true,
                    processedCount: 0,
                    errors: [],
                    warnings: ['Ingestion job not fully implemented'],
                };
            },
        };
    }

    /**
     * Validate data source format
     */
    static validateDataSource(source: string): {
        isValid: boolean;
        format: 'json' | 'csv' | 'xml' | 'unknown';
        errors: string[];
    } {
        const errors: string[] = [];

        if (!source || typeof source !== 'string') {
            errors.push('Data source must be a non-empty string');
            return { isValid: false, format: 'unknown', errors };
        }

        let format: 'json' | 'csv' | 'xml' | 'unknown' = 'unknown';

        if (source.toLowerCase().includes('.json') || source.includes('application/json')) {
            format = 'json';
        } else if (source.toLowerCase().includes('.csv') || source.includes('text/csv')) {
            format = 'csv';
        } else if (source.toLowerCase().includes('.xml') || source.includes('application/xml')) {
            format = 'xml';
        }

        const isValidUrl = /^https?:\/\/.+/i.test(source);
        const isValidPath = /^[a-zA-Z0-9\/\\\-_\.\:]+$/i.test(source);

        if (!isValidUrl && !isValidPath) {
            errors.push('Data source must be a valid URL or file path');
        }

        return {
            isValid: errors.length === 0,
            format,
            errors,
        };
    }

    /**
     * Get ingestion pipeline statistics
     */
    static getIngestionStats(): {
        totalProcessed: number;
        successRate: number;
        averageProcessingTime: number;
        lastProcessed: Date | null;
    } {
        // Placeholder implementation - would track actual stats in production
        return {
            totalProcessed: 0,
            successRate: 0,
            averageProcessingTime: 0,
            lastProcessed: null,
        };
    }
}
