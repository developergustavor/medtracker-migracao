import { Page } from '@playwright/test'

/**
 * Faz login no sistema usando código do usuário.
 * Códigos válidos: gg (Gustavo, Admin), ff (Filipe, Admin), mm (Marcos, Colaborador)
 */
export async function loginByCode(page: Page, code = 'gg') {
  await page.goto('/login')
  await page.getByRole('textbox', { name: /código/i }).fill(code)
  await page.waitForURL('/home')
}
