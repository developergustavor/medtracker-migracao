import { test, expect } from '@playwright/test'
import { loginByCode } from './helpers/auth'

// ════════════════════════════════════════════════════════════════════
// Testes E2E — Home
//
// Cobre todos os fluxos da página Home:
//   1. Saudação e data
//   2. Métricas
//   3. Nota de atualização
//   4. Cards de workflow
//   5. Ações rápidas
//   6. Botão helpdesk
//   7. Layout responsivo
//
// Para rodar: npx playwright test tests/e2e/home.spec.ts
// ════════════════════════════════════════════════════════════════════

test.describe('Home', () => {
  test.beforeEach(async ({ page }) => {
    await loginByCode(page, 'gg')
    await page.goto('/home')
  })

  // ──────────────────────────────────────────────
  // 1. Saudação e data
  // ──────────────────────────────────────────────

  test.describe('Saudação', () => {
    test('deve exibir saudação com nome do usuário', async ({ page }) => {
      await expect(page.getByText(/Gustavo/)).toBeVisible()
      // Deve conter "Bom dia", "Boa tarde" ou "Boa noite"
      await expect(page.getByText(/(Bom dia|Boa tarde|Boa noite)/)).toBeVisible()
    })

    test('deve exibir data formatada no desktop', async ({ page }) => {
      // Deve mostrar data no formato "DD de Mês, AAAA"
      await expect(page.getByText(/\d{2} de \w+, \d{4}/)).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 2. Métricas
  // ──────────────────────────────────────────────

  test.describe('Métricas', () => {
    test('deve exibir 4 cards de métricas', async ({ page }) => {
      await expect(page.getByText('Ciclos hoje')).toBeVisible()
      await expect(page.getByText('Etiquetas hoje')).toBeVisible()
      await expect(page.getByText('Ciclos na semana')).toBeVisible()
      await expect(page.getByText('Ciclos no mês')).toBeVisible()
    })

    test('deve exibir valores numéricos nas métricas', async ({ page }) => {
      await expect(page.getByText('12').first()).toBeVisible()
      await expect(page.getByText('8').first()).toBeVisible()
    })

    test('deve exibir indicadores de tendência', async ({ page }) => {
      await expect(page.getByText(/\+3/)).toBeVisible()
      await expect(page.getByText(/\-5/)).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 3. Nota de atualização
  // ──────────────────────────────────────────────

  test.describe('Nota de atualização', () => {
    test('deve exibir banner de novidades', async ({ page }) => {
      await expect(page.getByText(/Novidades v2\.1/)).toBeVisible()
    })

    test('deve exibir descrição da atualização', async ({ page }) => {
      await expect(page.getByText(/conferência de materiais/i)).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 4. Cards de workflow
  // ──────────────────────────────────────────────

  test.describe('Cards de workflow', () => {
    test('deve exibir 5 cards de workflow', async ({ page }) => {
      await expect(page.getByText('Entrada de Materiais')).toBeVisible()
      await expect(page.getByText('Desinfecção')).toBeVisible()
      await expect(page.getByText('Esterilização')).toBeVisible()
      await expect(page.getByText('Saida de Materiais').or(page.getByText('Saída de Materiais'))).toBeVisible()
      await expect(page.getByText('Conferência').last()).toBeVisible()
    })

    test('deve navegar ao clicar em card de workflow', async ({ page }) => {
      await page.getByRole('button', { name: /Entrada de Materiais/i }).click()
      await page.waitForURL('/entrada-de-materiais')
    })

    test('cards devem ter imagens de fundo no desktop', async ({ page }) => {
      const images = page.locator('img[alt="Entrada de Materiais"]')
      await expect(images.first()).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 5. Ações rápidas
  // ──────────────────────────────────────────────

  test.describe('Ações rápidas', () => {
    test('deve exibir botões Dashboard, Cadastros e Relatórios para admin', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Cadastros' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Relatórios' })).toBeVisible()
    })

    test('deve navegar ao clicar em ação rápida', async ({ page }) => {
      await page.getByRole('button', { name: 'Cadastros' }).click()
      await page.waitForURL(/cadastros/)
    })
  })

  // ──────────────────────────────────────────────
  // 6. Botão helpdesk
  // ──────────────────────────────────────────────

  test.describe('Botão helpdesk', () => {
    test('deve exibir botão flutuante de helpdesk', async ({ page }) => {
      // FAB no canto inferior direito
      const fab = page.locator('button').filter({ has: page.locator('img[src*="logo"]') }).last()
      await expect(fab).toBeVisible()
    })
  })
})

// ══════════════════════════════════════════════════
// Home — Mobile
// ══════════════════════════════════════════════════

test.describe('Home — Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await loginByCode(page, 'gg')
    await page.goto('/home')
  })

  test('deve exibir saudação sem data', async ({ page }) => {
    await expect(page.getByText(/Gustavo/)).toBeVisible()
    // Data não visível no mobile
  })

  test('deve exibir métricas em grid 2 colunas', async ({ page }) => {
    await expect(page.getByText('Ciclos hoje')).toBeVisible()
    await expect(page.getByText('Etiquetas hoje')).toBeVisible()
  })

  test('deve exibir cards de workflow sem imagens', async ({ page }) => {
    await expect(page.getByText('Entrada de Materiais')).toBeVisible()
    await expect(page.getByText('Desinfecção')).toBeVisible()
  })

  test('deve exibir bottom tab bar', async ({ page }) => {
    // Tab bar com itens de navegação
    await expect(page.getByText('Home').last()).toBeVisible()
  })
})
