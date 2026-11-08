import { BRAND_COLOR_KEYS } from '@/modules/identity/domain/siteIdentity'

import type { SiteIdentity } from '@/modules/identity/domain/siteIdentity'
import type { components } from '@/shared/api/client'

type SiteIdentityDto = components['schemas']['SiteIdentity']
type ThemeTokensDto = components['schemas']['ThemeTokens']

const HEX_COLOR = /^#[0-9a-f]{6}$/i

// Les couleurs finissent dans un bloc <style> : une valeur hors contrat fait échouer la lecture (repli sur la configuration).
const toPalette = (dto: ThemeTokensDto): SiteIdentity.Palette => {
  for (const key of BRAND_COLOR_KEYS) {
    if (!HEX_COLOR.test(dto[key])) throw new Error(`Couleur ${key} invalide : ${dto[key]}`)
  }
  return { ...dto }
}

export const toSiteIdentity = (dto: SiteIdentityDto): SiteIdentity.Entity => ({
  name: dto.name,
  tagline: dto.tagline,
  logo: dto.logo,
  shareImage: dto.shareImage,
  icon: dto.icon && {
    png32: dto.icon.png32,
    png180: dto.icon.png180,
    png192: dto.icon.png192,
    png512: dto.icon.png512,
  },
  defaultColorScheme: dto.defaultColorScheme,
  theme: dto.theme ? { light: toPalette(dto.theme.light), dark: toPalette(dto.theme.dark) } : null,
  salesEnabled: dto.salesEnabled,
})
