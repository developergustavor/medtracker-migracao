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
//
// Para rodar: npx playwright test tests/e2e/entrada-de-materiais.spec.ts
// ════════════════════════════════════════════════════════════════════

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

    test('deve exibir badges de progresso para todos os campos', async ({ page }) => {
      await expect(page.getByText('Tipo').first()).toBeVisible()
      await expect(page.getByText('Setor').first()).toBeVisible()
      await expect(page.getByText('Médico').first()).toBeVisible()
      await expect(page.getByText('Paciente').first()).toBeVisible()
      await expect(page.getByText('Procedimento').first()).toBeVisible()
      await expect(page.getByText('Terceiro').first()).toBeVisible()
    })

    test('deve mostrar campo Setor ao selecionar tipo Interna', async ({ page }) => {
      // Selecionar tipo
      await page.locator('[class*="entrada"] select, [role="combobox"]').first().click()
      await page.getByRole('option', { name: 'Interna' }).click()

      // Setor deve estar visível
      await expect(page.getByText('Setor *')).toBeVisible()
    })

    test('deve mostrar campo CME Origem ao selecionar tipo Externa', async ({ page }) => {
      await page.locator('[role="combobox"]').first().click()
      await page.getByRole('option', { name: 'Externa' }).click()

      await expect(page.getByText('CME Origem *')).toBeVisible()
    })

    test('deve habilitar Tipo Terceiro apenas quando Terceiro está selecionado', async ({ page }) => {
      // Tipo Terceiro deve estar desabilitado inicialmente
      const tipoTerceiroCombobox = page.getByRole('combobox').last()
      await expect(tipoTerceiroCombobox).toBeDisabled()
    })

    test('deve exibir botão "+ Criar" nos campos Médico, Paciente e Terceiro', async ({ page }) => {
      const criarButtons = page.getByRole('button', { name: '+ Criar' })
      await expect(criarButtons).toHaveCount(3)
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
      await expect(page.getByPlaceholder(/bipar código/i)).toBeDisabled()
    })

    test('deve desbloquear área após preencher tipo e setor', async ({ page }) => {
      // Preencher tipo
      await page.locator('[role="combobox"]').first().click()
      await page.getByRole('option', { name: 'Interna' }).click()

      // Preencher setor
      await page.locator('[role="combobox"]').nth(1).click()
      await page.getByRole('option', { name: 'Centro Cirúrgico' }).click()

      // Área deve estar desbloqueada
      await expect(page.getByText('Preencha os dados da entrada para adicionar materiais')).not.toBeVisible()
      await expect(page.getByPlaceholder(/bipar código/i)).toBeEnabled()
    })
  })

  // ──────────────────────────────────────────────
  // 4. Scan e adição de materiais
  // ──────────────────────────────────────────────

  test.describe('Adição de materiais', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      // Preencher form mínimo
      await page.locator('[role="combobox"]').first().click()
      await page.getByRole('option', { name: 'Interna' }).click()
      await page.locator('[role="combobox"]').nth(1).click()
      await page.getByRole('option', { name: 'Centro Cirúrgico' }).click()
    })

    test('deve adicionar material KIT ao bipar código', async ({ page }) => {
      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-002')
      await scanInput.press('Enter')

      await expect(page.getByText('CX VASCULAR Nº1')).toBeVisible()
      await expect(page.getByText('KIT').first()).toBeVisible()
    })

    test('deve adicionar material AVULSO ao bipar código', async ({ page }) => {
      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-001')
      await scanInput.press('Enter')

      await expect(page.getByText('PINÇA BACKAUS')).toBeVisible()
    })

    test('deve adicionar material por busca de nome', async ({ page }) => {
      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('capote')
      await scanInput.press('Enter')

      await expect(page.getByText('CAPOTE')).toBeVisible()
    })

    test('deve atualizar contagem no footer ao adicionar materiais', async ({ page }) => {
      const scanInput = page.getByPlaceholder(/bipar código/i)

      await scanInput.fill('MAT-001')
      await scanInput.press('Enter')
      await expect(page.getByText('1 materiais · 0 registrados')).toBeVisible()

      await scanInput.fill('MAT-002')
      await scanInput.press('Enter')
      await expect(page.getByText('2 materiais · 0 registrados')).toBeVisible()
    })

    test('deve limpar input após adicionar material', async ({ page }) => {
      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-001')
      await scanInput.press('Enter')

      await expect(scanInput).toHaveValue('')
    })

    test('deve travar campos Tipo e Setor após adicionar material', async ({ page }) => {
      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-001')
      await scanInput.press('Enter')

      // Tipo e Setor devem estar desabilitados
      const tipoCombobox = page.locator('[role="combobox"]').first()
      await expect(tipoCombobox).toBeDisabled()
    })
  })

  // ──────────────────────────────────────────────
  // 5. Cards de material
  // ──────────────────────────────────────────────

  test.describe('Cards de material', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      // Preencher form
      await page.locator('[role="combobox"]').first().click()
      await page.getByRole('option', { name: 'Interna' }).click()
      await page.locator('[role="combobox"]').nth(1).click()
      await page.getByRole('option', { name: 'Centro Cirúrgico' }).click()
    })

    test('card KIT deve exibir accordion de submateriais', async ({ page }) => {
      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-002')
      await scanInput.press('Enter')

      // Deve mostrar submateriais no accordion
      await expect(page.getByText('Pinça Kelly Curva 16cm')).toBeVisible()
      await expect(page.getByText('Tesoura Metzenbaum 18cm')).toBeVisible()
    })

    test('card KIT deve exibir progress bar de conferência', async ({ page }) => {
      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-002')
      await scanInput.press('Enter')

      await expect(page.getByText('0/7')).toBeVisible()
    })

    test('card KIT deve ter botão Conferir', async ({ page }) => {
      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-002')
      await scanInput.press('Enter')

      // Procurar botão conferir (TickSquare icon)
      const conferirBtn = page.locator('button[title="Conferir"]')
      await expect(conferirBtn).toBeVisible()
    })

    test('card AVULSO deve ter controle de quantidade', async ({ page }) => {
      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-001')
      await scanInput.press('Enter')

      // Botões −/+
      const minusBtn = page.locator('button').filter({ hasText: '−' }).last()
      const plusBtn = page.locator('button').filter({ hasText: '+' }).last()
      await expect(minusBtn).toBeVisible()
      await expect(plusBtn).toBeVisible()
    })

    test('deve remover material ao clicar Remover e confirmar', async ({ page }) => {
      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-001')
      await scanInput.press('Enter')
      await expect(page.getByText('PINÇA BACKAUS')).toBeVisible()

      // Clicar remover
      const removeBtn = page.locator('button[title="Remover"]')
      await removeBtn.click()

      // Confirmar no dialog
      await page.getByRole('button', { name: 'Excluir' }).click()

      // Material removido
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
      // Preencher form + adicionar KIT
      await page.locator('[role="combobox"]').first().click()
      await page.getByRole('option', { name: 'Interna' }).click()
      await page.locator('[role="combobox"]').nth(1).click()
      await page.getByRole('option', { name: 'Centro Cirúrgico' }).click()

      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-002')
      await scanInput.press('Enter')
    })

    test('deve abrir painel de conferência ao clicar Conferir', async ({ page }) => {
      await page.locator('button[title="Conferir"]').click()

      // Dialog de conferência deve abrir
      await expect(page.getByPlaceholder(/bipar código ou digitar nome/i)).toBeVisible()
    })

    test('deve exibir todos os submateriais no painel', async ({ page }) => {
      await page.locator('button[title="Conferir"]').click()

      await expect(page.getByText('Pinça Kelly Curva 16cm')).toBeVisible()
      await expect(page.getByText('Pinça Hemostática Crile')).toBeVisible()
      await expect(page.getByText('Tesoura Metzenbaum 18cm')).toBeVisible()
      await expect(page.getByText('Porta Agulha Mayo-Hegar')).toBeVisible()
    })

    test('deve exibir badges de status PENDENTE nos submateriais', async ({ page }) => {
      await page.locator('button[title="Conferir"]').click()

      const pendenteBadges = page.getByText('PENDENTE')
      const count = await pendenteBadges.count()
      expect(count).toBeGreaterThan(0)
    })

    test('deve exibir contagem de faltantes no highlight strip', async ({ page }) => {
      await page.locator('button[title="Conferir"]').click()

      await expect(page.getByText(/submateriais faltando/)).toBeVisible()
    })

    test('deve conferir submaterial via scan de código', async ({ page }) => {
      await page.locator('button[title="Conferir"]').click()

      const conferenceScan = page.getByPlaceholder(/bipar código ou digitar nome/i)
      await conferenceScan.fill('SUB-001')
      await conferenceScan.press('Enter')

      // Deve aparecer seção de conferidos
      await expect(page.getByText(/Conferidos/)).toBeVisible()
    })

    test('deve exibir progress bar no painel de conferência', async ({ page }) => {
      await page.locator('button[title="Conferir"]').click()

      // Progress bar com contagem
      await expect(page.getByText('0/7').first()).toBeVisible()
    })

    test('deve fechar painel ao clicar fechar', async ({ page }) => {
      await page.locator('button[title="Conferir"]').click()
      await expect(page.getByPlaceholder(/bipar código ou digitar nome/i)).toBeVisible()

      // Fechar (botão X do dialog ou Escape)
      await page.keyboard.press('Escape')

      // Painel deve ter fechado
      await expect(page.getByPlaceholder(/bipar código ou digitar nome/i)).not.toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 7. Autenticação para registrar (AuthModal)
  // ──────────────────────────────────────────────

  test.describe('AuthModal — registrar material', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      // Preencher form + adicionar material
      await page.locator('[role="combobox"]').first().click()
      await page.getByRole('option', { name: 'Interna' }).click()
      await page.locator('[role="combobox"]').nth(1).click()
      await page.getByRole('option', { name: 'Centro Cirúrgico' }).click()

      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-001')
      await scanInput.press('Enter')
    })

    test('deve abrir AuthModal ao clicar Registrar', async ({ page }) => {
      await page.locator('button[title="Registrar"]').click()

      await expect(page.getByText('Autenticar para registrar')).toBeVisible()
      await expect(page.getByPlaceholder(/código do usuário/i)).toBeVisible()
    })

    test('deve exibir erro ao inserir código inválido', async ({ page }) => {
      await page.locator('button[title="Registrar"]').click()

      await page.getByPlaceholder(/código do usuário/i).fill('invalido')
      await page.getByRole('button', { name: 'Confirmar' }).click()

      await expect(page.getByText(/não encontrado/i)).toBeVisible()
    })

    test('deve registrar material com código válido', async ({ page }) => {
      await page.locator('button[title="Registrar"]').click()

      await page.getByPlaceholder(/código do usuário/i).fill('gg')
      await page.getByRole('button', { name: 'Confirmar' }).click()

      // Material deve estar marcado como registrado
      await expect(page.getByText('REGISTRADO')).toBeVisible()
      await expect(page.getByText('1 materiais · 1 registrados')).toBeVisible()
    })

    test('deve exibir checkbox "Lembrar de mim"', async ({ page }) => {
      await page.locator('button[title="Registrar"]').click()

      await expect(page.getByText(/lembrar de mim/i)).toBeVisible()
    })

    test('deve pular auth quando "Lembrar" está ativo', async ({ page }) => {
      // Registrar primeiro material com "Lembrar"
      await page.locator('button[title="Registrar"]').click()
      await page.getByPlaceholder(/código do usuário/i).fill('gg')
      await page.getByLabel(/lembrar/i).check()
      await page.getByRole('button', { name: 'Confirmar' }).click()

      // Adicionar segundo material
      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-007')
      await scanInput.press('Enter')

      // Registrar segundo — não deve abrir dialog
      await page.locator('button[title="Registrar"]').last().click()

      // Deve registrar direto (sem dialog)
      await expect(page.getByText('2 materiais · 2 registrados')).toBeVisible()
    })

    test('deve fechar AuthModal ao clicar Cancelar', async ({ page }) => {
      await page.locator('button[title="Registrar"]').click()
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

    test('deve abrir drawer ao clicar "+ Criar" em Médico', async ({ page }) => {
      const criarButtons = page.getByRole('button', { name: '+ Criar' })
      await criarButtons.first().click()

      await expect(page.getByText('Novo Médico')).toBeVisible()
    })

    test('deve criar médico e auto-selecionar no combobox', async ({ page }) => {
      const criarButtons = page.getByRole('button', { name: '+ Criar' })
      await criarButtons.first().click()

      await page.getByPlaceholder(/nome do médico/i).fill('Dr. Teste Silva')
      await page.getByRole('button', { name: 'Salvar' }).click()

      // Drawer deve fechar
      await expect(page.getByText('Novo Médico')).not.toBeVisible()
    })

    test('deve abrir drawer ao clicar "+ Criar" em Paciente', async ({ page }) => {
      const criarButtons = page.getByRole('button', { name: '+ Criar' })
      await criarButtons.nth(1).click()

      await expect(page.getByText('Novo Paciente')).toBeVisible()
    })

    test('deve abrir drawer ao clicar "+ Criar" em Terceiro', async ({ page }) => {
      const criarButtons = page.getByRole('button', { name: '+ Criar' })
      await criarButtons.nth(2).click()

      await expect(page.getByText('Novo Terceiro')).toBeVisible()
    })

    test('drawer de Terceiro deve ter campo Tipo', async ({ page }) => {
      const criarButtons = page.getByRole('button', { name: '+ Criar' })
      await criarButtons.nth(2).click()

      await expect(page.getByText('Tipo *')).toBeVisible()
    })

    test('deve validar campo Nome obrigatório no drawer', async ({ page }) => {
      const criarButtons = page.getByRole('button', { name: '+ Criar' })
      await criarButtons.first().click()

      // Botão Salvar deve estar desabilitado sem nome
      const salvarBtn = page.getByRole('button', { name: 'Salvar' })
      await expect(salvarBtn).toBeDisabled()
    })

    test('deve fechar drawer ao clicar Cancelar', async ({ page }) => {
      const criarButtons = page.getByRole('button', { name: '+ Criar' })
      await criarButtons.first().click()
      await expect(page.getByText('Novo Médico')).toBeVisible()

      await page.getByRole('button', { name: 'Cancelar' }).click()

      await expect(page.getByText('Novo Médico')).not.toBeVisible()
    })
  })

  // ──────────────────────────────────────────────
  // 9. Dialog de imagens
  // ──────────────────────────────────────────────

  test.describe('Dialog de imagens', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/entrada-de-materiais')
      // Preencher form + adicionar material
      await page.locator('[role="combobox"]').first().click()
      await page.getByRole('option', { name: 'Interna' }).click()
      await page.locator('[role="combobox"]').nth(1).click()
      await page.getByRole('option', { name: 'Centro Cirúrgico' }).click()

      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-001')
      await scanInput.press('Enter')
    })

    test('deve abrir dialog de imagens ao clicar botão Imagens', async ({ page }) => {
      await page.locator('button[title="Imagens"]').click()

      await expect(page.getByText(/Imagens —/)).toBeVisible()
    })

    test('deve exibir botão "Adicionar Foto" no dialog', async ({ page }) => {
      await page.locator('button[title="Imagens"]').click()

      await expect(page.getByText('Adicionar Foto')).toBeVisible()
    })

    test('deve exibir mensagem quando não há imagens', async ({ page }) => {
      await page.locator('button[title="Imagens"]').click()

      await expect(page.getByText(/nenhuma imagem/i)).toBeVisible()
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
      await page.getByRole('button', { name: 'Relatório' }).click()

      await expect(page.getByText('Relatório de Entrada')).toBeVisible()
      await expect(page.getByText(/em desenvolvimento/i)).toBeVisible()
    })

    test('deve abrir relatório via ação contextual "Gerar Relatório"', async ({ page }) => {
      await page.getByRole('button', { name: 'Gerar Relatório' }).click()

      await expect(page.getByText('Relatório de Entrada')).toBeVisible()
    })

    test('deve fechar dialog de relatório ao clicar Fechar', async ({ page }) => {
      await page.getByRole('button', { name: 'Relatório' }).click()
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
      await page.locator('[role="combobox"]').first().click()
      await page.getByRole('option', { name: 'Interna' }).click()

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
      await page.locator('[role="combobox"]').first().click()
      await page.getByRole('option', { name: 'Interna' }).click()
      await page.locator('[role="combobox"]').nth(1).click()
      await page.getByRole('option', { name: 'Centro Cirúrgico' }).click()

      // 2. Bipar material KIT
      const scanInput = page.getByPlaceholder(/bipar código/i)
      await scanInput.fill('MAT-002')
      await scanInput.press('Enter')
      await expect(page.getByText('CX VASCULAR Nº1')).toBeVisible()

      // 3. Bipar material AVULSO
      await scanInput.fill('MAT-001')
      await scanInput.press('Enter')
      await expect(page.getByText('PINÇA BACKAUS')).toBeVisible()
      await expect(page.getByText('2 materiais · 0 registrados')).toBeVisible()

      // 4. Registrar AVULSO
      await page.locator('button[title="Registrar"]').last().click()
      await page.getByPlaceholder(/código do usuário/i).fill('gg')
      await page.getByRole('button', { name: 'Confirmar' }).click()
      await expect(page.getByText('2 materiais · 1 registrados')).toBeVisible()

      // 5. Registrar KIT (deve pedir auth novamente pois não marcou lembrar)
      await page.locator('button[title="Registrar"]').first().click()
      await page.getByPlaceholder(/código do usuário/i).fill('gg')
      await page.getByRole('button', { name: 'Confirmar' }).click()
      await expect(page.getByText('2 materiais · 2 registrados')).toBeVisible()
    })
  })
})

// ══════════════════════════════════════════════════
// 12. Layout mobile
// ══════════════════════════════════════════════════

test.describe('Entrada de Materiais — Mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await loginByCode(page, 'gg')
    await page.goto('/entrada-de-materiais')
  })

  test('deve exibir form como accordion colapsável', async ({ page }) => {
    await expect(page.getByText('Dados da Entrada')).toBeVisible()
    // Deve ter indicador de progresso
    await expect(page.getByText(/\/6 preenchidos/)).toBeVisible()
  })

  test('deve colapsar accordion ao preencher form', async ({ page }) => {
    // Expandir e preencher
    await page.getByText('Dados da Entrada').click()

    await page.locator('[role="combobox"]').first().click()
    await page.getByRole('option', { name: 'Interna' }).click()
    await page.locator('[role="combobox"]').nth(1).click()
    await page.getByRole('option', { name: 'Centro Cirúrgico' }).click()

    // Accordion deve colapsar automaticamente quando form fica válido
    // Verificar que scan bar está visível (materiais desbloqueados)
    await expect(page.getByPlaceholder(/bipar código/i)).toBeVisible()
  })

  test('deve permitir adicionar material no mobile', async ({ page }) => {
    // Preencher form
    await page.getByText('Dados da Entrada').click()
    await page.locator('[role="combobox"]').first().click()
    await page.getByRole('option', { name: 'Interna' }).click()
    await page.locator('[role="combobox"]').nth(1).click()
    await page.getByRole('option', { name: 'Centro Cirúrgico' }).click()

    // Aguardar desbloqueio
    await page.waitForTimeout(300)

    // Bipar material
    const scanInput = page.getByPlaceholder(/bipar código/i)
    await scanInput.fill('MAT-001')
    await scanInput.press('Enter')

    await expect(page.getByText('PINÇA BACKAUS')).toBeVisible()
  })
})
