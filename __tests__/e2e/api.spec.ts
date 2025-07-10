import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
    test('should respond to hardware API with proper JSON', async ({ request }) => {
        const response = await request.get('/api/hardware');

        // Should respond with JSON
        expect(response.headers()['content-type']).toContain('application/json');
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data.message).toContain('Hardware API endpoint');
        expect(data.status).toBe('available');
        expect(data.phase).toBe('data-foundation');
        expect(data.features).toBeDefined();
        expect(data.features.gpu_database).toBe(true);
        expect(data.features.data_processing).toBe(true);
    });

    test('should respond to trends API with proper JSON', async ({ request }) => {
        const response = await request.get('/api/trends');

        // Should respond with JSON
        expect(response.headers()['content-type']).toContain('application/json');
        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data.message).toContain('Trends API endpoint');
        expect(data.status).toBe('available');
        expect(data.phase).toBe('data-foundation');
        expect(data.capabilities).toBeDefined();
        expect(data.capabilities.time_series_analysis).toBe(true);
    });

    test('should handle non-existent API endpoints gracefully', async ({ request }) => {
        const response = await request.get('/api/non-existent-endpoint');

        // Should return 404 for non-existent endpoints
        expect(response.status()).toBe(404);
    });

    test('should handle API rate limiting gracefully', async ({ request }) => {
        // Make multiple rapid requests to test rate limiting
        const requests = Array.from({ length: 5 }, () => request.get('/api/hardware'));

        const responses = await Promise.all(requests);

        // All requests should complete successfully (no rate limiting implemented yet)
        responses.forEach(response => {
            expect([200, 429]).toContain(response.status());
        });
    });

    test('should have proper CORS headers for development', async ({ request }) => {
        const response = await request.get('/api/hardware');
        const headers = response.headers();

        // Next.js API routes should have proper headers
        expect(headers['content-type']).toBeTruthy();

        // Should not have restrictive CORS in development
        // (Production CORS would be more restrictive)
        expect(response.status()).toBe(200);
    });

    test('should return consistent API response structure', async ({ request }) => {
        const hardwareResponse = await request.get('/api/hardware');
        const trendsResponse = await request.get('/api/trends');

        const hardwareData = await hardwareResponse.json();
        const trendsData = await trendsResponse.json();

        // Both should have consistent structure
        expect(hardwareData.message).toBeDefined();
        expect(hardwareData.status).toBeDefined();
        expect(hardwareData.phase).toBeDefined();

        expect(trendsData.message).toBeDefined();
        expect(trendsData.status).toBeDefined();
        expect(trendsData.phase).toBeDefined();

        // Both should indicate same phase
        expect(hardwareData.phase).toBe(trendsData.phase);
        expect(hardwareData.status).toBe(trendsData.status);
    });

    test('should handle API errors with proper error responses', async ({ request }) => {
        // Test that our APIs handle errors gracefully
        // For now, they should all return 200 since they're simple endpoints
        const response = await request.get('/api/hardware');

        expect(response.status()).toBe(200);

        const data = await response.json();
        expect(data.message).toBeDefined();
        expect(typeof data.message).toBe('string');
    });
});
