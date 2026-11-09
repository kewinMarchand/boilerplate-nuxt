export const TEST_PORT = 4020
export const PRODUCTION_PORT = 4021
export const PRODUCTION_URL = `http://localhost:${PRODUCTION_PORT}`
export const OBSERVABILITY_PORT = 4026
export const FAKE_GLITCHTIP_PORT = 4027
/** Build servi avec une API factice pour l'identité du site ; le projet mobile prend les deux ports suivants. */
export const IDENTITY_PORT = 4028
export const FAKE_API_PORT = 4029
/** Build servi avec une API factice, vente en ligne coupée ; le projet mobile prend les deux ports suivants. */
export const SALES_OFF_PORT = 4032
export const SALES_OFF_FAKE_API_PORT = 4033
/** Build servi avec `NUXT_PUBLIC_API_SCENARIO=bilingual` (site en français et en anglais) ; mobile : port suivant. */
export const BILINGUAL_PORT = 4022
/** Même build, bilingue, servi avec `MAINTENANCE=1` ; mobile : port suivant. */
export const BILINGUAL_MAINTENANCE_PORT = 4024
