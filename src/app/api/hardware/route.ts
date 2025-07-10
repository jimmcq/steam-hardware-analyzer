import { NextResponse } from 'next/server';
import { MockDataGenerator } from '@/lib/data-processor/mock-data';
import { clusterUserProfiles } from '@/lib/algorithms/clustering';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeAnalysis = searchParams.get('analysis') === 'true';

        const mockData = MockDataGenerator.generateHardwareSurveyData(12);

        interface HardwareResponse {
            message: string;
            status: string;
            phase: string;
            data: {
                survey_data: typeof mockData;
                total_entries: number;
                date_range: {
                    start: Date | undefined;
                    end: Date | undefined;
                };
            };
            analysis?: {
                user_clusters: ReturnType<typeof clusterUserProfiles>;
                cluster_count: number;
                largest_cluster: ReturnType<typeof clusterUserProfiles>[0] | undefined;
            };
        }

        const response: HardwareResponse = {
            message: 'Hardware distribution data',
            status: 'available',
            phase: 'analysis-engine',
            data: {
                survey_data: mockData,
                total_entries: mockData.length,
                date_range: {
                    start: mockData[0]?.date,
                    end: mockData[mockData.length - 1]?.date,
                },
            },
        };

        if (includeAnalysis) {
            const clusters = clusterUserProfiles(mockData);
            response.analysis = {
                user_clusters: clusters,
                cluster_count: clusters.length,
                largest_cluster: clusters.reduce(
                    (max, cluster) => (cluster.userCount > max.userCount ? cluster : max),
                    clusters[0]
                ),
            };
        }

        return NextResponse.json(response);
    } catch (error) {
        // Log error in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Hardware API error:', error);
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
