import { NextResponse } from 'next/server';
import { MockDataGenerator } from '@/lib/data-processor/mock-data';
import { detectMarketTrends, predictMarketEvolution } from '@/lib/algorithms/trend-detection';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const window = parseInt(searchParams.get('window') || '6', 10);
        const includePredictions = searchParams.get('predictions') === 'true';

        const mockData = MockDataGenerator.generateHardwareSurveyData(18);
        const marketShareData = mockData.flatMap(entry => entry.gpuDistribution);

        const trends = detectMarketTrends(marketShareData, window);

        interface TrendsResponse {
            message: string;
            status: string;
            phase: string;
            trends: typeof trends;
            metadata: {
                analysis_window: number;
                data_points: number;
                timeframe: string;
            };
            predictions?: {
                forecast_months: number;
                predicted_data: ReturnType<typeof predictMarketEvolution>;
                confidence_note: string;
            };
        }

        const response: TrendsResponse = {
            message: 'GPU market trends analysis',
            status: 'available',
            phase: 'analysis-engine',
            trends,
            metadata: {
                analysis_window: window,
                data_points: marketShareData.length,
                timeframe: trends.timeframe,
            },
        };

        if (includePredictions) {
            const predictions = predictMarketEvolution(marketShareData, 6);
            response.predictions = {
                forecast_months: 6,
                predicted_data: predictions,
                confidence_note: 'Predictions based on historical trends',
            };
        }

        return NextResponse.json(response);
    } catch (error) {
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Trends API error:', error);
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
