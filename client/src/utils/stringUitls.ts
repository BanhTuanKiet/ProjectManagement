export const shortenText = (value: string) => {
  if (value == null || value === '') return 'N/A'
  if (value.length > 15) {
    return value.substring(0, 15) + '...'
  }
  return value
}