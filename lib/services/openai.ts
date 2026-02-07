import OpenAI from 'openai'
import { env } from '@/lib/env'
import {
  GenerateRequest,
  GeneratedContent,
  GenerateResponse,
} from '@/lib/types/api'
import type { CodeBlock } from '@/lib/types/api'
import { extractCodeBlocks } from '@/lib/services/codeBlockExtractor'
import {
  BANNED_HYPE_WORDS,
  BANNED_EN_WORDS,
  BANNED_KO_WORDS,
  BANNED_EMOJIS,
} from '@/lib/constants/bannedWords'

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

function buildSystemPrompt(language: 'ko' | 'en', platform: 'linkedin' | 'x'): string {
  const baseInstructions = {
    ko: `당신은 개발자의 기술 로그를 ${platform === 'linkedin' ? 'LinkedIn' : 'X (Twitter)'} 포스트로 재구성하는 도구입니다.

핵심 원칙:
1. 과장하지 않습니다. 마케팅 톤을 사용하지 않습니다.
2. 이모지를 사용하지 않습니다.
3. 사용자가 제공한 정보만 사용합니다. 결과를 만들어내지 않습니다.
4. Trust over polish: 정확성이 우선이며, 증거 없는 주장은 절대 하지 않습니다.
5. STAR 프레임워크를 따릅니다:
   - Situation (상황): rawLog에서 추출
   - Task (과제): 문맥에서 추론
   - Action (행동): rawLog에서 추출
   - Result (결과): 사용자가 제공한 outcome을 그대로 사용
5. 증거(Evidence) 처리 규칙:
   - 증거가 제공되면 반드시 원문 그대로 인용합니다. 의역하거나 수정하지 않습니다.
   - 증거는 "[Evidence]"로 명확히 표시합니다.
   - 증거의 숫자, 단위, 표현을 정확히 보존합니다.

${platform === 'linkedin' ? '6. LinkedIn 포맷: 전문적이지만 접근 가능한 톤. 1-3개의 짧은 문단.' : '6. X 포맷: 간결하고 직접적. 280자 제한 또는 짧은 스레드.'}

금지된 단어: ${BANNED_KO_WORDS.join(', ')}, ${BANNED_EN_WORDS.join(', ')}
금지된 이모지: ${BANNED_EMOJIS.join(' ')}`,
    en: `You are a tool that restructures developer technical logs into ${platform === 'linkedin' ? 'LinkedIn' : 'X (Twitter)'} posts.

Core principles:
1. No exaggeration. No marketing tone.
2. No emojis.
3. Use only user-provided information. Do not invent results.
4. Trust over polish: Accuracy first. NEVER make claims without evidence.
5. Follow the STAR framework:
   - Situation: extracted from rawLog
   - Task: inferred from context
   - Action: extracted from rawLog
   - Result: use the user-provided outcome verbatim
5. Evidence handling rules:
   - When evidence is provided, quote it EXACTLY as given. Do NOT paraphrase or modify.
   - Clearly mark evidence with "[Evidence]" label.
   - Preserve all numbers, units, and phrasing from the evidence verbatim.

${platform === 'linkedin' ? '6. LinkedIn format: Professional but accessible tone. 1-3 short paragraphs.' : '6. X format: Concise and direct. 280 character limit or short thread.'}

Banned words: ${BANNED_EN_WORDS.join(', ')}, ${BANNED_KO_WORDS.join(', ')}
Banned emojis: ${BANNED_EMOJIS.join(' ')}`,
  }

  return baseInstructions[language]
}

function buildUserPrompt(
  request: GenerateRequest,
  language: 'ko' | 'en',
  platform: 'linkedin' | 'x'
): string {
  const parts: string[] = []
  const hasEvidence = !!(request.evidenceBefore || request.evidenceAfter)

  parts.push(`Raw Log:\n${request.rawLog}`)
  parts.push(`\nOutcome (use exactly as written):\n${request.outcome}`)

  if (request.evidenceBefore) {
    parts.push(`\nEvidence Before (quote verbatim — do NOT paraphrase):\n${request.evidenceBefore}`)
  }

  if (request.evidenceAfter) {
    parts.push(`\nEvidence After (quote verbatim — do NOT paraphrase):\n${request.evidenceAfter}`)
  }

  if (request.humanInsight) {
    parts.push(`\nHuman Insight:\n${request.humanInsight}`)
  }

  const evidenceInstruction = hasEvidence
    ? language === 'ko'
      ? ' 제공된 증거(Evidence)는 원문 그대로 "[Evidence]" 라벨과 함께 인용하세요. 의역하거나 수정하지 마세요.'
      : ' Quote any provided evidence EXACTLY as given, marked with "[Evidence]". Do NOT paraphrase or modify the evidence text.'
    : ''

  const instructions =
    language === 'ko'
      ? `\n위 정보를 바탕으로 ${platform === 'linkedin' ? 'LinkedIn' : 'X'} 포스트를 작성하세요. outcome을 그대로 사용하고, 결과를 만들어내지 마세요.${evidenceInstruction}`
      : `\nBased on the above information, write a ${platform === 'linkedin' ? 'LinkedIn' : 'X'} post. Use the outcome verbatim and do not invent results.${evidenceInstruction}`

  parts.push(instructions)

  // Add evidence warning if no evidence provided
  if (!hasEvidence) {
    const noEvidenceWarning =
      language === 'ko'
        ? '\n중요: 증거가 제공되지 않았습니다. 다음을 절대 포함하지 마세요:\n- 숫자 클레임 (예: "50% 개선", "3배 향상", "2배 빨라짐")\n- 성능 주장 (예: "significantly faster", "much better", "dramatically improved")\n- 정량적 비교 (예: "훨씬 빠른", "월등히 나은", "크게 개선된")\n증거 없이는 정성적 설명만 사용하세요.'
        : '\nIMPORTANT: No evidence provided. Do NOT include:\n- Any numeric claims (e.g., "50% improvement", "3x faster", "2x better")\n- Performance claims (e.g., "significantly faster", "much better", "dramatically improved")\n- Quantitative comparisons (e.g., "way faster", "far better", "greatly enhanced")\nWithout evidence, use only qualitative descriptions.'
    parts.push(noEvidenceWarning)
  }

  if (platform === 'x') {
    const charLimit =
      language === 'ko'
        ? '\n280자 제한을 지켜주세요. 필요하면 짧은 스레드 형식으로 작성하세요.'
        : '\nKeep it under 280 characters. If needed, format as a short thread.'
    parts.push(charLimit)
  }

  return parts.join('\n')
}


function detectToneViolations(text: string): string[] {
  const violations: string[] = []
  const lowerText = text.toLowerCase()

  for (const word of BANNED_HYPE_WORDS) {
    if (lowerText.includes(word.toLowerCase())) {
      violations.push(`tone_violation: "${word}" detected`)
    }
  }

  return violations
}

async function generateForLanguageAndPlatform(
  request: GenerateRequest,
  language: 'ko' | 'en',
  platform: 'linkedin' | 'x'
): Promise<{ content: GeneratedContent; usage: OpenAI.Completions.CompletionUsage }> {
  const systemPrompt = buildSystemPrompt(language, platform)
  const userPrompt = buildUserPrompt(request, language, platform)

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: platform === 'x' ? 500 : 1000,
  })

  const generatedText = completion.choices[0]?.message?.content || ''
  const codeBlocks = extractCodeBlocks(request.rawLog)

  return {
    content: {
      text: generatedText,
      codeBlocks,
    },
    usage: completion.usage!,
  }
}

export async function generateContent(
  request: GenerateRequest
): Promise<GenerateResponse> {
  const warnings: string[] = []
  let totalPromptTokens = 0
  let totalCompletionTokens = 0
  let totalTokens = 0

  // Check for evidence presence
  const evidenceMissing = !request.evidenceBefore && !request.evidenceAfter

  const response: GenerateResponse = {
    evidenceMissing,
  }

  // Determine languages to generate
  const languages: ('ko' | 'en')[] =
    request.outputLanguage === 'both'
      ? ['ko', 'en']
      : [request.outputLanguage]

  // Generate for LinkedIn if tonePreset is linkedin
  if (request.tonePreset === 'linkedin') {
    const linkedinContent: Record<'ko' | 'en', string> = {} as Record<
      'ko' | 'en',
      string
    >
    const linkedinCodeBlocks: CodeBlock[] = []

    for (const lang of languages) {
      const { content, usage } = await generateForLanguageAndPlatform(
        request,
        lang,
        'linkedin'
      )
      linkedinContent[lang] = content.text
      if (lang === languages[0]) {
        linkedinCodeBlocks.push(...content.codeBlocks)
      }

      totalPromptTokens += usage.prompt_tokens
      totalCompletionTokens += usage.completion_tokens
      totalTokens += usage.total_tokens

      // Check for tone violations
      warnings.push(...detectToneViolations(content.text))
    }

    response.linkedin = {
      text: linkedinContent.ko || linkedinContent.en || '',
      codeBlocks: linkedinCodeBlocks,
      ko: linkedinContent.ko,
      en: linkedinContent.en,
    }
  }

  // Generate for X if tonePreset is x
  if (request.tonePreset === 'x') {
    const xContent: Record<'ko' | 'en', string> = {} as Record<
      'ko' | 'en',
      string
    >
    const xCodeBlocks: CodeBlock[] = []

    for (const lang of languages) {
      const { content, usage } = await generateForLanguageAndPlatform(
        request,
        lang,
        'x'
      )
      xContent[lang] = content.text
      if (lang === languages[0]) {
        xCodeBlocks.push(...content.codeBlocks)
      }

      totalPromptTokens += usage.prompt_tokens
      totalCompletionTokens += usage.completion_tokens
      totalTokens += usage.total_tokens

      // Check for tone violations
      warnings.push(...detectToneViolations(content.text))
    }

    response.x = {
      text: xContent.ko || xContent.en || '',
      codeBlocks: xCodeBlocks,
      ko: xContent.ko,
      en: xContent.en,
    }
  }

  // Check for numeric claims when evidence is missing
  if (evidenceMissing) {
    const generatedText = response.linkedin?.text || response.x?.text || ''

    // Numeric patterns: percentages, multipliers, numeric improvements
    const numericPatterns = /\d+%|\d+배|\d+x|\d+×|improved by \d+|\d+times|\d+\s*times|by\s+\d+%|by\s+\d+x|\d+\s*fold/i

    // Performance claim patterns
    const performancePatterns = /significantly (faster|better|improved)|much (faster|better|improved)|dramatically (faster|better|improved)|way (faster|better)|far (better|faster)|greatly (enhanced|improved)|훨씬\s+(빠른|나은|좋은)|월등히\s+(나은|빠른)|크게\s+(개선|향상)/i

    const hasNumericClaims = numericPatterns.test(generatedText)
    const hasPerformanceClaims = performancePatterns.test(generatedText)

    if (hasNumericClaims) {
      warnings.push('numeric_claims_without_evidence: numeric claims detected but no evidence provided')
    }

    if (hasPerformanceClaims) {
      warnings.push('performance_claims_without_evidence: performance claims detected but no evidence provided')
    }
  }

  // Check that evidence is quoted verbatim when provided
  if (!evidenceMissing) {
    const generatedTexts = [
      response.linkedin?.ko,
      response.linkedin?.en,
      response.x?.ko,
      response.x?.en,
    ].filter(Boolean) as string[]

    for (const text of generatedTexts) {
      if (request.evidenceBefore && !text.includes(request.evidenceBefore)) {
        warnings.push('evidence_not_verbatim: evidenceBefore may not be quoted exactly as provided')
      }
      if (request.evidenceAfter && !text.includes(request.evidenceAfter)) {
        warnings.push('evidence_not_verbatim: evidenceAfter may not be quoted exactly as provided')
      }
    }
  }

  response.warnings = warnings.length > 0 ? warnings : undefined
  response.tokenUsage = {
    promptTokens: totalPromptTokens,
    completionTokens: totalCompletionTokens,
    totalTokens: totalTokens,
  }

  return response
}
