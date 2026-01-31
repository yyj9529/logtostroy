export type Platform = 'linkedin' | 'x'
export type Language = 'ko' | 'en'

export interface OutputContent {
  text: string
  platform: Platform
  language: Language
}

export interface GeneratedOutput {
  linkedin: {
    ko?: string
    en?: string
  }
  x: {
    ko?: string
    en?: string
  }
}

export interface OutputDisplayProps {
  output: GeneratedOutput | null
  isLoading: boolean
  outputLanguage: 'ko' | 'en' | 'both'
  warnings?: string[]
  onCopy: (text: string, platform: Platform, language?: Language) => void
  onCopyAll: () => void
  onEdit: (platform: Platform, language: Language, text: string) => void
}
