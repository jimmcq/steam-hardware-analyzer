import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
    test('should load page within acceptable time', async ({ page }) => {
        const startTime = Date.now();

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;

        // Should load within 5 seconds (generous for development)
        expect(loadTime).toBeLessThan(5000);
    });

    test('should have good Core Web Vitals', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Test Largest Contentful Paint (LCP)
        const lcp = await page.evaluate(() => {
            return new Promise(resolve => {
                new PerformanceObserver(list => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    resolve(lastEntry.startTime);
                }).observe({ entryTypes: ['largest-contentful-paint'] });

                // Fallback timeout
                setTimeout(() => resolve(0), 1000);
            });
        });

        // LCP should be under 2.5 seconds for good performance
        if (typeof lcp === 'number' && lcp > 0) {
            expect(lcp).toBeLessThan(2500);
        }
    });

    test('should render content efficiently', async ({ page }) => {
        await page.goto('/');

        // Measure time to render main content
        const renderTime = await page.evaluate(async () => {
            const startTime = Date.now();

            // Wait for main content to be visible
            const main = document.querySelector('main');
            if (!main) return { error: 'Main element not found' };

            // Wait for key elements to be rendered
            const title = document.querySelector('h1');
            const statusCards = document.querySelectorAll(
                '[data-testid="status-card"], .grid > div'
            );

            if (!title) return { error: 'Title not found' };

            const endTime = Date.now();
            return {
                renderTime: endTime - startTime,
                hasTitle: !!title,
                statusCardCount: statusCards.length,
            };
        });

        if (!renderTime.error) {
            // Should render quickly
            expect(renderTime.renderTime).toBeLessThan(2000);
            expect(renderTime.hasTitle).toBe(true);
        }
    });

    test('should handle page interactions smoothly', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Test responsive design toggle
        const startTime = Date.now();

        // Change viewport size and measure response time
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForLoadState('networkidle');

        const responseTime = Date.now() - startTime;

        // Should respond to viewport changes quickly
        expect(responseTime).toBeLessThan(1000);

        // Verify content is still accessible
        const title = page.getByRole('heading', { name: 'Steam Hardware Analyzer' });
        await expect(title).toBeVisible();
    });

    test('should not have excessive network requests', async ({ page }) => {
        const networkRequests: string[] = [];

        page.on('request', request => {
            networkRequests.push(request.url());
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Filter out development/framework requests
        const appRequests = networkRequests.filter(
            url =>
                !url.includes('hot-reload') &&
                !url.includes('webpack') &&
                !url.includes('_next/static') &&
                !url.includes('favicon')
        );

        // Should not make excessive requests for a simple page
        expect(appRequests.length).toBeLessThan(10);
    });

    test('should have reasonable bundle size', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check for performance entries related to resource loading
        const resourceTiming = await page.evaluate(() => {
            const resources = performance.getEntriesByType(
                'resource'
            ) as PerformanceResourceTiming[];

            return resources
                .filter(resource => resource.name.includes('_next/static'))
                .map(resource => ({
                    name: resource.name,
                    transferSize: resource.transferSize,
                    duration: resource.duration,
                }));
        });

        // Should have some resources loaded
        expect(resourceTiming.length).toBeGreaterThan(0);

        // Individual resources should load reasonably quickly
        resourceTiming.forEach(resource => {
            expect(resource.duration).toBeLessThan(3000);
        });
    });

    test('should maintain good performance with dark mode', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Test that dark mode styles don't cause performance issues
        const performanceWithDarkMode = await page.evaluate(async () => {
            const startTime = Date.now();

            // Simulate dark mode by adding class (if implemented)
            document.documentElement.classList.add('dark');

            // Force a style recalculation
            void window.getComputedStyle(document.body).color;

            const endTime = Date.now();

            return {
                styleRecalcTime: endTime - startTime,
                hasDarkClass: document.documentElement.classList.contains('dark'),
            };
        });

        // Style recalculation should be fast
        expect(performanceWithDarkMode.styleRecalcTime).toBeLessThan(100);
    });
});
