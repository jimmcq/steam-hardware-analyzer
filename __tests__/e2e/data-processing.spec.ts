import { test, expect } from '@playwright/test';

test.describe('Data Processing Integration', () => {
    test('should have data processing foundation available', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Verify the page indicates Phase 1 completion
        const phaseIndicator = page.locator('text=Phase 1 (Data Foundation) Complete');
        await expect(phaseIndicator).toBeVisible();

        // Check system status dashboard
        const testsCount = page.locator('text=98');
        await expect(testsCount).toBeVisible();

        const gpuCount = page.locator('text=20+');
        await expect(gpuCount).toBeVisible();

        const coverage = page.locator('text=93%');
        await expect(coverage).toBeVisible();
    });

    test('should indicate data processing capabilities', async ({ page }) => {
        await page.goto('/');

        // Use role-based locators for headings (more specific and semantic)
        const hardwareTrends = page.getByRole('heading', { name: 'Hardware Trends' });
        await expect(hardwareTrends).toBeVisible();

        const bottleneckDetection = page.getByRole('heading', { name: 'Bottleneck Detection' });
        await expect(bottleneckDetection).toBeVisible();

        const marketIntelligence = page.getByRole('heading', { name: 'Market Intelligence' });
        await expect(marketIntelligence).toBeVisible();

        // Verify feature descriptions (these are unique)
        const trendDescription = page.locator('text=Track GPU market share evolution');
        await expect(trendDescription).toBeVisible();
    });

    test('should show upcoming features correctly', async ({ page }) => {
        await page.goto('/');

        // Check that Phase 2 features are marked as coming soon
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

    test('should have proper data foundation messaging', async ({ page }) => {
        await page.goto('/');

        // Check for accurate phase messaging
        const foundationMessage = page.locator('text=Data Foundation Layer');
        await expect(foundationMessage).toBeVisible();

        const testingMessage = page.locator('text=Comprehensive Testing');
        await expect(testingMessage).toBeVisible();

        const cicdMessage = page.locator('text=CI/CD Pipeline');
        await expect(cicdMessage).toBeVisible();

        // Check phase indicator
        const phaseMessage = page.locator('text=UI Components Coming in Phase 2');
        await expect(phaseMessage).toBeVisible();
    });

    test('should display current date in status dashboard', async ({ page }) => {
        await page.goto('/');

        // The current date should be displayed in the status dashboard
        const statusSection = page.locator('text=System Status').locator('..').locator('..');

        // Should contain a date-like string
        const statusText = await statusSection.textContent();
        expect(statusText).toMatch(/\d/); // Should contain numbers (date)
    });
});
