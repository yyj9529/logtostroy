import { codeToHtml } from 'shiki'
import { CodeBlock, HighlightedCodeBlock } from '@/lib/types/api'

const MAX_LINES = 20

/**
 * Truncate code to MAX_LINES and add a truncation marker.
 */
function truncateCode(code: string): { code: string; truncated: boolean } {
  const lines = code.split('\n')

  if (lines.length <= MAX_LINES) {
    return { code, truncated: false }
  }

  const truncatedLines = lines.slice(0, MAX_LINES)
  truncatedLines.push('// ... (truncated)')

  return {
    code: truncatedLines.join('\n'),
    truncated: true,
  }
}

/**
 * Highlight a single code block using Shiki.
 * Returns HTML string with syntax highlighting.
 */
async function highlightCodeBlock(
  codeBlock: CodeBlock
): Promise<HighlightedCodeBlock> {
  const { code: originalCode, language } = codeBlock
  const { code, truncated } = truncateCode(originalCode)

  try {
    const html = await codeToHtml(code, {
      lang: language,
      theme: 'github-dark',
    })

    return {
      language,
      html,
      truncated,
    }
  } catch (error) {
    // Fallback to plaintext if language is not supported
    console.warn(`Failed to highlight code with language "${language}", falling back to plaintext:`, error)

    const html = await codeToHtml(code, {
      lang: 'plaintext',
      theme: 'github-dark',
    })

    return {
      language: 'plaintext',
      html,
      truncated,
    }
  }
}

/**
 * Highlight multiple code blocks using Shiki (server-side).
 *
 * @param codeBlocks - Array of code blocks extracted from rawLog
 * @returns Array of highlighted code blocks with HTML and truncation info
 */
export async function highlightCodeBlocks(
  codeBlocks: CodeBlock[]
): Promise<HighlightedCodeBlock[]> {
  if (codeBlocks.length === 0) {
    return []
  }

  // Highlight all code blocks in parallel
  const highlighted = await Promise.all(
    codeBlocks.map((block) => highlightCodeBlock(block))
  )

  return highlighted
}
