import { GPUData, CPUData } from '../../types/hardware';
import { GameRequirements } from '../../types/steam-data';
import { BottleneckAnalysis } from '../../types/analysis';

export function calculateBottleneck(
    gpu: GPUData,
    cpu: CPUData,
    targetGame: GameRequirements
): BottleneckAnalysis {
    const gpuScore = calculateGPUScore(gpu, targetGame);
    const cpuScore = calculateCPUScore(cpu);
    const memoryScore = calculateMemoryScore(gpu.vram, targetGame);

    const bottleneckType = determineBottleneckType(gpuScore, cpuScore, memoryScore);
    const performanceScore = calculateOverallPerformance(gpuScore, cpuScore, memoryScore);
    const expectedFPS = estimateExpectedFPS(performanceScore, targetGame);
    const recommendations = generateRecommendations(
        bottleneckType,
        gpuScore,
        cpuScore,
        memoryScore
    );
    const upgradeOptions = generateUpgradeOptions(gpu, cpu, targetGame, bottleneckType);

    return {
        configuration: { gpu, cpu },
        targetGame,
        bottleneckType,
        performanceScore,
        expectedFPS,
        recommendations,
        upgradeOptions,
    };
}

function calculateGPUScore(gpu: GPUData, game: GameRequirements): number {
    const baseScore = gpu.performanceScore;
    const vramMultiplier = calculateVRAMMultiplier(gpu.vram, game.recommendedVRAM);
    const architectureBonus = getArchitectureBonus(gpu.architecture);

    return Math.min(100, baseScore * vramMultiplier + architectureBonus);
}

function calculateCPUScore(cpu: CPUData): number {
    const baseScore = cpu.performanceScore;
    const coreMultiplier = calculateCoreMultiplier(cpu.cores, cpu.threads);
    const frequencyBonus = calculateFrequencyBonus(cpu.baseFreq, cpu.boostFreq);

    return Math.min(100, baseScore * coreMultiplier + frequencyBonus);
}

function calculateMemoryScore(vram: number, game: GameRequirements): number {
    const required = game.recommendedVRAM || 4;

    if (vram >= required * 1.5) return 100;
    if (vram >= required) return 85;
    if (vram >= required * 0.75) return 65;
    if (vram >= required * 0.5) return 40;

    return 20;
}

function calculateVRAMMultiplier(gpuVRAM: number, gameVRAM: number): number {
    const ratio = gpuVRAM / Math.max(gameVRAM, 1);

    if (ratio >= 2) return 1.1;
    if (ratio >= 1.5) return 1.05;
    if (ratio >= 1) return 1.0;
    if (ratio >= 0.75) return 0.9;
    if (ratio >= 0.5) return 0.7;

    return 0.5;
}

function getArchitectureBonus(architecture: string): number {
    const arch = architecture.toLowerCase();

    if (arch.includes('ada') || arch.includes('rdna3')) return 5;
    if (arch.includes('ampere') || arch.includes('rdna2')) return 3;
    if (arch.includes('turing') || arch.includes('rdna')) return 1;

    return 0;
}

function calculateCoreMultiplier(cores: number, threads: number): number {
    const effectiveCores = Math.min(cores + (threads - cores) * 0.3, cores * 2);

    if (effectiveCores >= 12) return 1.1;
    if (effectiveCores >= 8) return 1.05;
    if (effectiveCores >= 6) return 1.0;
    if (effectiveCores >= 4) return 0.95;

    return 0.85;
}

function calculateFrequencyBonus(baseFreq: number, boostFreq: number): number {
    const effectiveFreq = baseFreq * 0.7 + boostFreq * 0.3;

    if (effectiveFreq >= 4.5) return 5;
    if (effectiveFreq >= 4.0) return 3;
    if (effectiveFreq >= 3.5) return 1;

    return 0;
}

function determineBottleneckType(
    gpuScore: number,
    cpuScore: number,
    memoryScore: number
): 'GPU' | 'CPU' | 'Memory' | 'None' {
    const threshold = 15;
    const minScore = Math.min(gpuScore, cpuScore, memoryScore);

    if (minScore > 80) return 'None';

    if (gpuScore < cpuScore - threshold && gpuScore < memoryScore - threshold) {
        return 'GPU';
    }

    if (cpuScore < gpuScore - threshold && cpuScore < memoryScore - threshold) {
        return 'CPU';
    }

    if (memoryScore < gpuScore - threshold && memoryScore < cpuScore - threshold) {
        return 'Memory';
    }

    if (gpuScore < cpuScore && gpuScore < memoryScore) return 'GPU';
    if (cpuScore < gpuScore && cpuScore < memoryScore) return 'CPU';
    if (memoryScore < gpuScore && memoryScore < cpuScore) return 'Memory';

    return 'None';
}

function calculateOverallPerformance(
    gpuScore: number,
    cpuScore: number,
    memoryScore: number
): number {
    const weights = { gpu: 0.6, cpu: 0.3, memory: 0.1 };

    return Math.round(
        gpuScore * weights.gpu + cpuScore * weights.cpu + memoryScore * weights.memory
    );
}

function estimateExpectedFPS(performanceScore: number, game: GameRequirements): number {
    const baseFPS = getBaselineFPS(game.name);
    const scoreMultiplier = performanceScore / 100;

    return Math.round(baseFPS * scoreMultiplier);
}

function getBaselineFPS(gameName: string): number {
    const game = gameName.toLowerCase();

    if (game.includes('cyberpunk')) return 45;
    if (game.includes('red dead')) return 50;
    if (game.includes('call of duty')) return 90;
    if (game.includes('fortnite')) return 120;
    if (game.includes('valorant')) return 200;
    if (game.includes('counter-strike')) return 180;
    if (game.includes('apex')) return 100;
    if (game.includes('battlefield')) return 70;
    if (game.includes('assassin')) return 55;
    if (game.includes('witcher')) return 60;

    return 60;
}

function generateRecommendations(
    bottleneckType: 'GPU' | 'CPU' | 'Memory' | 'None',
    gpuScore: number,
    cpuScore: number,
    memoryScore: number
): string[] {
    const recommendations: string[] = [];

    switch (bottleneckType) {
        case 'GPU':
            recommendations.push('GPU is the primary bottleneck limiting performance');
            if (gpuScore < 50) {
                recommendations.push('Consider upgrading to a more powerful GPU');
                recommendations.push('Lower graphics settings to improve performance');
            }
            recommendations.push('Reduce resolution or enable DLSS/FSR if available');
            break;

        case 'CPU':
            recommendations.push('CPU is limiting GPU performance');
            if (cpuScore < 50) {
                recommendations.push('Consider upgrading to a faster CPU');
            }
            recommendations.push('Lower CPU-intensive settings like draw distance');
            recommendations.push('Close background applications to free CPU resources');
            break;

        case 'Memory':
            recommendations.push('Insufficient VRAM is causing performance issues');
            recommendations.push('Lower texture quality and resolution');
            recommendations.push('Disable high VRAM features like ray tracing');
            if (memoryScore < 40) {
                recommendations.push('Consider GPU upgrade for more VRAM');
            }
            break;

        case 'None':
            recommendations.push('System is well-balanced for this game');
            recommendations.push('Try increasing graphics settings for better quality');
            if (gpuScore > 90 && cpuScore > 90) {
                recommendations.push('Enable ray tracing or other enhanced features');
            }
            break;
    }

    return recommendations;
}

function generateUpgradeOptions(
    gpu: GPUData,
    cpu: CPUData,
    game: GameRequirements,
    bottleneckType: 'GPU' | 'CPU' | 'Memory' | 'None'
): BottleneckAnalysis['upgradeOptions'] {
    const options: BottleneckAnalysis['upgradeOptions'] = [];

    if (bottleneckType === 'GPU' || gpu.performanceScore < 70) {
        options.push({
            component: 'GPU',
            suggestions: generateGPUUpgrades(gpu),
            expectedImprovement: calculateGPUUpgradeImprovement(gpu),
        });
    }

    if (bottleneckType === 'CPU' || cpu.performanceScore < 70) {
        options.push({
            component: 'CPU',
            suggestions: generateCPUUpgrades(cpu),
            expectedImprovement: calculateCPUUpgradeImprovement(cpu),
        });
    }

    if (bottleneckType === 'Memory' || gpu.vram < game.recommendedVRAM) {
        options.push({
            component: 'Memory',
            suggestions: generateMemoryUpgrades(gpu.vram, game.recommendedVRAM),
            expectedImprovement: calculateMemoryUpgradeImprovement(gpu.vram, game.recommendedVRAM),
        });
    }

    return options;
}

function generateGPUUpgrades(currentGPU: GPUData): string[] {
    const currentScore = currentGPU.performanceScore;
    const upgrades: string[] = [];

    if (currentScore < 50) {
        upgrades.push('RTX 4060 / RX 7600', 'RTX 4070 / RX 7700 XT');
    } else if (currentScore < 70) {
        upgrades.push('RTX 4070 Ti / RX 7800 XT', 'RTX 4080 / RX 7900 XTX');
    } else if (currentScore < 85) {
        upgrades.push('RTX 4080 Super', 'RTX 4090');
    }

    return upgrades.slice(0, 3);
}

function generateCPUUpgrades(currentCPU: CPUData): string[] {
    const currentScore = currentCPU.performanceScore;
    const manufacturer = currentCPU.manufacturer;
    const upgrades: string[] = [];

    if (manufacturer === 'Intel') {
        if (currentScore < 50) {
            upgrades.push('Intel i5-13400F', 'Intel i5-14600K');
        } else if (currentScore < 70) {
            upgrades.push('Intel i7-13700K', 'Intel i7-14700K');
        } else {
            upgrades.push('Intel i9-13900K', 'Intel i9-14900K');
        }
    } else {
        if (currentScore < 50) {
            upgrades.push('AMD Ryzen 5 7600X', 'AMD Ryzen 7 7700X');
        } else if (currentScore < 70) {
            upgrades.push('AMD Ryzen 7 7800X3D', 'AMD Ryzen 9 7900X');
        } else {
            upgrades.push('AMD Ryzen 9 7950X', 'AMD Ryzen 9 7950X3D');
        }
    }

    return upgrades.slice(0, 3);
}

function generateMemoryUpgrades(currentVRAM: number, requiredVRAM: number): string[] {
    const upgrades: string[] = [];

    if (currentVRAM < 8) {
        upgrades.push('Upgrade to 8GB VRAM GPU');
    }
    if (currentVRAM < 12) {
        upgrades.push('Upgrade to 12GB VRAM GPU');
    }
    if (requiredVRAM > 12) {
        upgrades.push('Upgrade to 16GB+ VRAM GPU');
    }

    return upgrades;
}

function calculateGPUUpgradeImprovement(gpu: GPUData): number {
    const currentScore = gpu.performanceScore;
    const targetScore = Math.min(90, currentScore + 25);

    return Math.round(((targetScore - currentScore) / currentScore) * 100);
}

function calculateCPUUpgradeImprovement(cpu: CPUData): number {
    const currentScore = cpu.performanceScore;
    const targetScore = Math.min(90, currentScore + 20);

    return Math.round(((targetScore - currentScore) / currentScore) * 100);
}

function calculateMemoryUpgradeImprovement(currentVRAM: number, requiredVRAM: number): number {
    if (currentVRAM >= requiredVRAM * 1.5) return 5;
    if (currentVRAM >= requiredVRAM) return 15;
    if (currentVRAM >= requiredVRAM * 0.75) return 30;

    return 50;
}
