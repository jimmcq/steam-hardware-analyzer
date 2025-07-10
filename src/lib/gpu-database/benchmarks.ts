/**
 * GPU benchmark database with performance metrics for various games and resolutions
 */
export interface BenchmarkResult {
    gpuModel: string;
    game: string;
    resolution: '1080p' | '1440p' | '4K';
    settings: 'Low' | 'Medium' | 'High' | 'Ultra';
    averageFPS: number;
    minFPS: number;
    maxFPS: number;
    testDate: Date;
}

export class BenchmarkDatabase {
    private static benchmarks: BenchmarkResult[] = [];

    /**
     * Initialize benchmark database with performance data
     */
    static initialize(): void {
        // RTX 4090 benchmarks
        this.addBenchmark({
            gpuModel: 'RTX 4090',
            game: 'Cyberpunk 2077',
            resolution: '4K',
            settings: 'Ultra',
            averageFPS: 68,
            minFPS: 52,
            maxFPS: 85,
            testDate: new Date('2023-01-15'),
        });

        this.addBenchmark({
            gpuModel: 'RTX 4090',
            game: 'Call of Duty: Modern Warfare II',
            resolution: '4K',
            settings: 'Ultra',
            averageFPS: 142,
            minFPS: 118,
            maxFPS: 168,
            testDate: new Date('2023-01-15'),
        });

        this.addBenchmark({
            gpuModel: 'RTX 4090',
            game: 'Red Dead Redemption 2',
            resolution: '4K',
            settings: 'Ultra',
            averageFPS: 78,
            minFPS: 65,
            maxFPS: 92,
            testDate: new Date('2023-01-15'),
        });

        // RTX 4080 benchmarks
        this.addBenchmark({
            gpuModel: 'RTX 4080',
            game: 'Cyberpunk 2077',
            resolution: '4K',
            settings: 'High',
            averageFPS: 58,
            minFPS: 45,
            maxFPS: 72,
            testDate: new Date('2023-01-15'),
        });

        this.addBenchmark({
            gpuModel: 'RTX 4080',
            game: 'Call of Duty: Modern Warfare II',
            resolution: '4K',
            settings: 'High',
            averageFPS: 128,
            minFPS: 105,
            maxFPS: 152,
            testDate: new Date('2023-01-15'),
        });

        // RTX 4070 Ti benchmarks
        this.addBenchmark({
            gpuModel: 'RTX 4070 Ti',
            game: 'Cyberpunk 2077',
            resolution: '1440p',
            settings: 'Ultra',
            averageFPS: 82,
            minFPS: 68,
            maxFPS: 98,
            testDate: new Date('2023-02-01'),
        });

        this.addBenchmark({
            gpuModel: 'RTX 4070 Ti',
            game: 'Call of Duty: Modern Warfare II',
            resolution: '1440p',
            settings: 'Ultra',
            averageFPS: 165,
            minFPS: 142,
            maxFPS: 188,
            testDate: new Date('2023-02-01'),
        });

        // RTX 4070 benchmarks
        this.addBenchmark({
            gpuModel: 'RTX 4070',
            game: 'Cyberpunk 2077',
            resolution: '1440p',
            settings: 'High',
            averageFPS: 72,
            minFPS: 58,
            maxFPS: 86,
            testDate: new Date('2023-04-15'),
        });

        this.addBenchmark({
            gpuModel: 'RTX 4070',
            game: 'Call of Duty: Modern Warfare II',
            resolution: '1440p',
            settings: 'High',
            averageFPS: 148,
            minFPS: 125,
            maxFPS: 172,
            testDate: new Date('2023-04-15'),
        });

        // RTX 4060 Ti benchmarks
        this.addBenchmark({
            gpuModel: 'RTX 4060 Ti',
            game: 'Cyberpunk 2077',
            resolution: '1080p',
            settings: 'Ultra',
            averageFPS: 95,
            minFPS: 78,
            maxFPS: 115,
            testDate: new Date('2023-05-25'),
        });

        this.addBenchmark({
            gpuModel: 'RTX 4060 Ti',
            game: 'Call of Duty: Modern Warfare II',
            resolution: '1080p',
            settings: 'Ultra',
            averageFPS: 185,
            minFPS: 165,
            maxFPS: 205,
            testDate: new Date('2023-05-25'),
        });

        // AMD RX 7900 XTX benchmarks
        this.addBenchmark({
            gpuModel: 'RX 7900 XTX',
            game: 'Cyberpunk 2077',
            resolution: '4K',
            settings: 'Ultra',
            averageFPS: 62,
            minFPS: 48,
            maxFPS: 78,
            testDate: new Date('2023-01-10'),
        });

        this.addBenchmark({
            gpuModel: 'RX 7900 XTX',
            game: 'Call of Duty: Modern Warfare II',
            resolution: '4K',
            settings: 'Ultra',
            averageFPS: 135,
            minFPS: 112,
            maxFPS: 158,
            testDate: new Date('2023-01-10'),
        });

        // AMD RX 7900 XT benchmarks
        this.addBenchmark({
            gpuModel: 'RX 7900 XT',
            game: 'Cyberpunk 2077',
            resolution: '4K',
            settings: 'High',
            averageFPS: 55,
            minFPS: 42,
            maxFPS: 68,
            testDate: new Date('2023-01-10'),
        });

        this.addBenchmark({
            gpuModel: 'RX 7900 XT',
            game: 'Call of Duty: Modern Warfare II',
            resolution: '4K',
            settings: 'High',
            averageFPS: 122,
            minFPS: 98,
            maxFPS: 145,
            testDate: new Date('2023-01-10'),
        });

        // RTX 3080 benchmarks
        this.addBenchmark({
            gpuModel: 'RTX 3080',
            game: 'Cyberpunk 2077',
            resolution: '1440p',
            settings: 'Ultra',
            averageFPS: 68,
            minFPS: 55,
            maxFPS: 82,
            testDate: new Date('2022-06-15'),
        });

        this.addBenchmark({
            gpuModel: 'RTX 3080',
            game: 'Call of Duty: Modern Warfare II',
            resolution: '1440p',
            settings: 'Ultra',
            averageFPS: 145,
            minFPS: 122,
            maxFPS: 168,
            testDate: new Date('2022-06-15'),
        });

        // RTX 3070 benchmarks
        this.addBenchmark({
            gpuModel: 'RTX 3070',
            game: 'Cyberpunk 2077',
            resolution: '1440p',
            settings: 'High',
            averageFPS: 58,
            minFPS: 45,
            maxFPS: 72,
            testDate: new Date('2022-06-15'),
        });

        this.addBenchmark({
            gpuModel: 'RTX 3070',
            game: 'Call of Duty: Modern Warfare II',
            resolution: '1440p',
            settings: 'High',
            averageFPS: 128,
            minFPS: 105,
            maxFPS: 152,
            testDate: new Date('2022-06-15'),
        });

        // RTX 3060 Ti benchmarks
        this.addBenchmark({
            gpuModel: 'RTX 3060 Ti',
            game: 'Cyberpunk 2077',
            resolution: '1080p',
            settings: 'Ultra',
            averageFPS: 82,
            minFPS: 68,
            maxFPS: 98,
            testDate: new Date('2022-06-15'),
        });

        this.addBenchmark({
            gpuModel: 'RTX 3060 Ti',
            game: 'Call of Duty: Modern Warfare II',
            resolution: '1080p',
            settings: 'Ultra',
            averageFPS: 165,
            minFPS: 142,
            maxFPS: 188,
            testDate: new Date('2022-06-15'),
        });
    }

    /**
     * Add benchmark result to database
     */
    private static addBenchmark(benchmark: BenchmarkResult): void {
        this.benchmarks.push(benchmark);
    }

    /**
     * Get benchmark results for a specific GPU
     */
    static getBenchmarksForGPU(gpuModel: string): BenchmarkResult[] {
        return this.benchmarks.filter(b => b.gpuModel === gpuModel);
    }

    /**
     * Get benchmark results for a specific game
     */
    static getBenchmarksForGame(game: string): BenchmarkResult[] {
        return this.benchmarks.filter(b => b.game === game);
    }

    /**
     * Get benchmark results for specific resolution and settings
     */
    static getBenchmarksByResolutionAndSettings(
        resolution: '1080p' | '1440p' | '4K',
        settings: 'Low' | 'Medium' | 'High' | 'Ultra'
    ): BenchmarkResult[] {
        return this.benchmarks.filter(
            b => b.resolution === resolution && b.settings === settings
        );
    }

    /**
     * Get average FPS for a GPU in a specific game
     */
    static getAverageFPS(
        gpuModel: string,
        game: string,
        resolution: '1080p' | '1440p' | '4K' = '1080p',
        settings: 'Low' | 'Medium' | 'High' | 'Ultra' = 'High'
    ): number | undefined {
        const benchmark = this.benchmarks.find(
            b => b.gpuModel === gpuModel && 
                 b.game === game && 
                 b.resolution === resolution && 
                 b.settings === settings
        );
        
        return benchmark?.averageFPS;
    }

    /**
     * Compare GPUs performance in a specific game
     */
    static compareGPUPerformance(
        gpuModels: string[],
        game: string,
        resolution: '1080p' | '1440p' | '4K' = '1080p',
        settings: 'Low' | 'Medium' | 'High' | 'Ultra' = 'High'
    ): Array<{ gpu: string; fps: number }> {
        const results = gpuModels.map(gpu => {
            const fps = this.getAverageFPS(gpu, game, resolution, settings);
            return { gpu, fps: fps || 0 };
        });

        return results.sort((a, b) => b.fps - a.fps);
    }

    /**
     * Get all available games in benchmark database
     */
    static getAvailableGames(): string[] {
        const games = new Set(this.benchmarks.map(b => b.game));
        return Array.from(games);
    }

    /**
     * Get performance score for a GPU based on weighted average across games
     */
    static calculatePerformanceScore(
        gpuModel: string,
        resolution: '1080p' | '1440p' | '4K' = '1080p'
    ): number {
        const gpuBenchmarks = this.getBenchmarksForGPU(gpuModel).filter(
            b => b.resolution === resolution
        );

        if (gpuBenchmarks.length === 0) return 0;

        const totalFPS = gpuBenchmarks.reduce((sum, b) => sum + b.averageFPS, 0);
        const averageFPS = totalFPS / gpuBenchmarks.length;

        // Normalize to 0-100 scale (assuming 200 FPS as max for scaling)
        return Math.min(100, (averageFPS / 200) * 100);
    }

    /**
     * Get all benchmark results
     */
    static getAllBenchmarks(): BenchmarkResult[] {
        return [...this.benchmarks];
    }
}

// Initialize the benchmark database
BenchmarkDatabase.initialize();