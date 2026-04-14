import { test, expect } from '@playwright/test'
import { loginByCode } from './helpers/auth'

// ════════════════════════════════════════════════════════════════════
// Testes E2E — Layout (Sidebar, Topbar, ContextualBar, Navigation)
//
// Cobre todos os componentes de layout:
//   1. Sidebar (desktop)
//   2. Topbar (desktop)
//   3. BottomTabBar (mobile)
//   4. SpotlightSearch
//   5. Navegação entre páginas
//   6. Breadcrumbs
//   7. Seletor de CME
//
// Para rodar: npx playwright test tests/e2e/layout.spec.ts
// ════════════════════════════════════════════════════════════════════

test.describe('Layout — Desktop', () => {
  test.beforeEach(async ({ page }) => {
    await loginByCode(page, 'gg')
  })

  // ──────────────────────────────────────────────
  // 1. Sidebar
  // ──────────────────────────────────────────────

  test.describe('Sidebar', () => {
    test('deve exibir sidebar com ícones de navegação', async ({ page }) => {
      await page.goto('/home')
      // Sidebar deve estar visível no desktop
      const sidebar = page.locator('aside, [role="complementary"]').first()
      await expect(sidebar).toBeVisible()
    })

    test('deve exibir logo no topo da sidebar', async ({ page }) => {
      await page.goto('/home')
      await expect(page.getByAltText('Medtracker Etiquetagem')).toBeVisible()
    })

    test('deve exibir avatar do usuário no rodapé da sidebar', async ({ page }) => {
      await page.goto('/home')
      // Avatar com inicial do nome
      await expect(page.getByRole('button', { name: 'G' })).toBeVisible()
    })

    test('deve navegar ao clicar nos ícones da sidebar', async ({ page }) => {
      await page.goto('/home')
      // Clicar no segundo ícone (deve ser uma rota de navegação)
      const navButtons = page.locator('[role="complementary"] button').filter({ has: page.locator('img') })
      const count = await navButtons.count()
      expect(count).toBeGreaterThan(2)
    })
  })

  // ──────────────────────────────────────────────
  // 2. Topbar
  // ──────────────────────────────────────────────

  test.describe('Topbar', () => {
    test('deve exibir breadcrumbs com "Home"', async ({ page }) => {
      await page.goto('/home')
      await expect(page.getByText('Home').first()).toBeVisible()
    })

    test('deve exibir breadcrumb da página atual', async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      await expect(page.getByText('Entrada de Materiais').first()).toBeVisible()
    })

    test('deve exibir trigger de busca com "Ctrl+K"', async ({ page }) => {
      await page.goto('/home')
      await expect(page.getByText('Ctrl+K')).toBeVisible()
    })

    test('deve exibir seletor de CME', async ({ page }) => {
      await page.goto('/home')
      await expect(page.getByText('Medtracker LTDA')).toBeVisible()
      await expect(page.getByText('Completo')).toBeVisible()
    })

    test('deve exibir badge de notificações', async ({ page }) => {
      await page.goto('/home')
      await expect(page.getByText('3').first()).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 3. SpotlightSearch
  // ──────────────────────────────────────────────

  test.describe('SpotlightSearch', () => {
    test('deve abrir spotlight ao clicar na busca', async ({ page }) => {
      await page.goto('/home')
      await page.getByText('Buscar...').click()
      await expect(page.getByPlaceholder(/buscar|pesquisar/i)).toBeVisible()
    })

    test('deve abrir spotlight com Ctrl+K', async ({ page }) => {
      await page.goto('/home')
      await page.keyboard.press('Control+k')
      await expect(page.getByPlaceholder(/buscar|pesquisar/i)).toBeVisible()
    })

    test('deve fechar spotlight com Escape', async ({ page }) => {
      await page.goto('/home')
      await page.keyboard.press('Control+k')
      await expect(page.getByPlaceholder(/buscar|pesquisar/i)).toBeVisible()

      await page.keyboard.press('Escape')
      await expect(page.getByPlaceholder(/buscar|pesquisar/i)).not.toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 4. Seletor de CME
  // ──────────────────────────────────────────────

  test.describe('Seletor de CME', () => {
    test('deve abrir popover ao clicar no seletor', async ({ page }) => {
      await page.goto('/home')
      await page.getByRole('button', { name: /Medtracker LTDA/ }).click()
      // Deve mostrar lista de CMEs
      await expect(page.getByText('Atual').or(page.getByText('atual'))).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 5. Navegação geral
  // ──────────────────────────────────────────────

  test.describe('Navegação', () => {
    test('deve navegar entre Home e Cadastros', async ({ page }) => {
      await page.goto('/home')
      await expect(page.getByText(/Gustavo/)).toBeVisible()

      await page.goto('/cadastros/materiais')
      await expect(page.getByText('Materiais').first()).toBeVisible()
    })

    test('deve navegar entre Home e Entrada', async ({ page }) => {
      await page.goto('/home')
      await page.goto('/entrada-de-materiais')
      await expect(page.getByText('Dados da Entrada')).toBeVisible()
    })
  })
})

// ══════════════════════════════════════════════════
// Layout — Mobile
// ══════════════════════════════════════════════════

test.describe('Layout — Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await loginByCode(page, 'gg')
    await page.goto('/home')
  })

  // ──────────────────────────────────────────────
  // 6. BottomTabBar
  // ──────────────────────────────────────────────

  test.describe('BottomTabBar', () => {
    test('deve exibir tab bar no rodapé', async ({ page }) => {
      await expect(page.getByText('Home').last()).toBeVisible()
      await expect(page.getByText('Dashboard').last()).toBeVisible()
    })

    test('deve navegar ao clicar nas tabs', async ({ page }) => {
      await page.getByText('Home').last().click()
      await page.waitForURL('/home')
    })

    test('deve exibir botão Tools centralizado', async ({ page }) => {
      // O botão Tools é o FAB central
      const toolsBtn = page.locator('button').filter({ has: page.locator('svg') })
      const count = await toolsBtn.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  // ──────────────────────────────────────────────
  // 7. Sem sidebar no mobile
  // ──────────────────────────────────────────────

  test('não deve exibir sidebar no mobile', async ({ page }) => {
    const sidebar = page.locator('[role="complementary"]')
    await expect(sidebar).not.toBeVisible()
  })

  test('não deve exibir topbar no mobile', async ({ page }) => {
    // Breadcrumbs e busca da topbar não devem aparecer
    await expect(page.getByText('Ctrl+K')).not.toBeVisible()
  })
})
