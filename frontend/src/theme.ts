import { createTheme } from '@mui/material'

export const createAppTheme = (darkMode: boolean) =>
  createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#f97316' },
      secondary: { main: '#6366f1' },
      background: {
        default: darkMode ? '#0d1117' : '#f1f5f9',
        paper: darkMode ? '#161b22' : '#ffffff',
      },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: darkMode ? '#21262d' : '#e2e8f0' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border: `1px solid ${darkMode ? '#21262d' : '#e2e8f0'}`,
          },
        },
      },
    },
  })
