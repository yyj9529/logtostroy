import OpenAI from 'openai'
import { env } from '@/lib/env'
import {
  GenerateRequest,
  GeneratedContent,
  GenerateResponse,
} from '@/lib/types/api'
import { extractCodeBlocks } from '@/lib/services/codeBlockExtractor'

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

const BANNED_HYPE_WORDS = [
  'game-changer',
  'revolutionary',
  'cutting-edge',
  'innovative',
  'disruptive',
  'next-level',
  'amazing',
  'incredible',
  'awesome',
  'groundbreaking',
]

function buildSystemPrompt(language: 'ko' | 'en', platform: 'linkedin' | 'x'): string {
  const baseInstructions = {
    ko: `당신은 개발자의 기술 로그를 ${platform === 'linkedin' ? 'LinkedIn' : 'X (Twitter)'} 포스트로 재구성하는 도구입니다.

핵심 원칙:
1. 과장하지 않습니다. 마케팅 톤을 사용하지 않습니다.
2. 이모지를 사용하지 않습니다.
3. 사용자가 제공한 정보만 사용합니다. 결과를 만들어내지 않습니다.
4. STAR 프레임워크를 따릅니다:
   - Situation (상황): rawLog에서 추출
   - Task (과제): 문맥에서 추론
   - Action (행동): rawLog에서 추출
   - Result (결과): 사용자가 제공한 outcome을 그대로 사용

${platform === 'linkedin' ? '5. LinkedIn 포맷: 전문적이지만 접근 가능한 톤. 1-3개의 짧은 문단.' : '5. X 포맷: 간결하고 직접적. 280자 제한 또는 짧은 스레드.'}

금지된 단어: ${BANNED_HYPE_WORDS.join(', ')}`,
    en: `You are a tool that restructures developer technical logs into ${platform === 'linkedin' ? 'LinkedIn' : 'X (Twitter)'} posts.

Core principles:
1. No exaggeration. No marketing tone.
2. No emojis.
3. Use only user-provided information. Do not invent results.
4. Follow the STAR framework:
   - Situation: extracted from rawLog
   - Task: inferred from context
   - Action: extracted from rawLog
   - Result: use the user-provided outcome verbatim

${platform === 'linkedin' ? '5. LinkedIn format: Professional but accessible tone. 1-3 short paragraphs.' : '5. X format: Concise and direct. 280 character limit or short thread.'}

Banned words: ${BANNED_HYPE_WORDS.join(', ')}`,
  }

  return baseInstructions[language]
}

function buildUserPrompt(
  request: GenerateRequest,
  language: 'ko' | 'en',
  platform: 'linkedin' | 'x'
): string {
  const parts: string[] = []

  parts.push(`Raw Log:\n${request.rawLog}`)
  parts.push(`\nOutcome (use exactly as written):\n${request.outcome}`)

  if (request.evidenceBefore) {
    parts.push(`\nEvidence Before:\n${request.evidenceBefore}`)
  }

  if (request.evidenceAfter) {
    parts.push(`\nEvidence After:\n${request.evidenceAfter}`)
  }

  if (request.humanInsight) {
    parts.push(`\nHuman Insight:\n${request.humanInsight}`)
  }

  const instructions =
    language === 'ko'
      ? `\n위 정보를 바탕으로 ${platform === 'linkedin' ? 'LinkedIn' : 'X'} 포스트를 작성하세요. outcome을 그대로 사용하고, 결과를 만들어내지 마세요.`
      : `\nBased on the above information, write a ${platform === 'linkedin' ? 'LinkedIn' : 'X'} post. Use the outcome verbatim and do not invent results.`

  parts.push(instructions)

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

  const response: GenerateResponse = {}

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
    const linkedinCodeBlocks: {
      language: string
      code: string
    }[] = []

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
    const xCodeBlocks: { language: string; code: string }[] = []

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

  // Check for evidence warnings
  if (!request.evidenceBefore && !request.evidenceAfter) {
    const hasNumericClaims = /\d+%|\d+x|improved by \d+/i.test(
      response.linkedin?.text || response.x?.text || ''
    )
    if (hasNumericClaims) {
      warnings.push('evidence_missing: numeric claims without evidence')
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
