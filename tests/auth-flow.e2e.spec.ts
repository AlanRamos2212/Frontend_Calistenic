import { expect, test } from '@playwright/test';

test('registro y acceso al dashboard', async ({ page }) => {
  const email = process.env.E2E_EMAIL ?? `e2e-${Date.now()}@calistenictrack.test`;
  const password = process.env.E2E_PASSWORD ?? 'Test1234!';

  await page.goto('/');
  await expect(page).toHaveTitle(/CalistenicTrack/i);

  await page.locator('#hero-start-btn').click();
  await page.getByRole('button', { name: 'Regístrate aquí' }).click();

  await page.locator('#reg-name').fill('Usuario E2E');
  await page.locator('#auth-email').fill(email);
  await page.locator('#auth-pass').fill(password);
  await page.getByRole('button', { name: 'Registrarse' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText(/Dashboard/i).first()).toBeVisible();
});
