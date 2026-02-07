'use client'

import { useState, useEffect } from 'react'
import type {
  OutputDisplayProps,
  Platform,
  Language,
  GeneratedOutput,
} from '@/lib/types/output'
import type { FeedbackMessage } from '@/lib/types/feedback'
import FeedbackMessageComponent from './FeedbackMessage'
import CodeBlockCard from './CodeBlockCard'
import {
  createToneViolationMessage,
  createEvidenceMissingMessage,
} from '@/lib/utils/feedbackHelpers'

export default function OutputDisplay({
  output,
  isLoading,
  outputLanguage,
  warnings,
  evidenceMissing,
  feedbackMessages: externalFeedbackMessages,
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
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>(
    []
  )

  // Convert warnings and evidenceMissing props to feedback messages
  useEffect(() => {
    const messages: FeedbackMessage[] = []

    // Add external feedback messages (errors from API)
    if (externalFeedbackMessages) {
      messages.push(...externalFeedbackMessages)
    }

    // Convert tone violation warnings
    if (warnings && warnings.length > 0) {
      messages.push(createToneViolationMessage(warnings))
    }

    // Convert evidence missing flag
    if (evidenceMissing) {
      messages.push(createEvidenceMissingMessage())
    }

    setFeedbackMessages(messages)
  }, [warnings, evidenceMissing, externalFeedbackMessages])

  // Update edited output when output prop changes
  useEffect(() => {
    if (output !== null) {
      if (outputLanguage === 'en' && output?.linkedin.en) {
        setActiveLanguage('en')
      } else {
        setActiveLanguage('ko')
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

  const handleDismissFeedback = (id: string) => {
    setFeedbackMessages((prev) => prev.filter((msg) => msg.id !== id))
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
          {/* Feedback Messages (warnings, errors, info) */}
          {feedbackMessages.map((message) => (
            <FeedbackMessageComponent
              key={message.id}
              message={message}
              onDismiss={handleDismissFeedback}
            />
          ))}

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
