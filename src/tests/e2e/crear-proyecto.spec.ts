/**
 * E2E test: Flujo completo — crear proyecto
 */

import { test, expect } from '@playwright/test'

test.describe('Crear Proyecto', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Gerente
    await page.goto('/login')
    await page.fill('input[type="email"]', 'gerente@people-helm.test')
    await page.fill('input[type="password"]', 'Test1234!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('el dashboard muestra KPIs al cargar', async ({ page }) => {
    await expect(page.getByText('Total Proyectos')).toBeVisible()
    await expect(page.getByText('Proyectos Verde')).toBeVisible()
  })

  test('abre el formulario de nuevo proyecto', async ({ page }) => {
    await page.click('text=Nuevo Proyecto')
    await expect(page.getByRole('heading', { name: 'Nuevo Proyecto' })).toBeVisible()
  })

  test('crea un proyecto correctamente', async ({ page }) => {
    await page.click('text=Nuevo Proyecto')

    await page.fill('input[placeholder="Ej: Implementación ATS Q2"]', 'Proyecto E2E Test')
    await page.selectOption('select[name="area_responsable"]', 'Reclutamiento')
    await page.selectOption('select[name="categoria"]', { index: 1 })
    await page.selectOption('select[name="foco_estrategico"]', 'Eficiencia')
    await page.fill('input[type="date"][name="fecha_inicio"]', '2025-01-01')
    await page.fill('input[type="date"][name="fecha_fin"]', '2025-12-31')

    await page.click('button[type="submit"]')

    // Toast de éxito
    await expect(page.getByText('Proyecto "Proyecto E2E Test" creado')).toBeVisible()
  })

  test('muestra error cuando fecha_fin < fecha_inicio', async ({ page }) => {
    await page.click('text=Nuevo Proyecto')

    await page.fill('input[placeholder="Ej: Implementación ATS Q2"]', 'Test Error Fecha')
    await page.fill('input[type="date"][name="fecha_inicio"]', '2025-12-31')
    await page.fill('input[type="date"][name="fecha_fin"]', '2025-01-01')

    await page.click('button[type="submit"]')

    await expect(page.getByText(/fecha/i)).toBeVisible()
  })
})
