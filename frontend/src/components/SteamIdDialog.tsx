import SaveIcon from '@mui/icons-material/Save'
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from '@mui/material'
import { useState } from 'react'

export const SteamIdDialog = () => {
  const [open, setOpen] = useState(!localStorage.getItem('mySteamId'))
  const [inputValue, setInputValue] = useState('')

  const handleSave = () => {
    localStorage.setItem('mySteamId', inputValue)
    setOpen(false)
  }

  return (
    <Dialog open={open}>
      <DialogTitle>My Steam64ID</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="steam64Id"
          type="text"
          fullWidth
          variant="outlined"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
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
