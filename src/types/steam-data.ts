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
    gameId: string;
    name: string;
    minimumGPU: string;
    recommendedGPU: string;
    minimumCPU: string;
    recommendedCPU: string;
    minimumRAM: number;
    recommendedRAM: number;
    minimumVRAM: number;
    recommendedVRAM: number;
}
