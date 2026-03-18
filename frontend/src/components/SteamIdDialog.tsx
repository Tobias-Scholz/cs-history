import SaveIcon from '@mui/icons-material/Save'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'

interface SteamIdDialogProps {
  open: boolean
  onClose: () => void
  steamIds: string[]
  onSave: (ids: string[]) => void
}

export const SteamIdDialog = ({ open, onClose, steamIds, onSave }: SteamIdDialogProps) => {
  const [localIds, setLocalIds] = useState(steamIds)

  useEffect(() => {
    if (open) setLocalIds(steamIds)
  }, [open, steamIds])

  const handleSave = () => {
    onSave(localIds)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 2, width: 420, maxWidth: '95vw' } }}>
      <DialogTitle sx={{ pb: 0, pt: 3, px: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          My Steam IDs
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Enter your Steam64 IDs to track your match history.
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 2, pb: 3 }}>
        <Autocomplete
          multiple
          options={[] as string[]}
          freeSolo
          renderTags={(value: readonly string[], getTagProps) =>
            value.map((option: string, index: number) => {
              const { key, ...tagProps } = getTagProps({ index })
              return (
                <Chip
                  variant="outlined"
                  label={option}
                  key={key}
                  {...tagProps}
                  size="small"
                  sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                />
              )
            })
          }
          value={localIds}
          onChange={(_, newValue) => setLocalIds(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Paste Steam64 ID and press Enter"
              size="small"
              sx={{ mt: 2 }}
            />
          )}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            disableElevation
            disabled={localIds.length === 0}
            onClick={handleSave}
            startIcon={<SaveIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Save
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
