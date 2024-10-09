export const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)

  // Get day, month, year, hour, minute, and second
  const day = String(date.getDate()).padStart(2, '0') // Pad single digit days
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0') // Pad single digit hours
  const minutes = String(date.getMinutes()).padStart(2, '0') // Pad single digit minutes
  const seconds = String(date.getSeconds()).padStart(2, '0') // Pad single digit seconds

  // Format to German style with time
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`
}
