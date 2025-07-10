import { test, expect } from '@playwright/test';

test.describe('Phase 2 Analysis Engine Integration', () => {
    test('should display Phase 2 completion status', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Verify the page indicates Phase 2 completion
        const phaseIndicator = page.locator('text=Phase 2 (Analysis Engine) Complete');
        await expect(phaseIndicator).toBeVisible();

        // Check that Phase 3 is coming next
        const phaseMessage = page.locator('text=Interactive UI Coming in Phase 3');
        await expect(phaseMessage).toBeVisible();
    });

    test('should show analysis engine capabilities', async ({ page }) => {
        await page.goto('/');

        // Use role-based locators for headings (more specific and semantic)
        const hardwareTrends = page.getByRole('heading', { name: 'Hardware Trends' });
        await expect(hardwareTrends).toBeVisible();

        const bottleneckDetection = page.getByRole('heading', { name: 'Bottleneck Detection' });
        await expect(bottleneckDetection).toBeVisible();

        const marketIntelligence = page.getByRole('heading', { name: 'Market Intelligence' });
        await expect(marketIntelligence).toBeVisible();

        // Verify feature descriptions show analysis capabilities
        const trendDescription = page.locator('text=Track GPU market share evolution');
        await expect(trendDescription).toBeVisible();

        const bottleneckDescription = page.locator('text=Identify performance bottlenecks');
        await expect(bottleneckDescription).toBeVisible();
    });

    test('should show Phase 3 UI components as coming soon', async ({ page }) => {
        await page.goto('/');

        // Check that Phase 3 UI features are marked as coming soon (disabled)
        const dashboardButton = page.locator('button:has-text("Hardware Analysis Dashboard")');
        await expect(dashboardButton).toBeVisible();
        await expect(dashboardButton).toBeDisabled();

        const bottleneckButton = page.locator('button:has-text("Bottleneck Detector")');
        await expect(bottleneckButton).toBeVisible();
        await expect(bottleneckButton).toBeDisabled();

        const trendsButton = page.locator('button:has-text("Market Trends Viewer")');
        await expect(trendsButton).toBeVisible();
        await expect(trendsButton).toBeDisabled();
    });

    test('should have author information in footer', async ({ page }) => {
        await page.goto('/');

        // Check for author footer that was added in Phase 2
        const authorSection = page.locator('text=Built with ❤️ by');
        await expect(authorSection).toBeVisible();

        // Check for GitHub and LinkedIn links
        const githubLink = page.locator('a[href*="github.com"]');
        await expect(githubLink).toBeVisible();

        const linkedinLink = page.locator('a[href*="linkedin.com"]');
        await expect(linkedinLink).toBeVisible();
    });

    test('should display Steam Hardware Analyzer title and description', async ({ page }) => {
        await page.goto('/');

        // Check main title
        const title = page.getByRole('heading', { name: 'Steam Hardware Analyzer' });
        await expect(title).toBeVisible();

        // Check description
        const description = page.locator(
            'text=Analyze Steam Hardware Survey data to identify gaming hardware trends'
        );
        await expect(description).toBeVisible();
    });

    test('should have proper page structure and accessibility', async ({ page }) => {
        await page.goto('/');

        // Check page has proper title
        await expect(page).toHaveTitle(/Steam Hardware Analyzer/);

        // Check main navigation structure exists
        const main = page.locator('main');
        await expect(main).toBeVisible();

        // Check that headings are structured properly
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();

        const h2Elements = page.locator('h2');
        await expect(h2Elements.first()).toBeVisible();
    });
});
