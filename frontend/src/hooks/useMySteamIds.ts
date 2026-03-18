import { useCallback, useState } from 'react'

function readFromStorage(): string[] {
  try {
    return JSON.parse(localStorage.getItem('mySteamIds') ?? '[]')
  } catch {
    return []
  }
}

export function useMySteamIds() {
  const [steamIds, setSteamIds] = useState<string[]>(readFromStorage)

  const save = useCallback((ids: string[]) => {
    localStorage.setItem('mySteamIds', JSON.stringify(ids))
    setSteamIds(ids)
  }, [])

  return { steamIds, save }
}
