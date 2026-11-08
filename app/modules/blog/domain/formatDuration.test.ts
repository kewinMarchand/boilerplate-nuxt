import { formatDuration } from './formatDuration'

describe('formatDuration', () => {
  it('écrit les secondes sous une minute', () => {
    expect(formatDuration(4)).toBe('4 s')
  })

  it('arrondit à la minute', () => {
    expect(formatDuration(60)).toBe('1 min')
    expect(formatDuration(1570)).toBe('26 min')
  })

  it('passe aux heures à partir de 60 minutes', () => {
    expect(formatDuration(3600)).toBe('1 h 00 min')
    expect(formatDuration(3900)).toBe('1 h 05 min')
  })
})
