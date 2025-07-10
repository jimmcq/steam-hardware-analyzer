'use client';

import { useState, useEffect } from 'react';

export default function Home() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Prevent hydration mismatch
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
            <main className="container mx-auto px-4 py-8">
                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                        Steam Hardware Analyzer
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Analyze Steam Hardware Survey data to identify gaming hardware trends,
                        predict upgrade patterns, and provide insights into GPU market dynamics.
                    </p>
                </header>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white ml-3">
                                Hardware Trends
                            </h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                            Track GPU market share evolution, adoption curves for new generations,
                            and performance tier distribution over time.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white ml-3">
                                Bottleneck Detection
                            </h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                            Match hardware profiles with game requirements to identify performance
                            bottlenecks and optimization priorities.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                                <svg
                                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                                    />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white ml-3">
                                Market Intelligence
                            </h2>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                            Analyze GPU release impact, price-to-performance trends, and adoption
                            rate predictions with game release correlations.
                        </p>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Coming Soon
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-not-allowed opacity-50"
                            disabled
                        >
                            Hardware Analysis Dashboard
                        </button>
                        <button
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-not-allowed opacity-50"
                            disabled
                        >
                            Bottleneck Detector
                        </button>
                        <button
                            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-not-allowed opacity-50"
                            disabled
                        >
                            Market Trends Viewer
                        </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">
                        Phase 2 (Analysis Engine) Complete • Interactive UI Coming in Phase 3
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 dark:bg-gray-800 py-8 mt-16">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                        Built with ❤️ by{' '}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            Jim McQuillan
                        </span>
                    </p>
                    <div className="flex justify-center space-x-6 text-sm mb-2">
                        <a
                            href="https://github.com/jimmcq"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            GitHub
                        </a>
                        <a
                            href="https://linkedin.com/in/jimmcquillan/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            LinkedIn
                        </a>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        © 2025 Jim McQuillan. Open source under MIT License.
                    </p>
                </div>
            </footer>
        </div>
    );
}
