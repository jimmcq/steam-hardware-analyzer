export interface GPUData {
    model: string;
    manufacturer: 'NVIDIA' | 'AMD' | 'Intel';
    tier: 'Entry' | 'Mid-Range' | 'High-End' | 'Enthusiast';
    releaseDate: Date;
    performanceScore: number;
    marketShare: TimeSeriesData[];
    vram: number;
    architecture: string;
}

export interface CPUData {
    model: string;
    manufacturer: 'Intel' | 'AMD';
    cores: number;
    threads: number;
    baseFreq: number;
    boostFreq: number;
    releaseDate: Date;
    performanceScore: number;
}

export interface TimeSeriesData {
    date: Date;
    value: number;
}

export interface GPUMarketShare {
    gpuModel: string;
    percentage: number;
    date: Date;
}

export interface CPUMarketShare {
    cpuModel: string;
    percentage: number;
    date: Date;
}

export interface ResolutionStats {
    resolution: string;
    percentage: number;
    date: Date;
}

export interface MemoryStats {
    memory: string;
    percentage: number;
    date: Date;
}

export interface UserCluster {
    id: string;
    name: string;
    avgPerformanceScore: number;
    commonGPUs: string[];
    commonCPUs: string[];
    userCount: number;
    percentage: number;
}
