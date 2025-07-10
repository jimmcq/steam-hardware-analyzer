import { GPUMarketShare, CPUMarketShare, ResolutionStats, MemoryStats } from './hardware';

export interface HardwareSurveyEntry {
    date: Date;
    gpuDistribution: GPUMarketShare[];
    cpuDistribution: CPUMarketShare[];
    resolutionData: ResolutionStats[];
    vramDistribution: MemoryStats[];
}

export interface SteamSurveyData {
    surveyDate: string;
    totalParticipants: number;
    graphics: {
        [key: string]: {
            percentage: number;
            change?: number;
        };
    };
    processors: {
        [key: string]: {
            percentage: number;
            change?: number;
        };
    };
    memory: {
        [key: string]: {
            percentage: number;
            change?: number;
        };
    };
    resolution: {
        [key: string]: {
            percentage: number;
            change?: number;
        };
    };
}

export interface GameRequirements {
    name: string;
    minimumSpecs?: {
        gpu: { model: string; performanceScore?: number };
        vram: number;
        cpu: string;
        ram: number;
    };
    recommendedSpecs?: {
        gpu: { model: string; performanceScore?: number };
        vram: number;
        cpu: string;
        ram: number;
    };
    resolution?: string;
    targetFps?: number;
    settings?: string;
    gameId?: string;
    minimumGPU?: string;
    recommendedGPU?: string;
    minimumCPU?: string;
    recommendedCPU?: string;
    minimumRAM?: number;
    recommendedRAM?: number;
    minimumVRAM?: number;
    recommendedVRAM?: number;
}
