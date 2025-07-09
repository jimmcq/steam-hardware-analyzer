# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Steam Hardware Survey Analyzer - A Next.js 14 web application that analyzes Steam Hardware Survey data to identify gaming hardware trends, predict upgrade patterns, and provide insights into GPU market dynamics.

## Development Commands

### Build & Development

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Type checking
yarn type-check

# Linting
yarn lint
```

### Testing

```bash
# Run all tests
yarn test

# Run unit tests only
yarn test:unit

# Run integration tests
yarn test:integration

# Run end-to-end tests with Playwright
yarn test:e2e

# Run tests with coverage
yarn test:coverage

# Run specific test file
yarn test data-processor/normalizer.test.ts
```

## Architecture Overview

### Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Data Visualization:** D3.js for custom charts, Recharts for standard
- **State Management:** TanStack Query for data fetching/caching
- **Testing:** Jest, React Testing Library, Playwright for E2E
- **Data Processing:** Native JavaScript/TypeScript (no external ML libraries)

### Core Architecture

The application follows a layered architecture:

```
Data Pipeline Flow:
Steam Survey Data (JSON/CSV) → Data Normalization Layer →
Processed Data Store (JSON files) → API Routes (Next.js) →
React Components with Real-time Analysis
```

### Key Directory Structure

- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - React components organized by feature (charts, analysis, ui)
- `src/lib/` - Core business logic and utilities
    - `data-processor/` - Data normalization, aggregation, and analysis
    - `gpu-database/` - GPU specifications, benchmarks, and hierarchy
    - `algorithms/` - Clustering, trend detection, and bottleneck calculation
- `src/hooks/` - Custom React hooks for data fetching and state management
- `src/types/` - TypeScript type definitions
- `src/data/` - Static data files (Steam surveys, GPU specs, game requirements)
- `__tests__/` - Test files organized by type (unit, integration, e2e)

### Core Data Types

The application centers around these key interfaces:

- `GPUData` - GPU model, manufacturer, tier, performance metrics
- `HardwareSurveyEntry` - Steam survey data with GPU/CPU distribution
- `TrendAnalysis` - Market trend detection results
- `BottleneckAnalysis` - Performance bottleneck calculations

### API Routes

- `/api/hardware` - Current hardware distribution
- `/api/trends` - Historical trends with configurable time ranges
- `/api/analysis/bottleneck` - Performance analysis for configurations
- `/api/analysis/upgrade-prediction` - Upgrade likelihood scoring

## Key Development Patterns

### Data Processing

- All data transformations use pure functions with immutable operations
- Data validation and cleaning happen at ingestion
- Memoized calculations for performance optimization
- Graceful degradation for missing data

### Testing Strategy

- Target 90% test coverage for algorithms and data processing
- Mock data generators for consistent testing
- Integration tests for API routes and data flow
- E2E tests for critical user journeys

### Error Handling

- Comprehensive error boundaries in React components
- User-friendly error messages with fallbacks
- Logging for debugging and monitoring
- Validation of edge cases (missing data, format changes)

## Performance Considerations

- Data caching strategies with TanStack Query
- Code splitting for optimal bundle size
- ISR (Incremental Static Regeneration) for monthly data updates
- Efficient data structures for large datasets
- Progressive data loading for visualizations
