import { test, expect } from '@playwright/test';

test.describe('Clone Room', () => {
  test('should load the room, accept consent, and animate the clone', async ({ page }) => {
    await page.goto('/room?fallback=true&debug=true');

    // Accept consent
    await page.getByLabel('Zgadzam się na użycie mikrofonu.').check();
    await page.getByLabel('Zgadzam się na przetwarzanie danych głosowych (tylko lokalnie).').check();
    await page.getByRole('button', { name: 'Rozumiem i akceptuję' }).click();

    // Click "Powiedz" button to trigger speech
    await page.getByRole('button', { name: 'Powiedz' }).click();

    // Wait for some animation to happen (check FPS > 0)
    await expect(page.locator('text=/FPS: [1-9][0-9]*/')).toBeVisible();

    // Ensure the clone is animating for at least 10 seconds
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Take initial screenshot
    const initialScreenshot = await canvas.screenshot();

    // Wait for 5 seconds
    await page.waitForTimeout(5000);

    // Take another screenshot and compare (should be different if animating)
    const secondScreenshot = await canvas.screenshot();
    expect(initialScreenshot).not.toEqual(secondScreenshot);

    // Wait for another 5 seconds
    await page.waitForTimeout(5000);

    // Take a third screenshot and compare
    const thirdScreenshot = await canvas.screenshot();
    expect(secondScreenshot).not.toEqual(thirdScreenshot);

    // Check TTFP is recorded
    await expect(page.locator('text=/TTFP: \d+ ms/')).toBeVisible();
  });

  test('should respond to text input', async ({ page }) => {
    await page.goto('/room?fallback=true&debug=true');

    // Accept consent
    await page.getByLabel('Zgadzam się na użycie mikrofonu.').check();
    await page.getByLabel('Zgadzam się na przetwarzanie danych głosowych (tylko lokalnie).').check();
    await page.getByRole('button', { name: 'Rozumiem i akceptuję' }).click();

    // Type a message and send
    await page.getByPlaceholder('Napisz coś do wypowiedzenia…').fill('Witaj świecie!');
    await page.getByPlaceholder('Napisz coś do wypowiedzenia…').press('Enter');

    // Check if speaking indicator is visible
    await expect(page.getByRole('button', { name: 'Mówię…' })).toBeVisible();

    // Wait for speech to end
    await expect(page.getByRole('button', { name: 'Powiedz' })).toBeVisible({ timeout: 10000 });
  });
});
