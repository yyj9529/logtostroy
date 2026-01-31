import React from 'react'

export interface AlertBannerProps {
  warnings: string[]
  onDismiss?: () => void
}

export default function AlertBanner({ warnings, onDismiss }: AlertBannerProps) {
  if (!warnings || warnings.length === 0) {
    return null
  }

  return (
    <div className="mb-4 rounded-md bg-yellow-900/20 border border-yellow-600/30 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
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
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-400">
            Tone Violation Detected
          </h3>
          <div className="mt-2 text-sm text-yellow-200/80">
            <p className="mb-2">
              The following hype words were detected and neutralized in your content:
            </p>
            <ul className="list-disc list-inside space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-yellow-200/70">
                  {warning}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-yellow-200/60">
              Your content has been automatically adjusted to maintain a professional tone.
              You can still proceed with the generated content.
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-3 flex-shrink-0 inline-flex text-yellow-400 hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-500 rounded-md p-1.5"
            aria-label="Dismiss warning"
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
