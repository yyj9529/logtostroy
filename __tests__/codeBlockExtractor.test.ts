import { describe, it, expect } from 'vitest'
import {
  extractCodeBlocks,
  detectLanguage,
  truncateCode,
} from '@/lib/services/codeBlockExtractor'

describe('detectLanguage', () => {
  it('detects TypeScript', () => {
    expect(detectLanguage('interface User { name: string }')).toBe('typescript')
  })

  it('detects JavaScript', () => {
    expect(detectLanguage('const x = () => 42')).toBe('javascript')
  })

  it('detects Python', () => {
    expect(detectLanguage('def hello():\n    print("hi")')).toBe('python')
  })

  it('detects SQL', () => {
    expect(detectLanguage('SELECT * FROM users WHERE id = 1')).toBe('sql')
  })

  it('detects Go', () => {
    expect(detectLanguage('func main() {\n  fmt.Println("hello")\n}')).toBe(
      'go'
    )
  })

  it('detects Bash', () => {
    expect(detectLanguage('#!/bin/bash\necho "hello"')).toBe('bash')
  })

  it('returns plaintext for unknown code', () => {
    expect(detectLanguage('some random text')).toBe('plaintext')
  })
})

describe('extractCodeBlocks', () => {
  it('returns empty array when no code blocks found', () => {
    const rawLog = 'Just some plain text with no code blocks at all.'
    expect(extractCodeBlocks(rawLog)).toEqual([])
  })

  it('extracts a single fenced code block with language', () => {
    const rawLog = `
Some text before
\`\`\`typescript
const x: number = 42
\`\`\`
Some text after
`
    const result = extractCodeBlocks(rawLog)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      language: 'typescript',
      code: 'const x: number = 42',
      truncated: false,
    })
  })

  it('extracts fenced code block without language and detects it', () => {
    const rawLog = `
\`\`\`
def hello():
    print("world")
\`\`\`
`
    const result = extractCodeBlocks(rawLog)
    expect(result).toHaveLength(1)
    expect(result[0].language).toBe('python')
    expect(result[0].code).toBe('def hello():\n    print("world")')
  })

  it('extracts multiple fenced code blocks', () => {
    const rawLog = `
\`\`\`js
const a = 1
\`\`\`
some text
\`\`\`python
x = 2
\`\`\`
`
    const result = extractCodeBlocks(rawLog)
    expect(result).toHaveLength(2)
    expect(result[0].language).toBe('js')
    expect(result[1].language).toBe('python')
  })

  it('extracts at most 3 code blocks', () => {
    const rawLog = `
\`\`\`js
a = 1
\`\`\`
\`\`\`python
b = 2
\`\`\`
\`\`\`go
c := 3
\`\`\`
\`\`\`rust
let d = 4;
\`\`\`
`
    const result = extractCodeBlocks(rawLog)
    expect(result).toHaveLength(3)
    expect(result[2].language).toBe('go')
  })

  it('skips empty fenced code blocks', () => {
    const rawLog = `
\`\`\`js
\`\`\`
\`\`\`python
x = 1
\`\`\`
`
    const result = extractCodeBlocks(rawLog)
    expect(result).toHaveLength(1)
    expect(result[0].language).toBe('python')
  })

  it('extracts indented code blocks when no fenced blocks', () => {
    const rawLog = `
Some description here:
    const x = 1
    const y = 2
    console.log(x + y)
And then some more text.
`
    const result = extractCodeBlocks(rawLog)
    expect(result).toHaveLength(1)
    expect(result[0].code).toContain('const x = 1')
    expect(result[0].language).toBe('javascript')
  })

  it('handles indented blocks with blank lines', () => {
    const rawLog = `
Here is code:
    function add(a, b) {
        return a + b
    }

    const result = add(1, 2)
Done.
`
    const result = extractCodeBlocks(rawLog)
    expect(result).toHaveLength(1)
    expect(result[0].code).toContain('function add')
    expect(result[0].code).toContain('const result = add(1, 2)')
  })

  it('mixes fenced and indented blocks up to max 3', () => {
    const rawLog = `
\`\`\`python
x = 1
\`\`\`
\`\`\`js
const y = 2
\`\`\`
More text:
    func main() {
        fmt.Println("hello")
    }
End.
`
    const result = extractCodeBlocks(rawLog)
    expect(result).toHaveLength(3)
    expect(result[0].language).toBe('python')
    expect(result[1].language).toBe('js')
    expect(result[2].language).toBe('go')
  })

  it('handles rawLog with only whitespace', () => {
    expect(extractCodeBlocks('   \n\n  ')).toEqual([])
  })

  it('handles empty string', () => {
    expect(extractCodeBlocks('')).toEqual([])
  })

  it('truncates a long fenced code block and sets truncated flag', () => {
    const longCode = Array.from({ length: 30 }, (_, i) => `const line${i} = ${i}`).join('\n')
    const rawLog = `\`\`\`javascript\n${longCode}\n\`\`\``
    const result = extractCodeBlocks(rawLog)
    expect(result).toHaveLength(1)
    expect(result[0].truncated).toBe(true)
    expect(result[0].code).toContain('// ... truncated')
    expect(result[0].code.split('\n')).toHaveLength(21) // 20 lines + truncation marker
  })

  it('does not truncate a short fenced code block', () => {
    const shortCode = Array.from({ length: 5 }, (_, i) => `const line${i} = ${i}`).join('\n')
    const rawLog = `\`\`\`javascript\n${shortCode}\n\`\`\``
    const result = extractCodeBlocks(rawLog)
    expect(result).toHaveLength(1)
    expect(result[0].truncated).toBe(false)
    expect(result[0].code).not.toContain('// ... truncated')
  })

  it('truncates a long indented code block', () => {
    const longCode = Array.from({ length: 25 }, (_, i) => `    const line${i} = ${i}`).join('\n')
    const rawLog = `Some text:\n${longCode}\nEnd.`
    const result = extractCodeBlocks(rawLog)
    expect(result).toHaveLength(1)
    expect(result[0].truncated).toBe(true)
    expect(result[0].code).toContain('// ... truncated')
  })

  it('preserves language detection on truncated blocks', () => {
    const lines = ['def hello():', '    print("hello")']
    const padding = Array.from({ length: 25 }, (_, i) => `    x${i} = ${i}`)
    const longCode = [...lines, ...padding].join('\n')
    const rawLog = `\`\`\`\n${longCode}\n\`\`\``
    const result = extractCodeBlocks(rawLog)
    expect(result[0].language).toBe('python')
    expect(result[0].truncated).toBe(true)
  })
})

describe('truncateCode', () => {
  it('returns unchanged code when within limit', () => {
    const code = 'line1\nline2\nline3'
    const result = truncateCode(code)
    expect(result.code).toBe(code)
    expect(result.truncated).toBe(false)
  })

  it('truncates code exceeding 20 lines', () => {
    const code = Array.from({ length: 30 }, (_, i) => `line ${i}`).join('\n')
    const result = truncateCode(code)
    expect(result.truncated).toBe(true)
    expect(result.code).toContain('// ... truncated')
    // 20 original lines + marker line
    const lines = result.code.split('\n')
    expect(lines).toHaveLength(21)
    expect(lines[0]).toBe('line 0')
    expect(lines[19]).toBe('line 19')
    expect(lines[20]).toBe('// ... truncated')
  })

  it('keeps exactly 20 lines without truncation', () => {
    const code = Array.from({ length: 20 }, (_, i) => `line ${i}`).join('\n')
    const result = truncateCode(code)
    expect(result.truncated).toBe(false)
    expect(result.code).toBe(code)
  })
})
