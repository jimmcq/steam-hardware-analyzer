const nextJest = require('next/jest');

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    testEnvironment: 'jest-environment-jsdom',
    testPathIgnorePatterns: ['<rootDir>/__tests__/e2e/'],
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/app/**/*.{js,jsx,ts,tsx}', // Exclude app router files
        '!src/types/**/*.ts', // Exclude type definitions
        '!src/lib/data-processor/mock-data.ts', // Exclude mock data (test utility)
        '!src/lib/data-processor/ingestion.ts', // Exclude ingestion (placeholder implementation)
        '!src/lib/gpu-database/benchmarks.ts', // Exclude benchmarks (data initialization)
    ],
    coverageThreshold: {
        global: {
            branches: 85,
            functions: 90,
            lines: 90,
            statements: 90,
        },
        // Per-file thresholds for core modules
        'src/lib/data-processor/normalizer.ts': {
            branches: 95,
            functions: 100,
            lines: 95,
            statements: 95,
        },
        'src/lib/data-processor/aggregator.ts': {
            branches: 90,
            functions: 100,
            lines: 95,
            statements: 95,
        },
        'src/lib/data-processor/validator.ts': {
            branches: 75,
            functions: 100,
            lines: 80,
            statements: 80,
        },
    },
    coverageReporters: ['text', 'lcov', 'html'],
    coverageDirectory: 'coverage',
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
