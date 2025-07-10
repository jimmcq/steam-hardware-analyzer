import { test, expect } from '@playwright/test';

test.describe('Phase 3 Visualization Layer Integration', () => {
    test('should display Phase 3 completion status', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Verify the page indicates Phase 3 completion
        const phaseIndicator = page.locator('text=Phase 3 (Visualization Layer) Complete');
        await expect(phaseIndicator).toBeVisible();

        // Check that interactive tools are available
        const phaseMessage = page.locator('text=Interactive charts and analysis tools available');
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

        const bottleneckDescription = page.locator(
            'text=Match hardware profiles with game requirements'
        );
        await expect(bottleneckDescription).toBeVisible();
    });

    test('should show Phase 3 UI components as functional links', async ({ page }) => {
        await page.goto('/');

        // Check that Phase 3 UI features are now functional (clickable links)
        const dashboardLink = page.locator('a:has-text("Hardware Analysis Dashboard")');
        await expect(dashboardLink).toBeVisible();
        await expect(dashboardLink).toHaveAttribute('href', '/dashboard');

        const bottleneckLink = page.locator('a:has-text("Bottleneck Detector")');
        await expect(bottleneckLink).toBeVisible();
        await expect(bottleneckLink).toHaveAttribute('href', '/analysis');

        const trendsLink = page.locator('a:has-text("Market Trends Viewer")');
        await expect(trendsLink).toBeVisible();
        await expect(trendsLink).toHaveAttribute('href', '/trends');
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

    test('should navigate to dashboard page', async ({ page }) => {
        await page.goto('/');

        // Click the dashboard link
        const dashboardLink = page.locator('a:has-text("Hardware Analysis Dashboard")');
        await dashboardLink.click();

        // Wait for navigation
        await page.waitForURL('/dashboard');

        // Check that we're on the dashboard page
        await expect(page).toHaveURL('/dashboard');
        const dashboardTitle = page.getByRole('heading', { name: 'Hardware Analysis Dashboard' });
        await expect(dashboardTitle).toBeVisible();
    });

    test('should navigate to analysis page', async ({ page }) => {
        await page.goto('/');

        // Click the analysis link
        const analysisLink = page.locator('a:has-text("Bottleneck Detector")');
        await analysisLink.click();

        // Wait for navigation
        await page.waitForURL('/analysis');

        // Check that we're on the analysis page
        await expect(page).toHaveURL('/analysis');
        const analysisTitle = page.getByRole('heading', { name: 'Performance Analysis' });
        await expect(analysisTitle).toBeVisible();
    });

    test('should navigate to trends page', async ({ page }) => {
        await page.goto('/');

        // Click the trends link
        const trendsLink = page.locator('a:has-text("Market Trends Viewer")');
        await trendsLink.click();

        // Wait for navigation
        await page.waitForURL('/trends');

        // Check that we're on the trends page
        await expect(page).toHaveURL('/trends');
        const trendsTitle = page.getByRole('heading', { name: 'Market Trends Analysis' });
        await expect(trendsTitle).toBeVisible();
    });
});
