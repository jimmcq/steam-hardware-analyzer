import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Return basic trends endpoint response
        return NextResponse.json({
            message: 'Trends API endpoint - Phase 1 (Data Foundation) Complete',
            status: 'available',
            phase: 'data-foundation',
            capabilities: {
                time_series_analysis: true,
                trend_calculation: true,
                market_share_aggregation: true,
                gpu_performance_tracking: true,
            },
            note: 'Full trends dashboard coming in Phase 2',
        });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
