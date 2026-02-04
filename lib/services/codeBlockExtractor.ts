import { CodeBlock } from '@/lib/types/api'

const MAX_CODE_BLOCKS = 3
const MAX_CODE_BLOCK_LINES = 20

/**
 * Language detection heuristics based on common patterns.
 * Used as a fallback when no language identifier is provided.
 */
const LANGUAGE_PATTERNS: { language: string; pattern: RegExp }[] = [
  { language: 'typescript', pattern: /(?:interface\s+\w+|type\s+\w+\s*=|:\s*(?:string|number|boolean)\b|import\s+.*\s+from\s+['"])/ },
  { language: 'javascript', pattern: /(?:const\s+\w+\s*=|let\s+\w+\s*=|function\s+\w+|=>|require\s*\()/ },
  { language: 'python', pattern: /(?:def\s+\w+\s*\(|import\s+\w+|from\s+\w+\s+import|class\s+\w+.*:|print\s*\()/ },
  { language: 'java', pattern: /(?:public\s+(?:class|static|void)|private\s+|System\.out\.|import\s+java\.)/ },
  { language: 'go', pattern: /(?:func\s+\w+|package\s+\w+|import\s+\(|fmt\.|:=)/ },
  { language: 'rust', pattern: /(?:fn\s+\w+|let\s+mut\s+|impl\s+|pub\s+fn|println!\()/ },
  { language: 'sql', pattern: /(?:SELECT\s+.*FROM|INSERT\s+INTO|CREATE\s+TABLE|ALTER\s+TABLE|UPDATE\s+\w+\s+SET)/i },
  { language: 'bash', pattern: /(?:#!\/.+|echo\s+|if\s+\[\s|fi\b|done\b|\$\{?\w+}?)/ },
  { language: 'html', pattern: /(?:<\/?(?:div|span|html|head|body|p|a|img)\b|<!DOCTYPE)/i },
  { language: 'css', pattern: /(?:\{[^}]*(?:display|margin|padding|color|font-size)\s*:|@media\s)/ },
  { language: 'json', pattern: /^\s*[{\[][\s\S]*[}\]]\s*$/ },
  { language: 'yaml', pattern: /^[\w-]+:\s+.+$/m },
]

/**
 * Truncate a code block if it exceeds the maximum line limit.
 * Preserves syntax validity by cutting at line boundaries.
 */
export function truncateCode(code: string): { code: string; truncated: boolean } {
  const lines = code.split('\n')
  if (lines.length <= MAX_CODE_BLOCK_LINES) {
    return { code, truncated: false }
  }
  return {
    code: lines.slice(0, MAX_CODE_BLOCK_LINES).join('\n') + '\n// ... truncated',
    truncated: true,
  }
}

/**
 * Detect the programming language of a code snippet using heuristic pattern matching.
 */
export function detectLanguage(code: string): string {
  for (const { language, pattern } of LANGUAGE_PATTERNS) {
    if (pattern.test(code)) {
      return language
    }
  }
  return 'plaintext'
}

/**
 * Extract code blocks from raw log text.
 *
 * Supports two patterns:
 * 1. Fenced code blocks: ```language\ncode``` (markdown style)
 * 2. Indented code blocks: 4+ spaces or tab-indented consecutive lines
 *
 * Returns up to MAX_CODE_BLOCKS (3) structured code blocks.
 * Returns an empty array when no code blocks are found.
 */
export function extractCodeBlocks(rawLog: string): CodeBlock[] {
  const blocks: CodeBlock[] = []

  // Pattern 1: Fenced code blocks (```language\ncode```)
  const fencedRegex = /```(\w+)?\n([\s\S]*?)```/g
  let match: RegExpExecArray | null

  while ((match = fencedRegex.exec(rawLog)) !== null) {
    const rawCode = match[2].trim()
    if (rawCode.length === 0) continue

    const { code, truncated } = truncateCode(rawCode)
    blocks.push({
      language: match[1] || detectLanguage(rawCode),
      code,
      truncated,
    })

    if (blocks.length >= MAX_CODE_BLOCKS) {
      return blocks
    }
  }

  // Pattern 2: Indented code blocks (4+ spaces or tab at start of line)
  // Only look for these if we haven't filled up from fenced blocks
  if (blocks.length < MAX_CODE_BLOCKS) {
    const lines = rawLog.split('\n')
    let indentedLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const isIndented = /^(?:    |\t)/.test(line)
      const isEmpty = line.trim() === ''

      if (isIndented) {
        indentedLines.push(line.replace(/^(?:    |\t)/, ''))
      } else if (isEmpty && indentedLines.length > 0) {
        // Allow blank lines within indented blocks
        indentedLines.push('')
      } else {
        if (indentedLines.length >= 2) {
          const rawCode = indentedLines.join('\n').trim()
          if (rawCode.length > 0) {
            const { code, truncated } = truncateCode(rawCode)
            blocks.push({
              language: detectLanguage(rawCode),
              code,
              truncated,
            })

            if (blocks.length >= MAX_CODE_BLOCKS) {
              return blocks
            }
          }
        }
        indentedLines = []
      }
    }

    // Handle trailing indented block
    if (indentedLines.length >= 2) {
      const rawCode = indentedLines.join('\n').trim()
      if (rawCode.length > 0 && blocks.length < MAX_CODE_BLOCKS) {
        const { code, truncated } = truncateCode(rawCode)
        blocks.push({
          language: detectLanguage(rawCode),
          code,
          truncated,
        })
      }
    }
  }

  return blocks
}
