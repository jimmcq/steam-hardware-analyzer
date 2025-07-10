'use client';

import { useState, useMemo } from 'react';
import { TrendingUp, Calendar, Zap } from 'lucide-react';
import { GPUData } from '@/types';

interface UpgradePredictionProps {
    currentGPU?: string;
    gpuData: GPUData[];
    budget?: number;
    targetResolution?: '1080p' | '1440p' | '4K';
    targetFramerate?: 60 | 120 | 144;
    onRecommendationSelect?: (gpu: GPUData) => void;
}

interface UpgradeScore {
    gpu: GPUData;
    score: number;
    reasonings: string[];
    pricePerformance: number;
    futureProof: number;
    marketTrend: 'rising' | 'stable' | 'declining';
}

function UpgradeCard({
    upgrade,
    rank,
    isSelected,
    onSelect,
}: {
    upgrade: UpgradeScore;
    rank: number;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const getTrendColor = () => {
        switch (upgrade.marketTrend) {
            case 'rising':
                return 'text-green-600';
            case 'stable':
                return 'text-blue-600';
            case 'declining':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getRankBadge = () => {
        const colors = ['bg-yellow-500', 'bg-gray-400', 'bg-orange-600'];

        if (rank > 3) return null;

        return (
            <div
                className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${colors[rank - 1]} text-white text-xs font-bold flex items-center justify-center`}
            >
                {rank}
            </div>
        );
    };

    return (
        <div
            className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={onSelect}
        >
            {getRankBadge()}

            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-semibold text-lg">{upgrade.gpu.model}</h3>
                    <p className="text-sm text-gray-600">{upgrade.gpu.manufacturer}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{upgrade.score}</div>
                    <div className="text-xs text-gray-500">Score</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-lg font-medium">{upgrade.gpu.vram}GB</div>
                    <div className="text-xs text-gray-500">VRAM</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-medium">{upgrade.gpu.performanceScore}</div>
                    <div className="text-xs text-gray-500">Performance</div>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price/Performance</span>
                    <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${upgrade.pricePerformance}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500">{upgrade.pricePerformance}%</span>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Future Proof</span>
                    <div className="flex items-center gap-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${upgrade.futureProof}%` }}
                            />
                        </div>
                        <span className="text-xs text-gray-500">{upgrade.futureProof}%</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
                <TrendingUp className={`w-4 h-4 ${getTrendColor()}`} />
                <span className={`text-sm capitalize ${getTrendColor()}`}>
                    {upgrade.marketTrend} trend
                </span>
            </div>

            <div className="space-y-1">
                {upgrade.reasonings.slice(0, 2).map(reason => (
                    <div key={reason} className="text-xs text-gray-600 flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full" />
                        {reason}
                    </div>
                ))}
            </div>
        </div>
    );
}

export function UpgradePrediction({
    currentGPU,
    gpuData,
    budget = 1000,
    targetResolution = '1440p',
    targetFramerate = 60,
    onRecommendationSelect,
}: UpgradePredictionProps) {
    const [selectedUpgrade, setSelectedUpgrade] = useState<GPUData | null>(null);

    const currentGPUData = useMemo(() => {
        return gpuData.find(gpu => gpu.model === currentGPU);
    }, [gpuData, currentGPU]);

    const upgradeRecommendations = useMemo(() => {
        if (!currentGPUData) return [];

        const recommendations: UpgradeScore[] = [];

        // Filter GPUs that are upgrades (higher performance)
        const eligibleGPUs = gpuData.filter(gpu => {
            // Must be newer or significantly more powerful
            const isUpgrade = gpu.performanceScore > currentGPUData.performanceScore * 1.2;
            const isRecentEnough = gpu.releaseDate > new Date('2022-01-01');
            return isUpgrade && isRecentEnough;
        });

        eligibleGPUs.forEach(gpu => {
            let score = 0;
            const reasonings: string[] = [];

            // Performance improvement calculation
            const performanceGain =
                (gpu.performanceScore - currentGPUData.performanceScore) /
                currentGPUData.performanceScore;
            const performancePoints = Math.min(performanceGain * 50, 40);
            score += performancePoints;

            if (performanceGain > 0.5) {
                reasonings.push(`${Math.round(performanceGain * 100)}% performance improvement`);
            }

            // VRAM consideration
            if (gpu.vram > currentGPUData.vram) {
                const vramGain = gpu.vram - currentGPUData.vram;
                score += Math.min(vramGain * 2, 15);
                reasonings.push(`+${vramGain}GB VRAM for future games`);
            }

            // Architecture bonus
            if (gpu.architecture !== currentGPUData.architecture) {
                const architectureMap: { [key: string]: number } = {
                    Blackwell: 10,
                    'RDNA 4': 8,
                    'Ada Lovelace': 6,
                    'RDNA 3': 4,
                };
                const architecturePoints = architectureMap[gpu.architecture] || 0;
                score += architecturePoints;

                if (architecturePoints > 0) {
                    reasonings.push(`Latest ${gpu.architecture} architecture`);
                }
            }

            // Market trend analysis

            let marketTrend: 'rising' | 'stable' | 'declining' = 'stable';
            if (gpu.marketShare.length >= 2) {
                const recent = gpu.marketShare.slice(-2);
                const trend = recent[1].value - recent[0].value;
                marketTrend = trend > 0.5 ? 'rising' : trend < -0.5 ? 'declining' : 'stable';
            }

            // Price-performance estimation (simplified)
            const estimatedPrice = gpu.performanceScore * 10; // Rough estimate
            const pricePerformance =
                budget > 0 ? Math.min((budget / estimatedPrice) * 100, 100) : 80;

            // Future-proofing score
            const releaseRecency =
                (Date.now() - gpu.releaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
            const futureProof = Math.max(100 - releaseRecency * 20, 20);

            // Target resolution bonus
            const resolutionRequirements = {
                '1080p': 60,
                '1440p': 80,
                '4K': 100,
            };

            if (gpu.performanceScore >= resolutionRequirements[targetResolution]) {
                score += 10;
                reasonings.push(`Excellent for ${targetResolution} gaming`);
            }

            // Framerate consideration
            if (targetFramerate > 60 && gpu.performanceScore > 85) {
                score += 5;
                reasonings.push(`Suitable for ${targetFramerate}fps gaming`);
            }

            recommendations.push({
                gpu,
                score: Math.round(score),
                reasonings,
                pricePerformance: Math.round(pricePerformance),
                futureProof: Math.round(futureProof),
                marketTrend,
            });
        });

        return recommendations.sort((a, b) => b.score - a.score).slice(0, 6); // Top 6 recommendations
    }, [currentGPUData, gpuData, budget, targetResolution, targetFramerate]);

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Recommendations</h2>
                <p className="text-gray-600">
                    AI-powered upgrade suggestions based on your current setup and preferences
                </p>
            </div>

            {/* Configuration */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Configuration</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current GPU
                        </label>
                        <div className="p-2 bg-gray-50 rounded-md text-sm">
                            {currentGPU || 'Select current GPU'}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget ($)
                        </label>
                        <input
                            type="number"
                            value={budget}
                            onChange={() => {
                                // This would be handled by parent component
                            }}
                            className="w-full p-2 border rounded-md text-sm"
                            min="0"
                            max="5000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target Resolution
                        </label>
                        <select
                            value={targetResolution}
                            onChange={() => {
                                // This would be handled by parent component
                            }}
                            className="w-full p-2 border rounded-md text-sm"
                        >
                            <option value="1080p">1080p</option>
                            <option value="1440p">1440p</option>
                            <option value="4K">4K</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Target FPS
                        </label>
                        <select
                            value={targetFramerate}
                            onChange={() => {
                                // This would be handled by parent component
                            }}
                            className="w-full p-2 border rounded-md text-sm"
                        >
                            <option value={60}>60 FPS</option>
                            <option value={120}>120 FPS</option>
                            <option value={144}>144 FPS</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Current GPU Info */}
            {currentGPUData && (
                <div className="bg-gray-50 p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-4">Current Setup</h3>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center">
                            <div className="text-xl font-bold text-blue-600">
                                {currentGPUData.model}
                            </div>
                            <div className="text-sm text-gray-500">Current GPU</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold">
                                {currentGPUData.performanceScore}
                            </div>
                            <div className="text-sm text-gray-500">Performance Score</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold">{currentGPUData.vram}GB</div>
                            <div className="text-sm text-gray-500">VRAM</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold">{currentGPUData.tier}</div>
                            <div className="text-sm text-gray-500">Tier</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Recommendations */}
            {upgradeRecommendations.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recommended Upgrades</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {upgradeRecommendations.map((upgrade, index) => (
                            <UpgradeCard
                                key={upgrade.gpu.model}
                                upgrade={upgrade}
                                rank={index + 1}
                                isSelected={selectedUpgrade?.model === upgrade.gpu.model}
                                onSelect={() => {
                                    setSelectedUpgrade(upgrade.gpu);
                                    onRecommendationSelect?.(upgrade.gpu);
                                }}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select your current GPU to see upgrade recommendations</p>
                </div>
            )}

            {/* Upgrade Timeline */}
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-4">Upgrade Timeline</h3>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <div>
                            <div className="font-medium">Optimal Upgrade Window</div>
                            <div className="text-sm text-gray-600">
                                Based on current market trends and upcoming releases
                            </div>
                        </div>
                    </div>

                    <div className="ml-9 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <div className="text-sm">
                                <strong>Now - 3 months:</strong> Good time to upgrade with current
                                pricing
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                            <div className="text-sm">
                                <strong>3-6 months:</strong> Wait for potential price drops
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                            <div className="text-sm">
                                <strong>6+ months:</strong> New generation releases may affect
                                prices
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
