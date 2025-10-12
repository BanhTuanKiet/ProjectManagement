export const shortenText = (value: string) => {
  if (value == null || value === '') return 'N/A'
  if (value.length > 15) {
    return value.substring(0, 15) + '...'
  }
  return value
}

export function capitalizeFirstLetter(text: string): string {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1)
}
