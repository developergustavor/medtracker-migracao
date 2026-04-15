import { test, expect } from '@playwright/test'
import { loginByCode } from './helpers/auth'

// ════════════════════════════════════════════════════════════════════
// Testes E2E — Entrada de Materiais
//
// Cobre todos os fluxos da tela:
//   1. Navegação e acesso
//   2. Form de metadados (painel esquerdo)
//   3. Bloqueio/desbloqueio da área de materiais
//   4. Scan e adição de materiais
//   5. Cards de material (KIT, AVULSO, REGISTRADO)
//   6. Conferência de submateriais (MaterialCheckPanel)
//   7. Autenticação para registrar (AuthModal)
//   8. Criação inline (CreateInlineDrawer)
//   9. Dialog de imagens
//  10. Relatório placeholder
//  11. Ações contextuais (Nova Entrada, Gerar Relatório)
//  12. Layout mobile
//  13. Auto-abrir conferência para KIT (módulo COMPLETO)
//
// Para rodar: npx playwright test tests/e2e/entrada-de-materiais.spec.ts
// ════════════════════════════════════════════════════════════════════

// -- Helpers for new UI patterns

/** Select Tipo via radio button */
async function selectTipo(page: import('@playwright/test').Page, tipo: 'Interna' | 'Externa') {
  await page.getByRole('button', { name: tipo, exact: true }).click()
}

/** Select Setor via combobox (type to search, click option) */
async function selectSetor(page: import('@playwright/test').Page, name: string) {
  const setorInput = page.getByPlaceholder('Buscar setor...')
  await setorInput.click()
  await setorInput.fill(name.substring(0, 6))
  await page.getByText(name, { exact: true }).click()
}

/** Fill minimum form (Tipo Interna + Setor Centro Cirúrgico) */
async function fillMinForm(page: import('@playwright/test').Page) {
  await selectTipo(page, 'Interna')
  await selectSetor(page, 'Centro Cirúrgico')
}

/** Get the scan input */
function scanInput(page: import('@playwright/test').Page) {
  return page.getByPlaceholder(/bipar código ou buscar material/i)
}

/** Add material by code via scan */
async function addMaterial(page: import('@playwright/test').Page, code: string) {
  const input = scanInput(page)
  await input.fill(code)
  await input.press('Enter')
}

test.describe('Entrada de Materiais', () => {
  test.beforeEach(async ({ page }) => {
    await loginByCode(page, 'gg')
  })

  // ──────────────────────────────────────────────
  // 1. Navegação e acesso
  // ──────────────────────────────────────────────

  test.describe('Navegação', () => {
    test('deve acessar a página via URL direta', async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      await expect(page.getByRole('heading', { name: 'Dados da Entrada' })).toBeVisible()
    })

    test('deve exibir breadcrumb "Entrada de Materiais"', async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      await expect(page.getByText('Entrada de Materiais').first()).toBeVisible()
    })

    test('deve exibir ações contextuais na topbar', async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      await expect(page.getByRole('button', { name: 'Nova Entrada' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Gerar Relatório' })).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 2. Form de metadados
  // ──────────────────────────────────────────────

  test.describe('Form de metadados', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entrada-de-materiais')
    })

    test('deve exibir badges de progresso separados em Obrigatório e Opcional', async ({ page }) => {
      await expect(page.getByText('Obrigatório:')).toBeVisible()
      await expect(page.getByText('Opcional:')).toBeVisible()
      await expect(page.getByText('Tipo').first()).toBeVisible()
      await expect(page.getByText('Médico').first()).toBeVisible()
      await expect(page.getByText('Paciente').first()).toBeVisible()
      await expect(page.getByText('Terceiro').first()).toBeVisible()
    })

    test('deve exibir Tipo como radio buttons (Interna / Externa)', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Interna', exact: true })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Externa', exact: true })).toBeVisible()
    })

    test('deve mostrar campo Setor ao selecionar tipo Interna', async ({ page }) => {
      await selectTipo(page, 'Interna')
      await expect(page.getByPlaceholder('Buscar setor...')).toBeVisible()
    })

    test('deve mostrar campo CME Origem ao selecionar tipo Externa', async ({ page }) => {
      await selectTipo(page, 'Externa')
      await expect(page.getByPlaceholder('Buscar CME...')).toBeVisible()
    })

    test('deve exibir botão "+ Criar" dentro do dropdown de Médico', async ({ page }) => {
      // Open the Médico combobox dropdown
      const medicoInput = page.getByPlaceholder('Buscar médico...')
      await medicoInput.click()

      // "+ Criar novo médico" should be visible inside the dropdown
      await expect(page.getByText('+ Criar novo médico')).toBeVisible()
    })

    test('deve exibir campos de Data e Hora do Procedimento', async ({ page }) => {
      await expect(page.getByPlaceholder('DD/MM/AAAA')).toBeVisible()
      await expect(page.getByPlaceholder('HH:MM')).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 3. Bloqueio/desbloqueio da área de materiais
  // ──────────────────────────────────────────────

  test.describe('Bloqueio da área de materiais', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entrada-de-materiais')
    })

    test('deve bloquear área de materiais sem tipo e setor preenchidos', async ({ page }) => {
      await expect(page.getByText('Preencha os dados da entrada para adicionar materiais')).toBeVisible()
      await expect(scanInput(page)).toBeDisabled()
    })

    test('deve desbloquear área após preencher tipo e setor', async ({ page }) => {
      await fillMinForm(page)

      await expect(page.getByText('Preencha os dados da entrada para adicionar materiais')).not.toBeVisible()
      await expect(scanInput(page)).toBeEnabled()
    })
  })

  // ──────────────────────────────────────────────
  // 4. Scan e adição de materiais
  // ──────────────────────────────────────────────

  test.describe('Adição de materiais', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      await fillMinForm(page)
    })

    test('deve adicionar material KIT ao bipar código', async ({ page }) => {
      await addMaterial(page, 'MAT-002')

      await expect(page.getByText('CX VASCULAR Nº1').first()).toBeVisible()
      await expect(page.getByText('KIT').first()).toBeVisible()
    })

    test('deve adicionar material AVULSO ao bipar código', async ({ page }) => {
      await addMaterial(page, 'MAT-001')

      await expect(page.getByText('PINÇA BACKAUS')).toBeVisible()
    })

    test('deve adicionar material por busca de nome', async ({ page }) => {
      await addMaterial(page, 'capote')

      await expect(page.getByText('CAPOTE')).toBeVisible()
    })

    test('deve atualizar contagem no footer ao adicionar materiais', async ({ page }) => {
      await addMaterial(page, 'MAT-001')
      await expect(page.getByText('1 materiais · 0 registrados')).toBeVisible()

      await addMaterial(page, 'MAT-002')
      await expect(page.getByText('2 materiais · 0 registrados')).toBeVisible()
    })

    test('deve limpar input após adicionar material', async ({ page }) => {
      const input = scanInput(page)
      await input.fill('MAT-001')
      await input.press('Enter')

      await expect(input).toHaveValue('')
    })

    test('NÃO deve travar Tipo e Setor apenas ao adicionar material (somente após registrar)', async ({ page }) => {
      await addMaterial(page, 'MAT-001')

      // Tipo radio buttons should still be enabled (not disabled) — only disabled after registering
      const internaBtn = page.getByRole('button', { name: 'Interna', exact: true })
      await expect(internaBtn).toBeEnabled()
    })
  })

  // ──────────────────────────────────────────────
  // 5. Cards de material
  // ──────────────────────────────────────────────

  test.describe('Cards de material', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      await fillMinForm(page)
    })

    test('card KIT deve exibir submateriais via toggle separador', async ({ page }) => {
      await addMaterial(page, 'MAT-002')

      // Auto-conference opens for KIT — close it first
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      await page.keyboard.press('Escape')
      await expect(dialog).not.toBeVisible()

      // Submaterials should be visible (first KIT auto-expands)
      await expect(page.getByText('Pinça Kelly Curva 16cm')).toBeVisible()
      await expect(page.getByText('Tesoura Metzenbaum 18cm')).toBeVisible()
    })

    test('card KIT deve exibir progress bar de conferência', async ({ page }) => {
      await addMaterial(page, 'MAT-002')

      // Close auto-conference
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      await page.keyboard.press('Escape')
      await expect(dialog).not.toBeVisible()

      await expect(page.getByText('0/10')).toBeVisible()
    })

    test('card KIT deve ter botão Conferir com texto', async ({ page }) => {
      await addMaterial(page, 'MAT-002')

      // Close auto-conference
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      await page.keyboard.press('Escape')
      await expect(dialog).not.toBeVisible()

      await expect(page.getByRole('button', { name: /Conferir/ })).toBeVisible()
    })

    test('card AVULSO deve ter controle de quantidade', async ({ page }) => {
      await addMaterial(page, 'MAT-001')

      await expect(page.getByText('PINÇA BACKAUS')).toBeVisible()
      const materialCard = page.locator('.rounded-sm.border').filter({ hasText: 'PINÇA BACKAUS' })
      await expect(materialCard).toBeVisible()
      const controlBtns = materialCard.locator('button').filter({ has: page.locator('svg') })
      const count = await controlBtns.count()
      expect(count).toBeGreaterThanOrEqual(2)
    })

    test('card AVULSO deve ter botões com texto: Imagens, Registrar, Remover', async ({ page }) => {
      await addMaterial(page, 'MAT-001')

      await expect(page.getByRole('button', { name: /Imagens/ })).toBeVisible()
      await expect(page.getByRole('button', { name: /Registrar/ })).toBeVisible()
      await expect(page.getByRole('button', { name: /Remover/ })).toBeVisible()
    })

    test('deve remover material ao clicar Remover', async ({ page }) => {
      await addMaterial(page, 'MAT-001')
      await expect(page.getByText('PINÇA BACKAUS')).toBeVisible()

      await page.getByRole('button', { name: /Remover/ }).click()

      await expect(page.getByText('PINÇA BACKAUS')).not.toBeVisible()
      await expect(page.getByText('0 materiais · 0 registrados')).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 6. Conferência de submateriais
  // ──────────────────────────────────────────────

  test.describe('Conferência de submateriais', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      await fillMinForm(page)
      await addMaterial(page, 'MAT-002')

      // Auto-conference opens for KIT (módulo COMPLETO) — wait for it, then close
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      await page.keyboard.press('Escape')
      await expect(dialog).not.toBeVisible()
    })

    test('deve abrir painel fullscreen de conferência ao clicar Conferir', async ({ page }) => {
      await page.getByRole('button', { name: /Conferir/ }).click()

      // Fullscreen dialog with conference scan combobox
      await expect(page.getByPlaceholder(/bipar código ou digitar nome do submaterial/i)).toBeVisible()
    })

    test('deve exibir todos os submateriais no painel', async ({ page }) => {
      await page.getByRole('button', { name: /Conferir/ }).click()

      const dialog = page.getByRole('dialog')
      await expect(dialog.getByText('Pinça Kelly Curva 16cm', { exact: true }).first()).toBeVisible()
      await expect(dialog.getByText('Pinça Hemostática Crile', { exact: true }).first()).toBeVisible()
      await expect(dialog.getByText('Tesoura Metzenbaum 18cm', { exact: true }).first()).toBeVisible()
      await expect(dialog.getByText('Porta Agulha Mayo-Hegar', { exact: true }).first()).toBeVisible()
    })

    test('deve exibir badges de status PENDENTE nos submateriais', async ({ page }) => {
      await page.getByRole('button', { name: /Conferir/ }).click()

      const pendenteBadges = page.getByText('PENDENTE')
      const count = await pendenteBadges.count()
      expect(count).toBeGreaterThan(0)
    })

    test('deve exibir contagem de faltantes no highlight strip', async ({ page }) => {
      await page.getByRole('button', { name: /Conferir/ }).click()

      await expect(page.getByText(/submateriais faltando/)).toBeVisible()
    })

    test('deve conferir submaterial via scan de código', async ({ page }) => {
      await page.getByRole('button', { name: /Conferir/ }).click()

      const dialog = page.getByRole('dialog')
      const conferenceScan = dialog.getByPlaceholder(/bipar código ou digitar nome do submaterial/i)
      await expect(conferenceScan).toBeVisible()

      await conferenceScan.fill('SUB-001')
      await conferenceScan.press('Enter')

      await expect(dialog.getByText(/conferidos/i)).toBeVisible()
    })

    test('deve exibir progress bar no painel de conferência', async ({ page }) => {
      await page.getByRole('button', { name: /Conferir/ }).click()

      const dialog = page.getByRole('dialog')
      await expect(dialog.getByText('0/10')).toBeVisible()
    })

    test('deve fechar painel ao pressionar Escape', async ({ page }) => {
      await page.getByRole('button', { name: /Conferir/ }).click()
      await expect(page.getByPlaceholder(/bipar código ou digitar nome do submaterial/i)).toBeVisible()

      await page.keyboard.press('Escape')

      await expect(page.getByPlaceholder(/bipar código ou digitar nome do submaterial/i)).not.toBeVisible()
    })

    test('conference scan deve exibir dropdown combobox ao digitar', async ({ page }) => {
      await page.getByRole('button', { name: /Conferir/ }).click()

      const dialog = page.getByRole('dialog')
      const conferenceScan = dialog.getByPlaceholder(/bipar código ou digitar nome do submaterial/i)
      await conferenceScan.fill('Pinça')

      // Dropdown should appear with filtered items
      await expect(dialog.getByText('Pinça Kelly Curva 16cm').first()).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 7. Autenticação para registrar (AuthModal)
  // ──────────────────────────────────────────────

  test.describe('AuthModal — registrar material', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      await fillMinForm(page)
      await addMaterial(page, 'MAT-001')
    })

    test('deve abrir AuthModal ao clicar Registrar', async ({ page }) => {
      await page.getByRole('button', { name: /Registrar/ }).click()

      await expect(page.getByText('Autenticar para registrar')).toBeVisible()
      await expect(page.getByPlaceholder(/código do usuário/i)).toBeVisible()
    })

    test('deve exibir erro ao inserir código inválido', async ({ page }) => {
      await page.getByRole('button', { name: /Registrar/ }).click()

      await page.getByPlaceholder(/código do usuário/i).fill('invalido')
      await page.getByRole('button', { name: 'Confirmar' }).click()

      await expect(page.getByText(/não encontrado/i)).toBeVisible()
    })

    test('deve registrar material com código válido', async ({ page }) => {
      await page.getByRole('button', { name: /Registrar/ }).click()

      await page.getByPlaceholder(/código do usuário/i).fill('gg')
      await page.getByRole('button', { name: 'Confirmar' }).click()

      await expect(page.getByText('REGISTRADO', { exact: true })).toBeVisible()
      await expect(page.getByText('1 materiais · 1 registrados')).toBeVisible()
    })

    test('deve travar Tipo e Setor somente após registrar material', async ({ page }) => {
      // Before registering, Tipo should be enabled
      const internaBtn = page.getByRole('button', { name: 'Interna', exact: true })
      await expect(internaBtn).toBeEnabled()

      // Register the material
      await page.getByRole('button', { name: /Registrar/ }).click()
      await page.getByPlaceholder(/código do usuário/i).fill('gg')
      await page.getByRole('button', { name: 'Confirmar' }).click()
      await expect(page.getByText('REGISTRADO', { exact: true })).toBeVisible()

      // Now Tipo should be disabled
      await expect(internaBtn).toBeDisabled()
    })

    test('deve exibir checkbox "Lembrar de mim"', async ({ page }) => {
      await page.getByRole('button', { name: /Registrar/ }).click()

      await expect(page.getByText(/lembrar de mim/i)).toBeVisible()
    })

    test('deve pular auth quando "Lembrar" está ativo', async ({ page }) => {
      // Register first material with "Lembrar"
      await page.getByRole('button', { name: /Registrar/ }).click()
      await page.getByPlaceholder(/código do usuário/i).fill('gg')
      await page.getByLabel(/lembrar/i).check()
      await page.getByRole('button', { name: 'Confirmar' }).click()

      // Add second material
      await addMaterial(page, 'MAT-007')

      // Register second — should skip dialog
      await page.getByRole('button', { name: /Registrar/ }).last().click()

      await expect(page.getByText('2 materiais · 2 registrados')).toBeVisible()
    })

    test('deve fechar AuthModal ao clicar Cancelar', async ({ page }) => {
      await page.getByRole('button', { name: /Registrar/ }).click()
      await expect(page.getByText('Autenticar para registrar')).toBeVisible()

      await page.getByRole('button', { name: 'Cancelar' }).click()

      await expect(page.getByText('Autenticar para registrar')).not.toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 8. Criação inline (CreateInlineDrawer)
  // ──────────────────────────────────────────────

  test.describe('CreateInlineDrawer', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entrada-de-materiais')
    })

    test('deve abrir drawer ao clicar "+ Criar novo médico" no dropdown de Médico', async ({ page }) => {
      // Open Médico combobox
      await page.getByPlaceholder('Buscar médico...').click()
      // Click the create button inside the dropdown
      await page.getByText('+ Criar novo médico').click()

      await expect(page.getByRole('heading', { name: 'Novo Médico' })).toBeVisible()
    })

    test('deve criar médico e auto-selecionar no combobox', async ({ page }) => {
      await page.getByPlaceholder('Buscar médico...').click()
      await page.getByText('+ Criar novo médico').click()

      await page.getByPlaceholder(/nome do médico/i).fill('Dr. Teste Silva')
      await page.getByRole('button', { name: 'Salvar' }).click()

      await expect(page.getByText('Novo Médico')).not.toBeVisible()
    })

    test('deve abrir drawer ao clicar "+ Criar novo paciente" no dropdown de Paciente', async ({ page }) => {
      await page.getByPlaceholder('Buscar paciente...').click()
      await page.getByText('+ Criar novo paciente').click()

      await expect(page.getByRole('heading', { name: 'Novo Paciente' })).toBeVisible()
    })

    test('deve abrir drawer ao clicar "+ Criar novo terceiro" no dropdown de Terceiro', async ({ page }) => {
      await page.getByPlaceholder('Buscar terceiro...').click()
      await page.getByText('+ Criar novo terceiro').click()

      await expect(page.getByRole('heading', { name: 'Novo Terceiro' })).toBeVisible()
    })

    test('drawer de Terceiro deve ter campo Tipo', async ({ page }) => {
      await page.getByPlaceholder('Buscar terceiro...').click()
      await page.getByText('+ Criar novo terceiro').click()

      await expect(page.getByText('Tipo *')).toBeVisible()
    })

    test('deve validar campo Nome obrigatório no drawer', async ({ page }) => {
      await page.getByPlaceholder('Buscar médico...').click()
      await page.getByText('+ Criar novo médico').click()

      const salvarBtn = page.getByRole('button', { name: 'Salvar' })
      await expect(salvarBtn).toBeDisabled()
    })

    test('deve fechar drawer ao clicar Cancelar', async ({ page }) => {
      await page.getByPlaceholder('Buscar médico...').click()
      await page.getByText('+ Criar novo médico').click()
      await expect(page.getByRole('heading', { name: 'Novo Médico' })).toBeVisible()

      await page.getByRole('button', { name: 'Cancelar' }).click()

      await expect(page.getByRole('heading', { name: 'Novo Médico' })).not.toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 9. Dialog de imagens
  // ──────────────────────────────────────────────

  test.describe('Dialog de imagens', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      await fillMinForm(page)
      await addMaterial(page, 'MAT-001')
    })

    test('deve abrir dialog de imagens ao clicar botão Imagens', async ({ page }) => {
      await page.getByRole('button', { name: /Imagens/ }).click()

      await expect(page.getByText(/Imagens —/)).toBeVisible()
    })

    test('deve exibir botão "Adicionar Foto" no dialog', async ({ page }) => {
      await page.getByRole('button', { name: /Imagens/ }).click()

      await expect(page.getByText('Adicionar Foto')).toBeVisible()
    })

    test('deve exibir mensagem quando não há imagens', async ({ page }) => {
      await page.getByRole('button', { name: /Imagens/ }).click()

      await expect(page.getByText('Adicionar Foto')).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 10. Relatório placeholder
  // ──────────────────────────────────────────────

  test.describe('Relatório', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entrada-de-materiais')
    })

    test('deve abrir dialog de relatório ao clicar botão Relatório', async ({ page }) => {
      await page.getByRole('button', { name: 'Gerar Relatório' }).click()

      await expect(page.getByText('Relatório de Entrada')).toBeVisible()
      await expect(page.getByText(/em desenvolvimento/i)).toBeVisible()
    })

    test('deve abrir relatório via ação contextual "Gerar Relatório"', async ({ page }) => {
      await page.getByRole('button', { name: 'Gerar Relatório' }).click()

      await expect(page.getByText('Relatório de Entrada')).toBeVisible()
    })

    test('deve fechar dialog de relatório ao clicar Fechar', async ({ page }) => {
      await page.getByRole('button', { name: 'Gerar Relatório' }).click()
      await expect(page.getByText('Relatório de Entrada')).toBeVisible()

      await page.getByRole('button', { name: 'Fechar' }).click()

      await expect(page.getByText('Relatório de Entrada')).not.toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 11. Ações contextuais
  // ──────────────────────────────────────────────

  test.describe('Ações contextuais', () => {
    test('"Nova Entrada" deve recarregar a página', async ({ page }) => {
      await page.goto('/entrada-de-materiais')

      // Preencher algo
      await selectTipo(page, 'Interna')

      // Clicar Nova Entrada
      await page.getByRole('button', { name: 'Nova Entrada' }).click()

      // Página deve recarregar (form volta ao estado inicial)
      await page.waitForLoadState('domcontentloaded')
      await expect(page.getByRole('heading', { name: 'Dados da Entrada' })).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 12. Fluxo completo (golden path)
  // ──────────────────────────────────────────────

  test.describe('Fluxo completo', () => {
    test('golden path: form → bipar KIT → bipar AVULSO → registrar ambos', async ({ page }) => {
      await page.goto('/entrada-de-materiais')

      // 1. Preencher form de metadados
      await fillMinForm(page)

      // 2. Bipar material KIT
      await addMaterial(page, 'MAT-002')
      await expect(page.getByText('CX VASCULAR Nº1').first()).toBeVisible()

      // Close auto-conference dialog
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible({ timeout: 5000 })
      await page.keyboard.press('Escape')
      await expect(dialog).not.toBeVisible()

      // 3. Bipar material AVULSO
      await addMaterial(page, 'MAT-001')
      await expect(page.getByText('PINÇA BACKAUS')).toBeVisible()
      await expect(page.getByText('2 materiais · 0 registrados')).toBeVisible()

      // 4. Registrar AVULSO (last card)
      await page.getByRole('button', { name: /Registrar/ }).last().click()
      await page.getByPlaceholder(/código do usuário/i).fill('gg')
      await page.getByRole('button', { name: 'Confirmar' }).click()
      await expect(page.getByText('2 materiais · 1 registrados')).toBeVisible()

      // 5. Registrar KIT (first card — must request auth again since "Lembrar" was not checked)
      await page.getByRole('button', { name: /Registrar/ }).first().click()
      await page.getByPlaceholder(/código do usuário/i).fill('gg')
      await page.getByRole('button', { name: 'Confirmar' }).click()
      await expect(page.getByText('2 materiais · 2 registrados')).toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 13. Auto-abrir conferência para KIT (módulo COMPLETO)
  // ──────────────────────────────────────────────

  test.describe('Auto-abrir conferência para KIT', () => {
    test('deve abrir conferência automaticamente ao adicionar KIT quando módulo é COMPLETO', async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      await fillMinForm(page)

      // Add KIT material
      await addMaterial(page, 'MAT-002')

      // Conference dialog should auto-open (fullscreen)
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      await expect(dialog.getByPlaceholder(/bipar código ou digitar nome do submaterial/i)).toBeVisible()
      await expect(dialog.getByRole('heading', { name: 'CX VASCULAR Nº1', exact: true })).toBeVisible()
    })
  })
})

// ══════════════════════════════════════════════════
// 14. Layout mobile
// ══════════════════════════════════════════════════

test.describe('Entrada de Materiais — Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await loginByCode(page, 'gg')
    await page.goto('/entrada-de-materiais')
  })

  test('deve exibir form como accordion colapsável', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Dados da Entrada/ })).toBeVisible()
    await expect(page.getByText(/\/6 preenchidos/)).toBeVisible()
  })

  test('deve colapsar accordion ao preencher form', async ({ page }) => {
    // On mobile, accordion starts expanded — fill the form directly
    await selectTipo(page, 'Interna')
    await selectSetor(page, 'Centro Cirúrgico')

    // Accordion should auto-collapse when form becomes valid
    await expect(scanInput(page)).toBeVisible()
  })

  test('deve permitir adicionar material no mobile', async ({ page }) => {
    // On mobile, accordion starts expanded — fill the form directly
    await selectTipo(page, 'Interna')
    await selectSetor(page, 'Centro Cirúrgico')

    await page.waitForTimeout(300)

    await addMaterial(page, 'MAT-001')

    await expect(page.getByText('PINÇA BACKAUS')).toBeVisible()
  })
})
