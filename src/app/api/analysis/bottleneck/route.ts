import { NextResponse } from 'next/server';
import { calculateBottleneck } from '@/lib/algorithms/bottleneck-calc';
import { GPUData, CPUData } from '@/types/hardware';
import { GameRequirements } from '@/types/steam-data';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { gpu, cpu, game } = body;

        if (!gpu || !cpu || !game) {
            return NextResponse.json(
                { error: 'Missing required fields: gpu, cpu, game' },
                { status: 400 }
            );
        }

        const gpuData: GPUData = {
            model: gpu.model || 'Unknown GPU',
            manufacturer: gpu.manufacturer || 'NVIDIA',
            tier: gpu.tier || 'Mid-Range',
            releaseDate: new Date(gpu.releaseDate || '2023-01-01'),
            performanceScore: gpu.performanceScore || 70,
            marketShare: [],
            vram: gpu.vram || 8,
            architecture: gpu.architecture || 'Ada Lovelace',
        };

        const cpuData: CPUData = {
            model: cpu.model || 'Unknown CPU',
            manufacturer: cpu.manufacturer || 'Intel',
            cores: cpu.cores || 8,
            threads: cpu.threads || 16,
            baseFreq: cpu.baseFreq || 3.0,
            boostFreq: cpu.boostFreq || 4.5,
            releaseDate: new Date(cpu.releaseDate || '2023-01-01'),
            performanceScore: cpu.performanceScore || 75,
        };

        const gameData: GameRequirements = {
            gameId: game.gameId || 'unknown',
            name: game.name || 'Generic Game',
            minimumGPU: game.minimumGPU || 'GTX 1060',
            recommendedGPU: game.recommendedGPU || 'RTX 3070',
            minimumCPU: game.minimumCPU || 'i5-8400',
            recommendedCPU: game.recommendedCPU || 'i7-10700K',
            minimumRAM: game.minimumRAM || 8,
            recommendedRAM: game.recommendedRAM || 16,
            minimumVRAM: game.minimumVRAM || 4,
            recommendedVRAM: game.recommendedVRAM || 8,
        };

        const analysis = calculateBottleneck(gpuData, cpuData, gameData);

        return NextResponse.json({
            message: 'Bottleneck analysis complete',
            status: 'success',
            analysis,
            metadata: {
                analysis_date: new Date().toISOString(),
                confidence: 'High',
                algorithm_version: '1.0',
            },
        });
    } catch (error) {
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Bottleneck analysis error:', error);
        }
        return NextResponse.json({ error: 'Failed to analyze bottleneck' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Bottleneck Analysis API',
        method: 'POST',
        description: 'Analyze hardware bottlenecks for specific configurations',
        required_fields: ['gpu', 'cpu', 'game'],
        example: {
            gpu: {
                model: 'RTX 4070',
                manufacturer: 'NVIDIA',
                performanceScore: 85,
                vram: 12,
                architecture: 'Ada Lovelace',
            },
            cpu: {
                model: 'i7-13700K',
                manufacturer: 'Intel',
                cores: 16,
                threads: 24,
                baseFreq: 3.4,
                boostFreq: 5.4,
                performanceScore: 90,
            },
            game: {
                name: 'Cyberpunk 2077',
                recommendedVRAM: 8,
                recommendedRAM: 16,
            },
        },
    });
}
