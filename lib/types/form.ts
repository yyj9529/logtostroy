export type TonePreset = 'linkedin' | 'x'
export type OutputLanguage = 'ko' | 'en' | 'both'

export interface LogFormData {
  rawLog: string
  outcome: string
  tonePreset: TonePreset
  outputLanguage: OutputLanguage
  evidenceBefore?: string
  evidenceAfter?: string
  humanInsight?: string
}

export interface FormErrors {
  rawLog?: string
  outcome?: string
  evidenceBefore?: string
  evidenceAfter?: string
  humanInsight?: string
}

export const FIELD_LIMITS = {
  rawLog: 2000,
  outcome: 200,
  evidenceBefore: 200,
  evidenceAfter: 200,
  humanInsight: 200,
} as const
