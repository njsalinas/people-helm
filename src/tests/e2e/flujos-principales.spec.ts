/**
 * E2E tests: Flujos principales de la aplicación
 */

import { test, expect } from '@playwright/test'

// ─── Auth helpers ─────────────────────────────────────────────────────────────

async function loginAsGerente(page: Parameters<Parameters<typeof test>[1]>[0]) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'gerente@people-helm.test')
  await page.fill('input[type="password"]', 'Test1234!')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
}

async function loginAsEspectador(page: Parameters<Parameters<typeof test>[1]>[0]) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'espectador@people-helm.test')
  await page.fill('input[type="password"]', 'Test1234!')
  await page.click('button[type="submit"]')
  await page.waitForURL('/')
}

// ─── Autenticación ────────────────────────────────────────────────────────────

test.describe('Autenticación', () => {
  test('redirige a /login cuando no autenticado', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })

  test('muestra error con credenciales incorrectas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'nobody@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('login exitoso redirige al dashboard', async ({ page }) => {
    await loginAsGerente(page)
    await expect(page).toHaveURL('/')
    await expect(page.getByText('Total Proyectos')).toBeVisible()
  })

  test('logout limpia la sesión', async ({ page }) => {
    await loginAsGerente(page)
    await page.click('text=Cerrar sesión')
    await expect(page).toHaveURL('/login')
  })
})

// ─── Bloqueos ─────────────────────────────────────────────────────────────────

test.describe('Gestión de Bloqueos', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsGerente(page)
    await page.goto('/bloqueos')
  })

  test('muestra tabla de bloqueos activos', async ({ page }) => {
    await expect(page.getByText('Bloqueos Activos')).toBeVisible()
    await expect(page.getByRole('table')).toBeVisible()
  })

  test('espectador no puede registrar bloqueos', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'espectador@people-helm.test')
    await page.fill('input[type="password"]', 'Test1234!')
    await page.click('button[type="submit"]')
    await page.goto('/bloqueos')
    await expect(page.getByText('Registrar Bloqueo')).not.toBeVisible()
  })
})

// ─── Reportería ───────────────────────────────────────────────────────────────

test.describe('Reportería — Semáforo', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsGerente(page)
    await page.goto('/reporteria/semaforo')
  })

  test('muestra la página de semáforo', async ({ page }) => {
    await expect(page.getByText('Semáforo Mensual')).toBeVisible()
  })

  test('botón Generar ahora es visible para Gerente', async ({ page }) => {
    await expect(page.getByText('+ Generar ahora')).toBeVisible()
  })

  test('espectador no ve el botón Generar', async ({ page }) => {
    await loginAsEspectador(page)
    await page.goto('/reporteria/semaforo')
    await expect(page.getByText('+ Generar ahora')).not.toBeVisible()
  })
})

// ─── Foco estratégico ─────────────────────────────────────────────────────────

test.describe('Vista por Foco', () => {
  test('muestra tabs de focos estratégicos', async ({ page }) => {
    await loginAsGerente(page)
    await page.goto('/focos')
    await expect(page.getByText('Eficiencia')).toBeVisible()
  })
})

// ─── Settings ─────────────────────────────────────────────────────────────────

test.describe('Configuración', () => {
  test('muestra perfil y preferencias de notificaciones', async ({ page }) => {
    await loginAsGerente(page)
    await page.goto('/settings')
    await expect(page.getByText('Perfil')).toBeVisible()
    await expect(page.getByText('Notificaciones')).toBeVisible()
  })
})
