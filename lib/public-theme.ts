import type { CSSProperties } from 'react'
import type { BrandSettings, FactoryThemePresetId } from '@/lib/admin-settings'

const HEX_COLOR = /^#[0-9a-f]{6}$/i

function safeColor(value: string | undefined, fallback: string) {
  return value && HEX_COLOR.test(value.trim()) ? value.trim() : fallback
}

export function getPublicThemeClass(themePreset: FactoryThemePresetId) {
  return `factory-theme-${themePreset}`
}

export function getPublicThemeStyle(brandSettings: BrandSettings): CSSProperties {
  const primary = safeColor(brandSettings.primaryColor, '#0B1F46')
  const accent = safeColor(brandSettings.accentColor, '#52E0D2')
  const background = safeColor(brandSettings.backgroundColor, '#071A3D')

  return {
    '--factory-brand-primary': primary,
    '--factory-brand-accent': accent,
    '--factory-brand-background': background,
  } as CSSProperties
}
