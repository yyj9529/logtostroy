'use client'

import { useState, useEffect } from 'react'
import type {
  OutputDisplayProps,
  Platform,
  Language,
  GeneratedOutput,
} from '@/lib/types/output'
import AlertBanner from './AlertBanner'
import CodeBlockCard from './CodeBlockCard'

export default function OutputDisplay({
  output,
  isLoading,
  outputLanguage,
  warnings,
  evidenceMissing,
  highlightedCodeBlocks,
  onCopy,
  onCopyAll,
  onEdit,
}: OutputDisplayProps) {
  const [activePlatform, setActivePlatform] = useState<Platform>('linkedin')
  const [activeLanguage, setActiveLanguage] = useState<Language>('ko')
  const [editedOutput, setEditedOutput] = useState<GeneratedOutput | null>(
    output
  )
  const [isCopied, setIsCopied] = useState(false)
  const [isCopiedAll, setIsCopiedAll] = useState(false)


  // Update edited output when output prop changes
  useEffect(() => {
    if (output !== null) {
      if(outputLanguage === 'en' && output?.linkedin.en){
        setActiveLanguage('en');
      }else{
        setActiveLanguage('ko');
      }

      setEditedOutput(output)
      console.log('editedOutput updated:', output)
    }
  }, [output, outputLanguage])

  const handleTextChange = (
    platform: Platform,
    language: Language,
    text: string
  ) => {
    if (!editedOutput) return

    const updated = {
      ...editedOutput,
      [platform]: {
        ...editedOutput[platform],
        [language]: text,
      },
    }
    setEditedOutput(updated)
    onEdit(platform, language, text)
  }

  const getCurrentContent = (): string => {
    if (!editedOutput) return ''
    return editedOutput[activePlatform][activeLanguage] || ''
  }

  const handleCopyAll = async () => {
    if (!editedOutput) return

    setIsCopiedAll(true)
    await onCopyAll()

    // Reset button text after 2 seconds
    setTimeout(() => {
      setIsCopiedAll(false)
    }, 2000)
  }

  const handleIndividualCopy = async () => {
    setIsCopied(true)
    await onCopy(getCurrentContent(), activePlatform, activeLanguage)

    // Reset button text after 2 seconds
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  const showLanguageTabs = outputLanguage === 'both'

  return (
    <div className="w-1/2 bg-white text-gray-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Output Display</h2>
          <button
            onClick={handleCopyAll}
            disabled={!editedOutput || isLoading || isCopiedAll}
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${
              isCopiedAll
                ? 'bg-green-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isCopiedAll ? (
              <span className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Copied!
              </span>
            ) : (
              'Copy All'
            )}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      )}

      {/* Output Content */}
      {!isLoading && (
        <div className="flex-1 overflow-y-auto p-6">
          {/* Evidence Missing Warning */}
          {evidenceMissing && (
            <div className="mb-4 rounded-md bg-blue-900/20 border border-blue-600/30 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-blue-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-400">
                    No Evidence Provided
                  </h3>
                  <div className="mt-2 text-sm text-blue-200/80">
                    <p>
                      You did not provide evidence (before/after metrics). The generated content
                      avoids numeric claims to maintain accuracy.
                    </p>
                    <p className="mt-2 text-xs text-blue-200/60">
                      To include metrics in your post, add &quot;Evidence Before&quot; and
                      &quot;Evidence After&quot; in the form.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tone Violation Warning */}
          {warnings && warnings.length > 0 && (
            <AlertBanner warnings={warnings} />
          )}

          {/* Platform Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActivePlatform('linkedin')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activePlatform === 'linkedin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              LinkedIn
            </button>
            <button
              onClick={() => setActivePlatform('x')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activePlatform === 'x'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              X (Twitter)
            </button>
          </div>

          {/* Language Tabs (only when BOTH is selected) */}
          {showLanguageTabs && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveLanguage('ko')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeLanguage === 'ko'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                한국어
              </button>
              <button
                onClick={() => setActiveLanguage('en')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeLanguage === 'en'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                English
              </button>
            </div>
          )}

          {/* Output Text Area */}
          {editedOutput ? (
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={getCurrentContent()}
                  onChange={(e) =>
                    handleTextChange(
                      activePlatform,
                      activeLanguage,
                      e.target.value
                    )
                  }
                  rows={16}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Generated content will appear here..."
                />
              </div>

              {/* Code Blocks Section */}
              {highlightedCodeBlocks && highlightedCodeBlocks.length > 0 && (
                <CodeBlockCard codeBlocks={highlightedCodeBlocks} />
              )}

              {/* Individual Copy Button */}
              <button
                onClick={handleIndividualCopy}
                disabled={!getCurrentContent() || isCopied}
                className={`w-full px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${
                  isCopied ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isCopied ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </span>
                ) : (
                  <>
                    Copy {activePlatform === 'linkedin' ? 'LinkedIn' : 'X'} Post
                    {showLanguageTabs &&
                      ` (${activeLanguage === 'ko' ? '한국어' : 'English'})`}
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 min-h-[400px] flex items-center justify-center">
              <p className="text-gray-400 text-center">
                Generated content will appear here...
                <br />
                <span className="text-sm">
                  Fill in the form and click &quot;Generate Draft&quot;
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
