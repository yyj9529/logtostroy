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

  const validateField = (
    name: keyof LogFormData,
    value: string
  ): string | undefined => {
    if (name === 'outcome' && !value.trim()) {
      return 'Outcome은 필수 입력 항목입니다.'
    }

    const limit = FIELD_LIMITS[name as keyof typeof FIELD_LIMITS]
    if (limit && value.length > limit) {
      return `최대 ${limit}자까지 입력 가능합니다. (현재: ${value.length}자)`
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
      newErrors.outcome = 'Outcome은 필수 입력 항목입니다.'
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
      console.log('Form submitted:', formData)
      // TODO: API 호출 구현
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCharCount = (fieldName: keyof typeof FIELD_LIMITS) => {
    const value = formData[fieldName] as string
    const limit = FIELD_LIMITS[fieldName]
    return `${value.length}/${limit}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Raw Log */}
      <div>
        <label
          htmlFor="rawLog"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Raw Log
        </label>
        <textarea
          id="rawLog"
          name="rawLog"
          value={formData.rawLog}
          onChange={handleChange}
          rows={8}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.rawLog ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="작업 로그를 입력하세요..."
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">{getCharCount('rawLog')}</p>
          {errors.rawLog && (
            <p className="text-xs text-red-500">{errors.rawLog}</p>
          )}
        </div>
      </div>

      {/* Outcome */}
      <div>
        <label
          htmlFor="outcome"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Outcome <span className="text-red-500">*</span>
        </label>
        <input
          id="outcome"
          name="outcome"
          type="text"
          value={formData.outcome}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.outcome ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="원하는 결과를 입력하세요 (필수)"
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">{getCharCount('outcome')}</p>
          {errors.outcome && (
            <p className="text-xs text-red-500">{errors.outcome}</p>
          )}
        </div>
      </div>

      {/* Tone Preset */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <span>LinkedIn</span>
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
            <span>X (Twitter)</span>
          </label>
        </div>
      </div>

      {/* Output Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
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
            <span>한국어</span>
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
            <span>English</span>
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
            <span>Both</span>
          </label>
        </div>
      </div>

      {/* Optional Fields */}
      <details className="border border-gray-200 rounded-lg p-4">
        <summary className="cursor-pointer font-medium text-gray-700">
          추가 옵션 (선택사항)
        </summary>
        <div className="space-y-4 mt-4">
          {/* Evidence Before */}
          <div>
            <label
              htmlFor="evidenceBefore"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Evidence Before
            </label>
            <input
              id="evidenceBefore"
              name="evidenceBefore"
              type="text"
              value={formData.evidenceBefore}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.evidenceBefore ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="작업 전 상황을 입력하세요"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                {getCharCount('evidenceBefore')}
              </p>
              {errors.evidenceBefore && (
                <p className="text-xs text-red-500">{errors.evidenceBefore}</p>
              )}
            </div>
          </div>

          {/* Evidence After */}
          <div>
            <label
              htmlFor="evidenceAfter"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Evidence After
            </label>
            <input
              id="evidenceAfter"
              name="evidenceAfter"
              type="text"
              value={formData.evidenceAfter}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.evidenceAfter ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="작업 후 결과를 입력하세요"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                {getCharCount('evidenceAfter')}
              </p>
              {errors.evidenceAfter && (
                <p className="text-xs text-red-500">{errors.evidenceAfter}</p>
              )}
            </div>
          </div>

          {/* Human Insight */}
          <div>
            <label
              htmlFor="humanInsight"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Human Insight
            </label>
            <input
              id="humanInsight"
              name="humanInsight"
              type="text"
              value={formData.humanInsight}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.humanInsight ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="추가 인사이트를 입력하세요"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                {getCharCount('humanInsight')}
              </p>
              {errors.humanInsight && (
                <p className="text-xs text-red-500">{errors.humanInsight}</p>
              )}
            </div>
          </div>
        </div>
      </details>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
          isSubmitting
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? 'Generating...' : 'Generate'}
      </button>
    </form>
  )
}
