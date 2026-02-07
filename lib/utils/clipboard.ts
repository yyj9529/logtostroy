/**
 * Copy text to clipboard with fallback support
 * @param text - The text to copy to clipboard
 * @returns Promise that resolves to true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Try modern Clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch (err) {
      console.error('Clipboard API failed:', err)
      // Fall through to fallback method
    }
  }

  // Fallback method using execCommand (deprecated but widely supported)
  return fallbackCopyToClipboard(text)
}

/**
 * Fallback method for copying text to clipboard
 * Uses the deprecated execCommand method for older browsers
 */
function fallbackCopyToClipboard(text: string): boolean {
  const textArea = document.createElement('textarea')
  textArea.value = text

  // Avoid scrolling to bottom
  textArea.style.position = 'fixed'
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.width = '2em'
  textArea.style.height = '2em'
  textArea.style.padding = '0'
  textArea.style.border = 'none'
  textArea.style.outline = 'none'
  textArea.style.boxShadow = 'none'
  textArea.style.background = 'transparent'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return successful
  } catch (err) {
    console.error('Fallback copy failed:', err)
    document.body.removeChild(textArea)
    return false
  }
}
