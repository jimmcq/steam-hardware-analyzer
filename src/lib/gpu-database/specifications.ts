import { GPUData, CPUData } from '@/types';

/**
 * GPU specifications database with performance metrics and technical details
 */
export class GPUDatabase {
    private static gpuSpecs: Map<string, GPUData> = new Map();

    /**
     * Initialize GPU database with known specifications
     */
    static initialize(): void {
        // NVIDIA RTX 40 Series
        this.addGPU({
            model: 'RTX 4090',
            manufacturer: 'NVIDIA',
            tier: 'Enthusiast',
            releaseDate: new Date('2022-10-12'),
            performanceScore: 100,
            vram: 24,
            architecture: 'Ada Lovelace',
            marketShare: [],
        });

        this.addGPU({
            model: 'RTX 4080',
            manufacturer: 'NVIDIA',
            tier: 'High-End',
            releaseDate: new Date('2022-11-16'),
            performanceScore: 85,
            vram: 16,
            architecture: 'Ada Lovelace',
            marketShare: [],
        });

        this.addGPU({
            model: 'RTX 4070 Ti',
            manufacturer: 'NVIDIA',
            tier: 'High-End',
            releaseDate: new Date('2023-01-05'),
            performanceScore: 75,
            vram: 12,
            architecture: 'Ada Lovelace',
            marketShare: [],
        });

        this.addGPU({
            model: 'RTX 4070',
            manufacturer: 'NVIDIA',
            tier: 'Mid-Range',
            releaseDate: new Date('2023-04-13'),
            performanceScore: 65,
            vram: 12,
            architecture: 'Ada Lovelace',
            marketShare: [],
        });

        this.addGPU({
            model: 'RTX 4060 Ti',
            manufacturer: 'NVIDIA',
            tier: 'Mid-Range',
            releaseDate: new Date('2023-05-24'),
            performanceScore: 55,
            vram: 8,
            architecture: 'Ada Lovelace',
            marketShare: [],
        });

        this.addGPU({
            model: 'RTX 4060',
            manufacturer: 'NVIDIA',
            tier: 'Entry',
            releaseDate: new Date('2023-06-29'),
            performanceScore: 45,
            vram: 8,
            architecture: 'Ada Lovelace',
            marketShare: [],
        });

        // NVIDIA RTX 30 Series
        this.addGPU({
            model: 'RTX 3090',
            manufacturer: 'NVIDIA',
            tier: 'Enthusiast',
            releaseDate: new Date('2020-09-24'),
            performanceScore: 90,
            vram: 24,
            architecture: 'Ampere',
            marketShare: [],
        });

        this.addGPU({
            model: 'RTX 3080',
            manufacturer: 'NVIDIA',
            tier: 'High-End',
            releaseDate: new Date('2020-09-17'),
            performanceScore: 80,
            vram: 10,
            architecture: 'Ampere',
            marketShare: [],
        });

        this.addGPU({
            model: 'RTX 3070',
            manufacturer: 'NVIDIA',
            tier: 'High-End',
            releaseDate: new Date('2020-10-29'),
            performanceScore: 70,
            vram: 8,
            architecture: 'Ampere',
            marketShare: [],
        });

        this.addGPU({
            model: 'RTX 3060 Ti',
            manufacturer: 'NVIDIA',
            tier: 'Mid-Range',
            releaseDate: new Date('2020-12-02'),
            performanceScore: 60,
            vram: 8,
            architecture: 'Ampere',
            marketShare: [],
        });

        this.addGPU({
            model: 'RTX 3060',
            manufacturer: 'NVIDIA',
            tier: 'Mid-Range',
            releaseDate: new Date('2021-02-25'),
            performanceScore: 50,
            vram: 12,
            architecture: 'Ampere',
            marketShare: [],
        });

        // AMD RX 7000 Series
        this.addGPU({
            model: 'RX 7900 XTX',
            manufacturer: 'AMD',
            tier: 'Enthusiast',
            releaseDate: new Date('2022-12-13'),
            performanceScore: 88,
            vram: 24,
            architecture: 'RDNA 3',
            marketShare: [],
        });

        this.addGPU({
            model: 'RX 7900 XT',
            manufacturer: 'AMD',
            tier: 'High-End',
            releaseDate: new Date('2022-12-13'),
            performanceScore: 78,
            vram: 20,
            architecture: 'RDNA 3',
            marketShare: [],
        });

        this.addGPU({
            model: 'RX 7800 XT',
            manufacturer: 'AMD',
            tier: 'High-End',
            releaseDate: new Date('2023-09-06'),
            performanceScore: 68,
            vram: 16,
            architecture: 'RDNA 3',
            marketShare: [],
        });

        this.addGPU({
            model: 'RX 7700 XT',
            manufacturer: 'AMD',
            tier: 'Mid-Range',
            releaseDate: new Date('2023-09-06'),
            performanceScore: 58,
            vram: 12,
            architecture: 'RDNA 3',
            marketShare: [],
        });

        // AMD RX 6000 Series
        this.addGPU({
            model: 'RX 6900 XT',
            manufacturer: 'AMD',
            tier: 'Enthusiast',
            releaseDate: new Date('2020-12-08'),
            performanceScore: 82,
            vram: 16,
            architecture: 'RDNA 2',
            marketShare: [],
        });

        this.addGPU({
            model: 'RX 6800 XT',
            manufacturer: 'AMD',
            tier: 'High-End',
            releaseDate: new Date('2020-11-18'),
            performanceScore: 75,
            vram: 16,
            architecture: 'RDNA 2',
            marketShare: [],
        });

        this.addGPU({
            model: 'RX 6700 XT',
            manufacturer: 'AMD',
            tier: 'Mid-Range',
            releaseDate: new Date('2021-03-18'),
            performanceScore: 62,
            vram: 12,
            architecture: 'RDNA 2',
            marketShare: [],
        });

        this.addGPU({
            model: 'RX 6600 XT',
            manufacturer: 'AMD',
            tier: 'Mid-Range',
            releaseDate: new Date('2021-08-11'),
            performanceScore: 48,
            vram: 8,
            architecture: 'RDNA 2',
            marketShare: [],
        });

        // Intel Arc Series
        this.addGPU({
            model: 'Intel Arc A770',
            manufacturer: 'Intel',
            tier: 'Mid-Range',
            releaseDate: new Date('2022-10-12'),
            performanceScore: 52,
            vram: 16,
            architecture: 'Xe HPG',
            marketShare: [],
        });

        this.addGPU({
            model: 'Intel Arc A750',
            manufacturer: 'Intel',
            tier: 'Mid-Range',
            releaseDate: new Date('2022-10-12'),
            performanceScore: 46,
            vram: 8,
            architecture: 'Xe HPG',
            marketShare: [],
        });
    }

    /**
     * Add GPU to database
     */
    private static addGPU(gpu: GPUData): void {
        this.gpuSpecs.set(gpu.model, gpu);
    }

    /**
     * Get GPU specifications by model
     */
    static getGPU(model: string): GPUData | undefined {
        return this.gpuSpecs.get(model);
    }

    /**
     * Get all GPUs by manufacturer
     */
    static getGPUsByManufacturer(manufacturer: 'NVIDIA' | 'AMD' | 'Intel'): GPUData[] {
        return Array.from(this.gpuSpecs.values()).filter(gpu => gpu.manufacturer === manufacturer);
    }

    /**
     * Get all GPUs by performance tier
     */
    static getGPUsByTier(tier: 'Entry' | 'Mid-Range' | 'High-End' | 'Enthusiast'): GPUData[] {
        return Array.from(this.gpuSpecs.values()).filter(gpu => gpu.tier === tier);
    }

    /**
     * Get GPUs released within a date range
     */
    static getGPUsByDateRange(startDate: Date, endDate: Date): GPUData[] {
        return Array.from(this.gpuSpecs.values()).filter(
            gpu => gpu.releaseDate >= startDate && gpu.releaseDate <= endDate
        );
    }

    /**
     * Get all GPU models
     */
    static getAllGPUs(): GPUData[] {
        return Array.from(this.gpuSpecs.values());
    }

    /**
     * Find GPU by partial model name (fuzzy matching)
     */
    static findGPUByName(partialName: string): GPUData | undefined {
        const normalized = partialName.toLowerCase().trim();
        
        // Try exact match first
        const exactMatch = this.gpuSpecs.get(partialName);
        if (exactMatch) return exactMatch;

        // Try fuzzy matching
        for (const [model, gpu] of this.gpuSpecs) {
            if (model.toLowerCase().includes(normalized) || 
                normalized.includes(model.toLowerCase())) {
                return gpu;
            }
        }

        return undefined;
    }

    /**
     * Get performance tier distribution
     */
    static getPerformanceTierDistribution(): Map<string, number> {
        const distribution = new Map<string, number>();
        
        this.gpuSpecs.forEach(gpu => {
            const count = distribution.get(gpu.tier) || 0;
            distribution.set(gpu.tier, count + 1);
        });
        
        return distribution;
    }

    /**
     * Get manufacturer distribution
     */
    static getManufacturerDistribution(): Map<string, number> {
        const distribution = new Map<string, number>();
        
        this.gpuSpecs.forEach(gpu => {
            const count = distribution.get(gpu.manufacturer) || 0;
            distribution.set(gpu.manufacturer, count + 1);
        });
        
        return distribution;
    }
}

// Initialize the database
GPUDatabase.initialize();