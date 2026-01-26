'use client'

import { useState } from 'react'
import type {
  LogFormData,
  FormErrors,
  TonePreset,
  OutputLanguage,
} from '@/lib/types/form'
import { FIELD_LIMITS } from '@/lib/types/form'

const initialFormData: LogFormData = {
  rawLog: '',
  outcome: '',
  tonePreset: 'linkedin',
  outputLanguage: 'ko',
  evidenceBefore: '',
  evidenceAfter: '',
  humanInsight: '',
}

export default function InputForm() {
  const [formData, setFormData] = useState<LogFormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [output, setOutput] = useState<string>('')
  const [showOutput, setShowOutput] = useState(false)

  const validateField = (
    name: keyof LogFormData,
    value: string
  ): string | undefined => {
    if (name === 'outcome' && !value.trim()) {
      return 'One Sentence Result is required'
    }

    const limit = FIELD_LIMITS[name as keyof typeof FIELD_LIMITS]
    if (limit && value.length > limit) {
      return `Max ${limit} characters (current: ${value.length})`
    }

    return undefined
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    const error = validateField(name as keyof LogFormData, value)
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.outcome.trim()) {
      newErrors.outcome = 'One Sentence Result is required'
    }

    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const error = validateField(key as keyof LogFormData, value)
        if (error) {
          newErrors[key as keyof FormErrors] = error
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: API 호출 구현
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setOutput('Sample output will appear here...')
      setShowOutput(true)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex h-screen">
      {/* Left Panel - Input */}
      <div className="w-1/2 bg-[#1a1d29] text-white p-6 overflow-y-auto scrollbar-thin">
        <h2 className="text-2xl font-bold mb-6">Raw Log Input</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Raw Log Editor */}
          <div>
            <div className="bg-[#0d1117] rounded-lg overflow-hidden border border-gray-700">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-gray-700">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-sm text-gray-400 ml-2">
                  VScode.tsx / VSDebug
                </span>
              </div>
              <textarea
                name="rawLog"
                value={formData.rawLog}
                onChange={handleChange}
                rows={12}
                className="w-full px-4 py-3 bg-[#0d1117] text-gray-300 font-mono text-sm focus:outline-none resize-none"
                placeholder="Paste your raw logs here..."
              />
            </div>
            {errors.rawLog && (
              <p className="text-xs text-red-400 mt-1">{errors.rawLog}</p>
            )}
          </div>

          {/* One Sentence Result */}
          <div>
            <label className="block text-sm font-medium mb-2">
              One Sentence Result <span className="text-red-400">*</span>
            </label>
            <input
              name="outcome"
              type="text"
              value={formData.outcome}
              onChange={handleChange}
              className={`w-full px-4 py-2 bg-[#0d1117] border rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.outcome ? 'border-red-500' : 'border-gray-700'
              }`}
              placeholder="Describe the outcome in one sentence..."
            />
            {errors.outcome && (
              <p className="text-xs text-red-400 mt-1">{errors.outcome}</p>
            )}
          </div>

          {/* Additional Options */}
          <details className="border border-gray-700 rounded-lg p-4 bg-[#0d1117]">
            <summary className="cursor-pointer font-medium text-gray-300">
              Additional Options
            </summary>
            <div className="space-y-4 mt-4">
              {/* Tone Preset */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tone Preset
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tonePreset"
                      value="linkedin"
                      checked={formData.tonePreset === 'linkedin'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm">LinkedIn</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tonePreset"
                      value="x"
                      checked={formData.tonePreset === 'x'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm">X (Twitter)</span>
                  </label>
                </div>
              </div>

              {/* Output Language */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Output Language
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="outputLanguage"
                      value="ko"
                      checked={formData.outputLanguage === 'ko'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm">한국어</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="outputLanguage"
                      value="en"
                      checked={formData.outputLanguage === 'en'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm">English</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="outputLanguage"
                      value="both"
                      checked={formData.outputLanguage === 'both'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm">Both</span>
                  </label>
                </div>
              </div>

              {/* Evidence Before */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Evidence Before
                </label>
                <input
                  name="evidenceBefore"
                  type="text"
                  value={formData.evidenceBefore}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#161b22] border border-gray-700 rounded text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Before state..."
                />
              </div>

              {/* Evidence After */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Evidence After
                </label>
                <input
                  name="evidenceAfter"
                  type="text"
                  value={formData.evidenceAfter}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#161b22] border border-gray-700 rounded text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="After state..."
                />
              </div>

              {/* Human Insight */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Human Insight
                </label>
                <input
                  name="humanInsight"
                  type="text"
                  value={formData.humanInsight}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#161b22] border border-gray-700 rounded text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your insight..."
                />
              </div>
            </div>
          </details>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all ${
              isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
            }`}
          >
            {isSubmitting ? 'Generating...' : 'Generate Draft'}
          </button>
        </form>
      </div>

      {/* Right Panel - Output */}
      <div className="w-1/2 bg-white text-gray-900 overflow-y-auto scrollbar-thin">
        {/* Output Preview */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Output Preview</h2>
            <button
              onClick={() => copyToClipboard(output)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Copy
            </button>
          </div>
          {isSubmitting && (
            <div className="flex items-center justify-center py-16">
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
          )}
        </div>

        {/* Output Zone */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Output Zone</h2>
            <button
              onClick={() => copyToClipboard(output)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Copy
            </button>
          </div>

          {/* Tab */}
          <div className="mb-4">
            <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-t-lg border-b-2 border-blue-600 font-medium text-sm">
              📄 LinkedIn Preview
            </button>
          </div>

          {/* Output Content */}
          {showOutput ? (
            <div className="bg-gray-50 rounded-lg p-6 min-h-[400px]">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold">
                  T
                </div>
                <div>
                  <h3 className="font-semibold">
                    Tramptosted Techniped Technicdc post
                  </h3>
                  <p className="text-sm text-gray-500">fasdfsoniew</p>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{output}</p>
              </div>
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
      </div>
    </div>
  )
}
