# Steam Hardware Survey Analyzer - Development Plan

## Project Overview

A web application that analyzes Steam Hardware Survey data to identify gaming hardware trends, predict upgrade patterns, and provide insights into GPU market dynamics.

## Core Features

### 1. Hardware Trend Analysis

- Historical GPU market share visualization
- Adoption curves for new GPU generations
- Performance tier distribution over time
- Regional hardware preferences

### 2. GPU Bottleneck Detector

- Match hardware profiles with game requirements
- Calculate performance scores for popular games
- Identify upgrade bottlenecks
- Recommend optimization priorities

### 3. Market Intelligence Dashboard

- GPU release impact on market share
- Price-to-performance trends
- Adoption rate predictions
- Correlation with major game releases

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Data Visualization:** D3.js for custom charts, Recharts for standard
- **State Management:** TanStack Query for data fetching/caching
- **Testing:** Jest, React Testing Library, Playwright for E2E
- **Data Processing:** Native JavaScript/TypeScript (no external ML libraries)
- **Deployment:** Vercel with ISR for data updates

## Architecture

### Data Pipeline

```
Steam Survey Data (JSON/CSV)
    ↓
Data Normalization Layer
    ↓
Processed Data Store (JSON files)
    ↓
API Routes (Next.js)
    ↓
React Components with Real-time Analysis
```

### Project Structure

```
steam-hardware-analyzer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── hardware/route.ts
│   │   │   ├── trends/route.ts
│   │   │   └── analysis/route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── analysis/
│   │       └── page.tsx
│   ├── components/
│   │   ├── charts/
│   │   │   ├── MarketShareChart.tsx
│   │   │   ├── PerformanceScatter.tsx
│   │   │   └── AdoptionCurve.tsx
│   │   ├── analysis/
│   │   │   ├── BottleneckDetector.tsx
│   │   │   ├── UpgradePrediction.tsx
│   │   │   └── TrendInsights.tsx
│   │   └── ui/
│   │       ├── Card.tsx
│   │       ├── Select.tsx
│   │       └── LoadingState.tsx
│   ├── lib/
│   │   ├── data-processor/
│   │   │   ├── normalizer.ts
│   │   │   ├── aggregator.ts
│   │   │   └── analyzer.ts
│   │   ├── gpu-database/
│   │   │   ├── specifications.ts
│   │   │   ├── benchmarks.ts
│   │   │   └── hierarchy.ts
│   │   └── algorithms/
│   │       ├── clustering.ts
│   │       ├── trend-detection.ts
│   │       └── bottleneck-calc.ts
│   ├── hooks/
│   │   ├── useHardwareData.ts
│   │   ├── useTrendAnalysis.ts
│   │   └── usePerformanceScore.ts
│   ├── types/
│   │   ├── hardware.ts
│   │   ├── analysis.ts
│   │   └── steam-data.ts
│   └── data/
│       ├── steam-surveys/      # Historical survey data
│       ├── gpu-specs/          # GPU specifications
│       └── game-requirements/  # Game system requirements
├── __tests__/
│   ├── unit/
│   │   ├── data-processor/
│   │   ├── algorithms/
│   │   └── gpu-database/
│   ├── integration/
│   │   ├── api/
│   │   └── hooks/
│   └── e2e/
│       └── user-flows.spec.ts
└── docs/
    ├── data-sources.md
    ├── algorithms.md
    └── architecture.md
```

## Implementation Phases

### Phase 1: Data Foundation (Days 1-3)

#### Data Collection & Processing

- Set up data ingestion for Steam Hardware Survey archives
- Create GPU specification database (model, performance tier, release date)
- Build data normalization pipeline
- Implement data validation and cleaning

#### Core Types & Interfaces

```typescript
interface GPUData {
    model: string;
    manufacturer: 'NVIDIA' | 'AMD' | 'Intel';
    tier: 'Entry' | 'Mid-Range' | 'High-End' | 'Enthusiast';
    releaseDate: Date;
    performanceScore: number;
    marketShare: TimeSeriesData[];
}

interface HardwareSurveyEntry {
    date: Date;
    gpuDistribution: GPUMarketShare[];
    cpuDistribution: CPUMarketShare[];
    resolutionData: ResolutionStats[];
    vramDistribution: MemoryStats[];
}
```

#### Testing Focus

- Unit tests for all data transformation functions
- Validation of edge cases (missing data, format changes)
- Mock data generators for consistent testing

### Phase 2: Analysis Engine (Days 4-6)

#### Core Algorithms

```typescript
// Simple clustering for hardware profiles
export function clusterUserProfiles(surveyData: HardwareSurveyEntry[]): UserCluster[] {
    // K-means implementation for grouping similar configurations
}

// Trend detection
export function detectMarketTrends(
    historical: GPUMarketShare[],
    window: number = 6
): TrendAnalysis {
    // Moving averages, growth rates, inflection points
}

// Bottleneck calculation
export function calculateBottleneck(
    gpu: GPUData,
    cpu: CPUData,
    targetGame: GameRequirements
): BottleneckAnalysis {
    // Performance scoring and limitation detection
}
```

#### API Routes

- `/api/hardware` - Current hardware distribution
- `/api/trends` - Historical trends with configurable time ranges
- `/api/analysis/bottleneck` - Performance analysis for configurations
- `/api/analysis/upgrade-prediction` - Upgrade likelihood scoring

#### Testing Strategy

- Comprehensive unit tests for algorithms
- Integration tests for API routes
- Performance benchmarks for data processing

### Phase 3: Visualization Layer (Days 7-9)

#### Interactive Charts

1. **Market Share Timeline**
    - Multi-series line chart for GPU models
    - Zoom and pan capabilities
    - Annotation for major releases

2. **Performance Distribution**
    - Scatter plot of performance vs adoption
    - Bubble size for market share
    - Interactive tooltips with details

3. **Upgrade Flow Visualization**
    - Sankey diagram showing upgrade paths
    - Time-based animation
    - Predictive projections

#### Dashboard Components

```typescript
// Real-time insights component
export function TrendInsights({ data }: { data: AnalysisData }) {
  return (
    <div className="grid gap-4">
      <InsightCard
        title="Fastest Growing GPU"
        metric={data.fastestGrowth}
        trend={data.growthRate}
      />
      <InsightCard
        title="Most Common Bottleneck"
        metric={data.bottleneckType}
        affected={data.affectedPercentage}
      />
    </div>
  );
}
```

### Phase 4: Polish & Optimization (Days 10-12)

#### Performance Optimization

- Implement data caching strategies
- Add loading states and skeleton screens
- Optimize bundle size with code splitting
- Set up ISR for monthly data updates

#### User Experience

- Responsive design for all viewports
- Keyboard navigation
- Export functionality for charts
- Share URLs for specific analyses

#### Documentation

- Comprehensive README with examples
- API documentation
- Data source attributions
- Algorithm explanations

## Testing Philosophy

### Unit Testing (Target: 90% coverage)

```typescript
describe('TrendDetection', () => {
    it('identifies growth trends correctly', () => {
        const data = generateMockMarketShare();
        const trends = detectMarketTrends(data);
        expect(trends.growing).toContain('RTX 4060');
    });

    it('handles sparse data gracefully', () => {
        const sparseData = generateSparseData();
        expect(() => detectMarketTrends(sparseData)).not.toThrow();
    });
});
```

### Integration Testing

- API route responses
- Data flow through components
- State management scenarios

### E2E Testing

- Critical user journeys
- Cross-browser compatibility
- Performance benchmarks

## Data Sources & Attribution

### Primary Sources

- Steam Hardware Survey monthly reports
- Public GPU benchmark databases
- Game system requirements from Steam API

### Data Update Strategy

- Monthly automated updates via GitHub Actions
- Fallback to cached data if sources unavailable
- Version control for historical data integrity

## Key Differentiators

### Clean Architecture

- Clear separation of concerns
- Immutable data transformations
- Pure functions for algorithms

### Robust Error Handling

- Graceful degradation for missing data
- User-friendly error messages
- Comprehensive logging

### Performance Focus

- Efficient data structures
- Memoized calculations
- Progressive data loading

## Success Metrics

- Sub-2s initial page load
- 90%+ test coverage on algorithms
- Accurate trend predictions (validated against historical data)
- Responsive visualizations handling 5+ years of data
- Zero runtime errors in production

## Deployment Strategy

- Vercel deployment with preview URLs
- Automated testing in CI/CD pipeline
- Performance monitoring with Web Vitals
- Monthly data refresh automation

This project demonstrates proficiency in data analysis, visualization, and building production-ready applications while focusing on a domain directly relevant to GPU computing and market analysis.
