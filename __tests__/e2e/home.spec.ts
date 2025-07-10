import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
    test('should load home page successfully', async ({ page }) => {
        await page.goto('/');

        // Wait for the page to load
        await page.waitForLoadState('networkidle');

        // Check that the page loads without errors
        await expect(page).toHaveTitle(/Steam Hardware Analyzer/i);

        // Check for main content
        const main = page.locator('main');
        await expect(main).toBeVisible();
    });

    test('should have proper meta tags', async ({ page }) => {
        await page.goto('/');

        // Check viewport meta tag exists
        const viewportMeta = page.locator('meta[name="viewport"]');
        await expect(viewportMeta).toHaveAttribute(
            'content',
            'width=device-width, initial-scale=1'
        );
    });

    test('should have accessible navigation', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Wait for the main heading to be visible before counting all headings
        await expect(page.getByRole('heading', { name: 'Steam Hardware Analyzer' })).toBeVisible();

        // Check for proper heading structure
        const headings = page.locator('h1, h2, h3, h4, h5, h6');
        const headingCount = await headings.count();

        // Should have at least one heading for accessibility
        expect(headingCount).toBeGreaterThan(0);
    });

    test('should be responsive', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Should not have horizontal scrollbar
        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const clientWidth = await page.evaluate(() => document.body.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance

        // Test desktop viewport
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Page should still load correctly
        const main = page.locator('main');
        await expect(main).toBeVisible();
    });

    test('should have no console errors', async ({ page }) => {
        const consoleErrors: string[] = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Filter out known acceptable errors (like 404 for favicon, etc.)
        const criticalErrors = consoleErrors.filter(
            error =>
                !error.includes('favicon') &&
                !error.includes('404') &&
                !error.includes('Failed to load resource')
        );

        expect(criticalErrors).toHaveLength(0);
    });

    test('should load without network failures', async ({ page }) => {
        const failedRequests: string[] = [];

        page.on('requestfailed', request => {
            // Only track failures for our domain, not external resources
            if (request.url().includes('localhost:3000')) {
                failedRequests.push(request.url());
            }
        });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        expect(failedRequests).toHaveLength(0);
    });

    test('should have proper semantic HTML structure', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Check for semantic HTML5 elements
        const main = page.locator('main');
        await expect(main).toBeVisible();

        // Check that the page has a proper document structure
        const htmlLang = await page.getAttribute('html', 'lang');
        expect(htmlLang).toBeTruthy(); // Should have a language attribute
    });
});
