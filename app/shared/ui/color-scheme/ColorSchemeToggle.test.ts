import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/vue'

import { renderWithProviders } from '@/shared/testing/renderWithProviders'
import { COLOR_SCHEME_STORAGE_KEY } from '@/shared/ui/color-scheme'

import ColorSchemeToggle from './ColorSchemeToggle.vue'

describe('ColorSchemeToggle', () => {
  afterEach(() => {
    delete document.documentElement.dataset.colorScheme
    delete document.documentElement.dataset.a11yMode
    localStorage.clear()
  })

  it('suit le système par défaut', async () => {
    renderWithProviders(ColorSchemeToggle)

    await waitFor(() =>
      expect(screen.getByTestId('color-scheme-toggle')).toHaveAccessibleName('Thème : système'),
    )
    expect(screen.getByTestId('color-scheme-option-auto')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByTestId('color-scheme-option-dark')).toHaveAttribute('aria-checked', 'false')
  })

  it('pose et mémorise le choix, puis « système » écrit auto', async () => {
    renderWithProviders(ColorSchemeToggle)
    const toggle = screen.getByTestId('color-scheme-toggle')

    await userEvent.click(toggle)
    await userEvent.click(screen.getByTestId('color-scheme-option-dark'))
    await waitFor(() => expect(toggle).toHaveAccessibleName('Thème : sombre'))
    expect(document.documentElement.dataset.colorScheme).toBe('dark')
    expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('dark')

    await userEvent.click(toggle)
    await userEvent.click(screen.getByTestId('color-scheme-option-auto'))
    await waitFor(() => expect(toggle).toHaveAccessibleName('Thème : système'))
    expect(document.documentElement.dataset.colorScheme).toBe('auto')
    expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('auto')
  })

  it('annonce un choix sombre suspendu par le mode renforcé', async () => {
    document.documentElement.dataset.colorScheme = 'dark'
    document.documentElement.dataset.a11yMode = 'enhanced'
    renderWithProviders(ColorSchemeToggle)

    await waitFor(() =>
      expect(screen.getByTestId('color-scheme-toggle')).toHaveAccessibleName(
        "Thème : sombre, suspendu par l'accessibilité renforcée",
      ),
    )
  })
})
