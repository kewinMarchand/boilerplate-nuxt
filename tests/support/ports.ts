export const TEST_PORT = 3110
export const PRODUCTION_PORT = 3111
export const PRODUCTION_URL = `http://localhost:${PRODUCTION_PORT}`
export const OBSERVABILITY_PORT = 3112
export const FAKE_GLITCHTIP_PORT = 3113
/** Build servi avec une API factice pour l'identité du site ; le projet mobile prend les deux ports suivants. */
export const IDENTITY_PORT = 3114
export const FAKE_API_PORT = 3115
/** Build servi avec une API factice, vente en ligne coupée ; le projet mobile prend les deux ports suivants. */
export const SALES_OFF_PORT = 3140
export const SALES_OFF_FAKE_API_PORT = 3141
/** Build servi avec `NUXT_PUBLIC_API_SCENARIO=bilingual` (site en français et en anglais) ; mobile : port suivant. */
export const BILINGUAL_PORT = 3118
