import { maintenancePage } from './maintenancePage'

describe('maintenancePage', () => {
  it('sert la page dans la langue demandée, en français sans dictionnaire pour cette langue', () => {
    const english = maintenancePage('en')
    const german = maintenancePage('de')

    expect(english).toContain('<html lang="en">')
    expect(english).toContain('<h1>Site under maintenance</h1>')
    expect(german).toContain('<h1>Site en maintenance</h1>')
  })
})
