'use client'

import React from 'react'
import type { FeedbackMessage } from '@/lib/types/feedback'

interface FeedbackMessageProps {
  message: FeedbackMessage
  onDismiss?: (id: string) => void
}

export default function FeedbackMessage({
  message,
  onDismiss,
}: FeedbackMessageProps) {
  const getSeverityStyles = () => {
    switch (message.severity) {
      case 'error':
        return {
          container: 'bg-red-900/20 border-red-600/30',
          icon: 'text-red-400',
          title: 'text-red-400',
          text: 'text-red-200/80',
          subtext: 'text-red-200/60',
        }
      case 'warning':
        return {
          container: 'bg-yellow-900/20 border-yellow-600/30',
          icon: 'text-yellow-400',
          title: 'text-yellow-400',
          text: 'text-yellow-200/80',
          subtext: 'text-yellow-200/60',
        }
      case 'info':
        return {
          container: 'bg-blue-900/20 border-blue-600/30',
          icon: 'text-blue-400',
          title: 'text-blue-400',
          text: 'text-blue-200/80',
          subtext: 'text-blue-200/60',
        }
    }
  }

  const getIcon = () => {
    const styles = getSeverityStyles()

    switch (message.severity) {
      case 'error':
        return (
          <svg
            className={`h-5 w-5 ${styles.icon}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'warning':
        return (
          <svg
            className={`h-5 w-5 ${styles.icon}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        )
      case 'info':
        return (
          <svg
            className={`h-5 w-5 ${styles.icon}`}
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
        )
    }
  }

  const formatRetryTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconds`
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  const styles = getSeverityStyles()

  return (
    <div
      className={`mb-4 rounded-md border p-4 ${styles.container}`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {message.title}
          </h3>
          <div className={`mt-2 text-sm ${styles.text}`}>
            <p>{message.message}</p>

            {/* Details list (for tone violations, etc.) */}
            {message.details && message.details.length > 0 && (
              <ul className="mt-2 list-disc list-inside space-y-1">
                {message.details.map((detail, index) => (
                  <li key={index} className={styles.subtext}>
                    {detail}
                  </li>
                ))}
              </ul>
            )}

            {/* Rate limit specific info */}
            {message.retryAfter && (
              <p className={`mt-3 text-xs ${styles.subtext}`}>
                Please try again in {formatRetryTime(message.retryAfter)}.
              </p>
            )}

            {/* Budget specific info */}
            {message.budgetStatus && (
              <div className={`mt-3 text-xs ${styles.subtext}`}>
                <p>
                  Budget: ${message.budgetStatus.spentUsd.toFixed(2)} / $
                  {message.budgetStatus.limitUsd.toFixed(2)}
                </p>
                <p>Resets: {message.budgetStatus.resetsAt}</p>
              </div>
            )}

            {/* Contextual help text based on type */}
            {message.type === 'tone_violation' && (
              <p className={`mt-3 text-xs ${styles.subtext}`}>
                Your content has been automatically adjusted to maintain a
                professional tone. You can still proceed with the generated
                content.
              </p>
            )}
            {message.type === 'evidence_missing' && (
              <p className={`mt-2 text-xs ${styles.subtext}`}>
                To include metrics in your post, add &quot;Evidence
                Before&quot; and &quot;Evidence After&quot; in the form.
              </p>
            )}
          </div>
        </div>

        {/* Dismiss button */}
        {message.dismissable && onDismiss && (
          <button
            type="button"
            onClick={() => onDismiss(message.id)}
            className={`ml-3 flex-shrink-0 inline-flex ${styles.icon} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-md p-1.5`}
            aria-label="Dismiss"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
