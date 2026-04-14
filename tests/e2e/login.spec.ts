import { test, expect } from '@playwright/test'

// ════════════════════════════════════════════════════════════════════
// Testes E2E — Login
//
// Cobre todos os fluxos de autenticação:
//   1. Login por código
//   2. Login por CPF + senha
//   3. Login por CME
//   4. 2FA (autenticação de dois fatores)
//   5. Redirecionamentos e guards
//   6. Logout
//
// Para rodar: npx playwright test tests/e2e/login.spec.ts
// ════════════════════════════════════════════════════════════════════

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    // Limpar localStorage para garantir estado limpo
    await page.goto('/login')
    await page.evaluate(() => localStorage.clear())
    await page.goto('/login')
  })

  // ──────────────────────────────────────────────
  // 1. Login por código
  // ──────────────────────────────────────────────

  test.describe('Login por código', () => {
    test('deve estar na aba Código por padrão', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Código' })).toBeVisible()
      await expect(page.getByPlaceholder(/código/i)).toBeVisible()
    })

    test('deve logar com código válido "gg" e redirecionar para /home', async ({ page }) => {
      await page.getByPlaceholder(/código/i).fill('gg')
      await page.waitForURL('/home')
      await expect(page.getByText(/Gustavo/i)).toBeVisible()
    })

    test('deve logar com código válido "ff"', async ({ page }) => {
      await page.getByPlaceholder(/código/i).fill('ff')
      await page.waitForURL('/home')
    })

    test('deve exibir erro com código inválido', async ({ page }) => {
      await page.getByPlaceholder(/código/i).fill('xx')
      // Aguardar debounce + resposta
      await page.waitForTimeout(1000)
      await expect(page.getByText(/não encontrado/i)).toBeVisible()
    })

    test('deve exibir 2FA para código "mt" (Mateus tem 2FA)', async ({ page }) => {
      await page.getByPlaceholder(/código/i).fill('mt')
      // Aguardar debounce (800ms) + resposta da API
      await page.waitForTimeout(2000)
      // Deve mostrar tela de 2FA (título: "Verificação em duas etapas")
      await expect(page.getByText(/verificação em duas etapas/i)).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 2. Login por CPF + senha
  // ──────────────────────────────────────────────

  test.describe('Login por CPF', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'Usuário' }).click()
    })

    test('deve exibir campos CPF e senha', async ({ page }) => {
      await expect(page.getByPlaceholder(/CPF/i).or(page.getByPlaceholder(/000/))).toBeVisible()
      await expect(page.getByPlaceholder(/senha/i).or(page.locator('input[type="password"]'))).toBeVisible()
    })

    test('deve logar com CPF e senha válidos', async ({ page }) => {
      await page.getByPlaceholder(/CPF/i).or(page.getByPlaceholder(/000/)).fill('101.261.546-43')
      await page.locator('input[type="password"]').fill('13ce5dc1')
      await page.getByRole('button', { name: /acessar/i }).click()
      await page.waitForURL('/home')
    })

    test('deve exibir erro com credenciais inválidas', async ({ page }) => {
      await page.getByPlaceholder(/CPF/i).or(page.getByPlaceholder(/000/)).fill('000.000.000-00')
      await page.locator('input[type="password"]').fill('senhaerrada')
      await page.getByRole('button', { name: /acessar/i }).click()
      await page.waitForTimeout(1000)
      await expect(page.getByText(/incorret/i).or(page.getByText(/inválid/i))).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 3. Login por CME
  // ──────────────────────────────────────────────

  test.describe('Login por CME', () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'CME' }).click()
    })

    test('deve exibir campos usuário e senha da CME', async ({ page }) => {
      await expect(page.getByPlaceholder(/usuário/i).or(page.getByPlaceholder(/username/i))).toBeVisible()
    })

    test('deve logar como CME com credenciais válidas', async ({ page }) => {
      await page.getByPlaceholder(/usuário/i).or(page.getByPlaceholder(/username/i)).fill('medtracker')
      await page.locator('input[type="password"]').fill('medtracker')
      await page.getByRole('button', { name: /acessar/i }).click()
      await page.waitForURL('/home')
    })
  })

  // ──────────────────────────────────────────────
  // 4. 2FA
  // ──────────────────────────────────────────────

  test.describe('Autenticação 2FA', () => {
    test.beforeEach(async ({ page }) => {
      // Login com Mateus (tem 2FA)
      await page.getByPlaceholder(/código/i).fill('mt')
      // Aguardar debounce (800ms) + resposta da API
      await page.waitForTimeout(2000)
    })

    test('deve exibir 5 campos de OTP', async ({ page }) => {
      const otpInputs = page.locator('input[maxlength="1"]').or(page.locator('input[inputmode="numeric"]'))
      const count = await otpInputs.count()
      expect(count).toBeGreaterThanOrEqual(5)
    })

    test('deve validar código OTP correto "12345"', async ({ page }) => {
      // Digitar OTP
      const inputs = page.locator('input[maxlength="1"]').or(page.locator('input[inputmode="numeric"]'))
      const count = await inputs.count()
      if (count >= 5) {
        await inputs.nth(0).fill('1')
        await inputs.nth(1).fill('2')
        await inputs.nth(2).fill('3')
        await inputs.nth(3).fill('4')
        await inputs.nth(4).fill('5')
      }
      await page.getByRole('button', { name: /verificar/i }).click()
      await page.waitForURL('/home')
    })

    test('deve exibir botão de voltar', async ({ page }) => {
      await expect(page.getByRole('button', { name: /voltar/i }).or(page.getByText(/voltar/i))).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 5. Redirecionamentos e guards
  // ──────────────────────────────────────────────

  test.describe('Guards e redirecionamentos', () => {
    test('deve redirecionar para /login quando não autenticado', async ({ page }) => {
      await page.goto('/home')
      await page.waitForURL('/login')
    })

    test('deve redirecionar / para /home quando autenticado', async ({ page }) => {
      // Login primeiro
      await page.getByPlaceholder(/código/i).fill('gg')
      await page.waitForURL('/home')

      // Navegar para /
      await page.goto('/')
      await page.waitForURL('/home')
    })

    test('deve exibir 404 para rota inexistente', async ({ page }) => {
      // Login primeiro
      await page.getByPlaceholder(/código/i).fill('gg')
      await page.waitForURL('/home')

      await page.goto('/rota-que-nao-existe')
      await expect(page.getByText('404')).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 6. Troca de abas
  // ──────────────────────────────────────────────

  test.describe('Troca de abas', () => {
    test('deve alternar entre as 4 abas de login', async ({ page }) => {
      await page.getByRole('button', { name: 'Código' }).click()
      await expect(page.getByPlaceholder(/código/i)).toBeVisible()

      await page.getByRole('button', { name: 'Usuário' }).click()
      await expect(page.locator('input[type="password"]')).toBeVisible()

      await page.getByRole('button', { name: 'CME' }).click()
      await expect(page.getByPlaceholder(/usuário/i).or(page.getByPlaceholder(/username/i))).toBeVisible()
    })
  })
})
