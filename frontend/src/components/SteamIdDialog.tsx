import SaveIcon from '@mui/icons-material/Save'
import {
  Autocomplete,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField
} from '@mui/material'
import { useState } from 'react'

export const SteamIdDialog = () => {
  const [open, setOpen] = useState(!localStorage.getItem('mySteamIds'))
  const [steamIds, setSteamIds] = useState([] as string[])

  const handleSave = () => {
    localStorage.setItem('mySteamIds', JSON.stringify(steamIds))
    setOpen(false)
  }

  return (
    <Dialog open={open}>
      <DialogTitle>Set My Steam64IDs</DialogTitle>
      <DialogContent style={{ width: 400 }}>
        <Autocomplete
          multiple
          id="tags-filled"
          options={[] as string[]}
          freeSolo
          renderTags={(value: readonly string[], getTagProps) =>
            value.map((option: string, index: number) => {
              const { key, ...tagProps } = getTagProps({ index })
              return <Chip variant="outlined" label={option} key={key} {...tagProps} />
            })
          }
          onChange={(_, newValue) => setSteamIds(newValue)}
          renderInput={(params) => <TextField {...params} variant="standard" label="steam64ids" placeholder="123" />}
        />
      </DialogContent>
      <DialogActions>
        <IconButton onClick={handleSave} aria-label="save" color="primary">
          <SaveIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  )
}
