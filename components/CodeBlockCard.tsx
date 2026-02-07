'use client'

import { HighlightedCodeBlock } from '@/lib/types/api'

interface CodeBlockCardProps {
  codeBlocks: HighlightedCodeBlock[]
}

export default function CodeBlockCard({ codeBlocks }: CodeBlockCardProps) {
  if (!codeBlocks || codeBlocks.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Code Blocks</h3>

      {codeBlocks.map((block, index) => (
        <div key={index} className="rounded-lg overflow-hidden border border-gray-300">
          {/* Language Header */}
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
            <span className="text-sm font-mono text-gray-300">
              {block.language}
            </span>
            {block.truncated && (
              <span className="text-xs text-yellow-400 font-medium">
                Truncated (20+ lines)
              </span>
            )}
          </div>

          {/* Code Content with Shiki Highlighting */}
          <div
            className="shiki-wrapper overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: block.html }}
          />
        </div>
      ))}
    </div>
  )
}
