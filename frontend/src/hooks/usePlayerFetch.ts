import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { BASE_URL } from '../constants'
import { Player } from '../types'

export function usePlayerFetch(
  mySteamIds: string[],
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const fetchPlayer = useCallback(
    async (query: string) => {
      if (!query || mySteamIds.length === 0) return
      setLoading(true)
      try {
        const response = await queryClient.fetchQuery<Response>({
          queryKey: ['history', query],
          queryFn: () =>
            fetch(BASE_URL + '/.netlify/functions/history', {
              method: 'POST',
              body: JSON.stringify({ mySteamIds, query }),
            }),
          staleTime: 0,
        })
        if (response.status === 200) {
          const player = (await response.json()) as Player
          setPlayers((prev) => [
            ...prev.filter((p) => p.steamId !== player.steamId),
            player,
          ])
        }
      } catch (err) {
        console.error('Failed to fetch player:', err)
      } finally {
        setLoading(false)
      }
    },
    [queryClient, mySteamIds, setPlayers]
  )

  return { fetchPlayer, loading }
}
