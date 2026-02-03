export interface GenerateRequest {
  rawLog: string
  outcome: string
  tonePreset: 'linkedin' | 'x'
  outputLanguage: 'ko' | 'en' | 'both'
  evidenceBefore?: string
  evidenceAfter?: string
  humanInsight?: string
}

export interface CodeBlock {
  language: string
  code: string
}

export interface GeneratedContent {
  text: string
  codeBlocks: CodeBlock[]
  ko?: string
  en?: string
}

export interface GenerateResponse {
  linkedin?: GeneratedContent
  x?: GeneratedContent
  warnings?: string[]
  evidenceMissing?: boolean
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  output?: {
    linkedin: {
      ko?: string
      en?: string
    }
    x: {
      ko?: string
      en?: string
    }
  }
}

export interface GenerateError {
  error: string
  message: string
  details?: unknown
}
