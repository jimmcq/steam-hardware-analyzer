'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BottleneckDetector } from '@/components/analysis/BottleneckDetector';
import { UpgradePrediction } from '@/components/analysis/UpgradePrediction';
import { GPUDatabase } from '@/lib/gpu-database/specifications';
import { GPUData, GameRequirements } from '@/types';

// Mock game requirements data
const mockGameRequirements: GameRequirements[] = [
    {
        name: 'Cyberpunk 2077',
        minimumSpecs: {
            gpu: { model: 'GTX 1060', performanceScore: 45 },
            vram: 6,
            cpu: 'Intel i5-3570K',
            ram: 8,
        },
        recommendedSpecs: {
            gpu: { model: 'RTX 3070', performanceScore: 70 },
            vram: 8,
            cpu: 'Intel i7-4790',
            ram: 12,
        },
        resolution: '1920x1080',
        targetFps: 60,
        settings: 'High',
    },
    {
        name: "Baldur's Gate 3",
        minimumSpecs: {
            gpu: { model: 'GTX 970', performanceScore: 40 },
            vram: 4,
            cpu: 'Intel i5-4690',
            ram: 8,
        },
        recommendedSpecs: {
            gpu: { model: 'RTX 2060', performanceScore: 60 },
            vram: 6,
            cpu: 'Intel i7-8700K',
            ram: 16,
        },
        resolution: '1920x1080',
        targetFps: 60,
        settings: 'Medium',
    },
    {
        name: 'Call of Duty: Modern Warfare III',
        minimumSpecs: {
            gpu: { model: 'GTX 1650', performanceScore: 42 },
            vram: 4,
            cpu: 'Intel i5-6600K',
            ram: 8,
        },
        recommendedSpecs: {
            gpu: { model: 'RTX 3060 Ti', performanceScore: 65 },
            vram: 8,
            cpu: 'Intel i7-7700K',
            ram: 16,
        },
        resolution: '1920x1080',
        targetFps: 60,
        settings: 'High',
    },
    {
        name: 'Forza Horizon 5',
        minimumSpecs: {
            gpu: { model: 'GTX 1050 Ti', performanceScore: 38 },
            vram: 4,
            cpu: 'Intel i5-4460',
            ram: 8,
        },
        recommendedSpecs: {
            gpu: { model: 'GTX 1070', performanceScore: 55 },
            vram: 8,
            cpu: 'Intel i5-8400',
            ram: 16,
        },
        resolution: '1920x1080',
        targetFps: 60,
        settings: 'High',
    },
    {
        name: 'Alan Wake 2',
        minimumSpecs: {
            gpu: { model: 'RTX 2060', performanceScore: 55 },
            vram: 6,
            cpu: 'Intel i5-7600K',
            ram: 16,
        },
        recommendedSpecs: {
            gpu: { model: 'RTX 3070', performanceScore: 75 },
            vram: 8,
            cpu: 'Intel i7-9700K',
            ram: 16,
        },
        resolution: '1920x1080',
        targetFps: 60,
        settings: 'Medium',
    },
    {
        name: 'Spider-Man Remastered',
        minimumSpecs: {
            gpu: { model: 'GTX 950', performanceScore: 35 },
            vram: 2,
            cpu: 'Intel i3-4160',
            ram: 8,
        },
        recommendedSpecs: {
            gpu: { model: 'GTX 1060', performanceScore: 50 },
            vram: 6,
            cpu: 'Intel i5-4670',
            ram: 16,
        },
        resolution: '1920x1080',
        targetFps: 60,
        settings: 'High',
    },
];

export default function Analysis() {
    const [gpuData, setGpuData] = useState<GPUData[]>([]);
    const [selectedGPU, setSelectedGPU] = useState<string>('');
    const [selectedGame, setSelectedGame] = useState<string>('');
    const [currentTab, setCurrentTab] = useState<'bottleneck' | 'upgrade'>('bottleneck');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const allGPUs = GPUDatabase.getAllGPUs();
        setGpuData(allGPUs);
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Prevent hydration mismatch
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Performance Analysis
                            </h1>
                            <p className="text-gray-600">
                                Analyze bottlenecks and get upgrade recommendations
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/"
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                ← Back to Home
                            </Link>
                            <Link
                                href="/dashboard"
                                className="text-purple-600 hover:text-purple-800 font-medium"
                            >
                                View Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4">
                    <nav className="flex space-x-8">
                        <button
                            onClick={() => setCurrentTab('bottleneck')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                currentTab === 'bottleneck'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Bottleneck Detection
                        </button>
                        <button
                            onClick={() => setCurrentTab('upgrade')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                currentTab === 'upgrade'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Upgrade Recommendations
                        </button>
                    </nav>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                {currentTab === 'bottleneck' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <BottleneckDetector
                            gpuData={gpuData}
                            gameRequirements={mockGameRequirements}
                            selectedGPU={selectedGPU}
                            selectedGame={selectedGame}
                            onGPUSelect={setSelectedGPU}
                            onGameSelect={setSelectedGame}
                        />
                    </div>
                )}

                {currentTab === 'upgrade' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <UpgradePrediction
                            currentGPU={selectedGPU}
                            gpuData={gpuData}
                            budget={1000}
                            targetResolution="1440p"
                            targetFramerate={60}
                        />
                    </div>
                )}

                {/* Quick GPU Selection for Upgrade Tab */}
                {currentTab === 'upgrade' && !selectedGPU && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Start</h3>
                        <p className="text-blue-700 mb-4">
                            Select your current GPU to get personalized upgrade recommendations:
                        </p>
                        <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-4">
                            {gpuData.slice(0, 8).map(gpu => (
                                <button
                                    key={gpu.model}
                                    onClick={() => setSelectedGPU(gpu.model)}
                                    className="p-2 bg-white border border-blue-300 rounded text-sm hover:bg-blue-50 transition-colors"
                                >
                                    {gpu.model}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Information Panel */}
                <div className="mt-8 bg-gray-100 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">How It Works</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Bottleneck Detection</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Compares your GPU specs with game requirements</li>
                                <li>• Identifies VRAM limitations and performance gaps</li>
                                <li>• Provides specific optimization recommendations</li>
                                <li>• Analyzes system component balance</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">
                                Upgrade Recommendations
                            </h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• AI-powered upgrade scoring based on performance gains</li>
                                <li>• Price-to-performance ratio analysis</li>
                                <li>• Future-proofing and market trend consideration</li>
                                <li>• Personalized recommendations for your budget</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
