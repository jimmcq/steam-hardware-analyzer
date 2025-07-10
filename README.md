# Steam Hardware Survey Analyzer

A Next.js 14 web application that analyzes Steam Hardware Survey data to identify gaming hardware trends, predict upgrade patterns, and provide insights into GPU market dynamics.

## Features

### 🔍 Hardware Trend Analysis

- Historical GPU market share visualization
- Adoption curves for new GPU generations
- Performance tier distribution over time
- Regional hardware preferences analysis

### 🎯 GPU Bottleneck Detection

- Match hardware profiles with game requirements
- Calculate performance scores for popular games
- Identify upgrade bottlenecks in gaming setups
- Recommend optimization priorities

### 📊 Market Intelligence Dashboard

- GPU release impact on market share
- Price-to-performance trend analysis
- Adoption rate predictions
- Correlation with major game releases

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Data Visualization:** D3.js for custom charts, Recharts for standard components
- **State Management:** TanStack Query for data fetching and caching
- **Testing:** Jest, React Testing Library, Playwright for E2E
- **Data Processing:** Native JavaScript/TypeScript (no external ML libraries)
- **Deployment:** Vercel with ISR for data updates

## Getting Started

### Prerequisites

- Node.js 20.17 or later (required for lint-staged compatibility)
- Yarn package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/jimmcq/steam-hardware-analyzer.git
cd steam-hardware-analyzer
```

2. Install dependencies:

```bash
yarn install
```

3. Run the development server:

```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development Commands

```bash
# Development
yarn dev              # Start development server
yarn build            # Build for production
yarn start            # Start production server

# Code Quality
yarn lint             # Run ESLint
yarn lint:fix         # Fix ESLint issues
yarn format           # Format code with Prettier
yarn format:check     # Check code formatting
yarn type-check       # Run TypeScript type checking

# Testing
yarn test             # Run all tests
yarn test:watch       # Run tests in watch mode
yarn test:coverage    # Run tests with coverage
yarn test:unit        # Run unit tests only
yarn test:integration # Run integration tests only
yarn test:e2e         # Run end-to-end tests
```

### Git Hooks

The project uses Husky to enforce code quality with automated git hooks:

#### Pre-commit Hook

Runs automatically before each commit:

- **Lint-staged:** Applies ESLint fixes and Prettier formatting to changed files
- **TypeScript type check:** Ensures type safety across the entire project
- **Full test suite:** Runs all unit and integration tests (98 tests)
- **Blocks commit:** Prevents commits if any check fails

#### Pre-push Hook

Runs automatically before pushing to remote:

- **Integration tests:** Validates end-to-end functionality (21 tests)
- **Production build:** Ensures the project builds successfully for deployment
- **Blocks push:** Prevents pushing if tests fail or build breaks

These hooks ensure that all code pushed to the repository passes the same quality checks as the CI/CD pipeline.

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
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   └── ...             # Pages and layouts
├── components/         # React components
│   ├── charts/         # Data visualization components
│   ├── analysis/       # Analysis and insight components
│   └── ui/             # Reusable UI components
├── lib/                # Core business logic
│   ├── data-processor/ # Data normalization and aggregation
│   ├── gpu-database/   # GPU specifications and benchmarks
│   └── algorithms/     # Analysis algorithms
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── data/               # Static data files
```

## Key Features

### Core Algorithms

- **Clustering:** K-means implementation for grouping similar hardware configurations
- **Trend Detection:** Moving averages, growth rates, and inflection point analysis
- **Bottleneck Calculation:** Performance scoring and hardware limitation detection

### API Endpoints

- `/api/hardware` - Current hardware distribution data
- `/api/trends` - Historical trends with configurable time ranges
- `/api/analysis/bottleneck` - Performance analysis for configurations
- `/api/analysis/upgrade-prediction` - Upgrade likelihood scoring

### Data Sources

- Steam Hardware Survey monthly reports
- Public GPU benchmark databases
- Game system requirements from Steam API

## Testing

The project maintains high test coverage with:

- **Unit Tests:** All data transformation functions and algorithms
- **Integration Tests:** API routes and data flow
- **E2E Tests:** Critical user journeys and cross-browser compatibility

Target: 90% test coverage on core algorithms and data processing.

## Performance

- Sub-2s initial page load
- Efficient data structures for large datasets
- Memoized calculations for performance
- Progressive data loading for visualizations
- ISR for monthly data updates

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the established code style
3. Write tests for new functionality
4. Run the full test suite and ensure all checks pass
5. Submit a pull request with a clear description

## License

This project is licensed under the MIT License.

## Author

**Jim McQuillan**

- GitHub: [https://github.com/jimmcq](https://github.com/jimmcq)
- LinkedIn: [https://www.linkedin.com/in/jimmcquillan/](https://www.linkedin.com/in/jimmcquillan/)
