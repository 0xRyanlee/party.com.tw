import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Core Page Loading
 * Tests that key pages load without errors
 */

test.describe('Core Pages', () => {
    test('homepage loads successfully', async ({ page }) => {
        await page.goto('/');

        // Wait for page to load
        await expect(page).toHaveTitle(/Party/);

        // Page should not be empty
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('events page loads', async ({ page }) => {
        await page.goto('/events');

        // Should have content
        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('discover page loads', async ({ page }) => {
        await page.goto('/discover');

        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('club page loads', async ({ page }) => {
        await page.goto('/club');

        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('settings page loads', async ({ page }) => {
        await page.goto('/settings');

        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('map page loads', async ({ page }) => {
        await page.goto('/map');

        await expect(page.locator('body')).not.toBeEmpty();
    });
});

test.describe('Legal Pages', () => {
    test('terms page loads with content', async ({ page }) => {
        await page.goto('/terms');

        // Should have heading
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('privacy page loads with content', async ({ page }) => {
        await page.goto('/privacy');

        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('help page loads', async ({ page }) => {
        await page.goto('/help');

        await expect(page.locator('body')).not.toBeEmpty();
    });

    test('contact page loads', async ({ page }) => {
        await page.goto('/contact');

        await expect(page.locator('body')).not.toBeEmpty();
    });
});

test.describe('API Health', () => {
    test('events API returns data', async ({ request }) => {
        const response = await request.get('/api/events');

        expect(response.ok()).toBeTruthy();
    });

    test('clubs API returns response', async ({ request }) => {
        const response = await request.get('/api/clubs');

        // API might return 401 if auth required, but should not 500
        expect(response.status()).toBeLessThan(500);
    });

    test('OG image API works', async ({ request }) => {
        const response = await request.get('/api/og?title=Test');

        expect(response.ok()).toBeTruthy();
        expect(response.headers()['content-type']).toContain('image');
    });
});
