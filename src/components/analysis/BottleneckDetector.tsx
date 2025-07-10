'use client';

import { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, Cpu, HardDrive, Zap } from 'lucide-react';
import { GPUData, GameRequirements } from '@/types';

interface BottleneckDetectorProps {
    gpuData: GPUData[];
    gameRequirements: GameRequirements[];
    selectedGPU?: string;
    selectedGame?: string;
    onGPUSelect?: (gpu: string) => void;
    onGameSelect?: (game: string) => void;
}

interface BottleneckResult {
    component: 'GPU' | 'CPU' | 'VRAM' | 'System';
    severity: 'none' | 'minor' | 'moderate' | 'severe';
    impact: number; // 0-100
    description: string;
    recommendation: string;
}

function BottleneckCard({ result }: { result: BottleneckResult }) {
    const getIcon = () => {
        switch (result.component) {
            case 'GPU':
                return <Zap className="w-5 h-5" />;
            case 'CPU':
                return <Cpu className="w-5 h-5" />;
            case 'VRAM':
                return <HardDrive className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    const getSeverityColor = () => {
        switch (result.severity) {
            case 'none':
                return 'border-green-200 bg-green-50 text-green-800';
            case 'minor':
                return 'border-yellow-200 bg-yellow-50 text-yellow-800';
            case 'moderate':
                return 'border-orange-200 bg-orange-50 text-orange-800';
            case 'severe':
                return 'border-red-200 bg-red-50 text-red-800';
            default:
                return 'border-gray-200 bg-gray-50 text-gray-800';
        }
    };

    const getSeverityIcon = () => {
        switch (result.severity) {
            case 'none':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'minor':
                return <Info className="w-4 h-4 text-yellow-600" />;
            case 'moderate':
                return <AlertTriangle className="w-4 h-4 text-orange-600" />;
            case 'severe':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <Info className="w-4 h-4 text-gray-600" />;
        }
    };

    return (
        <div className={`p-4 rounded-lg border-2 ${getSeverityColor()}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    {getIcon()}
                    <h3 className="font-semibold">{result.component}</h3>
                </div>
                <div className="flex items-center gap-2">
                    {getSeverityIcon()}
                    <span className="text-sm font-medium capitalize">{result.severity}</span>
                </div>
            </div>

            <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                    <span>Impact Level</span>
                    <span className="font-medium">{result.impact}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all ${
                            result.impact > 75
                                ? 'bg-red-500'
                                : result.impact > 50
                                  ? 'bg-orange-500'
                                  : result.impact > 25
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                        }`}
                        style={{ width: `${result.impact}%` }}
                    />
                </div>
            </div>

            <p className="text-sm mb-3 opacity-90">{result.description}</p>

            <div className="text-sm">
                <strong>Recommendation:</strong> {result.recommendation}
            </div>
        </div>
    );
}

export function BottleneckDetector({
    gpuData,
    gameRequirements,
    selectedGPU,
    selectedGame,
    onGPUSelect,
    onGameSelect,
}: BottleneckDetectorProps) {
    const [customSpecs, setCustomSpecs] = useState({
        cpu: 'Intel i5-12400',
        ram: 16,
        resolution: '1920x1080',
    });

    const bottleneckAnalysis = useMemo(() => {
        if (!selectedGPU || !selectedGame) return null;

        const gpu = gpuData.find(g => g.model === selectedGPU);
        const game = gameRequirements.find(g => g.name === selectedGame);

        if (!gpu || !game) return null;

        const results: BottleneckResult[] = [];

        // GPU Performance Analysis
        const gpuScore = gpu.performanceScore;
        const requiredGPUScore = game.recommendedSpecs?.gpu.performanceScore || 60;
        const gpuRatio = gpuScore / requiredGPUScore;

        if (gpuRatio >= 1.5) {
            results.push({
                component: 'GPU',
                severity: 'none',
                impact: 0,
                description: 'GPU performance exceeds requirements significantly',
                recommendation: 'Consider higher resolution or enhanced settings',
            });
        } else if (gpuRatio >= 1.0) {
            results.push({
                component: 'GPU',
                severity: 'minor',
                impact: 15,
                description: 'GPU meets requirements with some headroom',
                recommendation: 'Performance should be stable at recommended settings',
            });
        } else if (gpuRatio >= 0.8) {
            results.push({
                component: 'GPU',
                severity: 'moderate',
                impact: 45,
                description: 'GPU slightly below recommended requirements',
                recommendation: 'Consider lowering graphics settings or resolution',
            });
        } else {
            results.push({
                component: 'GPU',
                severity: 'severe',
                impact: 75,
                description: 'GPU significantly below requirements',
                recommendation: 'Upgrade GPU or substantially reduce settings',
            });
        }

        // VRAM Analysis
        const vramRatio = gpu.vram / (game.recommendedSpecs?.vram || 8);

        if (vramRatio >= 1.5) {
            results.push({
                component: 'VRAM',
                severity: 'none',
                impact: 0,
                description: 'VRAM capacity exceeds requirements',
                recommendation: 'No VRAM limitations expected',
            });
        } else if (vramRatio >= 1.0) {
            results.push({
                component: 'VRAM',
                severity: 'minor',
                impact: 10,
                description: 'VRAM meets requirements',
                recommendation: 'Should handle recommended settings',
            });
        } else if (vramRatio >= 0.75) {
            results.push({
                component: 'VRAM',
                severity: 'moderate',
                impact: 35,
                description: 'VRAM may be limiting at high settings',
                recommendation: 'Monitor VRAM usage; reduce texture quality if needed',
            });
        } else {
            results.push({
                component: 'VRAM',
                severity: 'severe',
                impact: 60,
                description: 'VRAM capacity is insufficient',
                recommendation: 'Significantly reduce texture quality and resolution',
            });
        }

        // System Balance Analysis
        const systemBalance = Math.abs(gpuRatio - 1.0);
        if (systemBalance > 0.5) {
            results.push({
                component: 'System',
                severity: 'moderate',
                impact: 25,
                description: 'System components may not be well balanced',
                recommendation: 'Consider CPU upgrade or adjust settings for better balance',
            });
        }

        return results;
    }, [gpuData, gameRequirements, selectedGPU, selectedGame]);

    const overallBottleneck = useMemo(() => {
        if (!bottleneckAnalysis) return null;

        const maxImpact = Math.max(...bottleneckAnalysis.map(r => r.impact));
        const primaryBottleneck = bottleneckAnalysis.find(r => r.impact === maxImpact);

        return {
            severity: primaryBottleneck?.severity || 'none',
            component: primaryBottleneck?.component || 'System',
            impact: maxImpact,
        };
    }, [bottleneckAnalysis]);

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Bottleneck Analysis</h2>
                <p className="text-gray-600">
                    Analyze potential performance limitations in your gaming setup
                </p>
            </div>

            {/* Configuration Panel */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Configuration</h3>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select GPU
                        </label>
                        <select
                            value={selectedGPU || ''}
                            onChange={e => onGPUSelect && onGPUSelect(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">Choose a GPU...</option>
                            {gpuData.map(gpu => (
                                <option key={gpu.model} value={gpu.model}>
                                    {gpu.model} - {gpu.vram}GB VRAM
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Game
                        </label>
                        <select
                            value={selectedGame || ''}
                            onChange={e => onGameSelect && onGameSelect(e.target.value)}
                            className="w-full p-2 border rounded-md"
                        >
                            <option value="">Choose a game...</option>
                            {gameRequirements.map(game => (
                                <option key={game.name} value={game.name}>
                                    {game.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CPU</label>
                        <input
                            type="text"
                            value={customSpecs.cpu}
                            onChange={e =>
                                setCustomSpecs(prev => ({ ...prev, cpu: e.target.value }))
                            }
                            className="w-full p-2 border rounded-md text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            RAM (GB)
                        </label>
                        <input
                            type="number"
                            value={customSpecs.ram}
                            onChange={e =>
                                setCustomSpecs(prev => ({
                                    ...prev,
                                    ram: parseInt(e.target.value, 10),
                                }))
                            }
                            className="w-full p-2 border rounded-md text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resolution
                        </label>
                        <select
                            value={customSpecs.resolution}
                            onChange={e =>
                                setCustomSpecs(prev => ({ ...prev, resolution: e.target.value }))
                            }
                            className="w-full p-2 border rounded-md text-sm"
                        >
                            <option value="1920x1080">1920x1080 (1080p)</option>
                            <option value="2560x1440">2560x1440 (1440p)</option>
                            <option value="3840x2160">3840x2160 (4K)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Overall Assessment */}
            {overallBottleneck && (
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">Overall Assessment</h3>
                    <div className="flex items-center gap-4 mb-4">
                        <div
                            className={`px-4 py-2 rounded-full text-sm font-medium ${
                                overallBottleneck.severity === 'none'
                                    ? 'bg-green-100 text-green-800'
                                    : overallBottleneck.severity === 'minor'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : overallBottleneck.severity === 'moderate'
                                        ? 'bg-orange-100 text-orange-800'
                                        : 'bg-red-100 text-red-800'
                            }`}
                        >
                            {overallBottleneck.severity === 'none'
                                ? 'No Bottleneck'
                                : `${overallBottleneck.component} Bottleneck`}
                        </div>
                        <div className="text-sm text-gray-600">
                            Impact: {overallBottleneck.impact}%
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Analysis */}
            {bottleneckAnalysis && bottleneckAnalysis.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Detailed Analysis</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {bottleneckAnalysis.map(result => (
                            <BottleneckCard key={result.component} result={result} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a GPU and game to start bottleneck analysis</p>
                </div>
            )}
        </div>
    );
}
