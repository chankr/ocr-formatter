import { createTheme, ThemeProvider } from '@mui/material/styles';
import { darkScrollbar, CssBaseline } from '@mui/material';
import { indigo, pink, grey } from '@mui/material/colors';
import Layout from '../Drawer/Layout';
import { Global } from '@emotion/react';

export default function App() {
  const theme = createTheme({
    palette: {
      primary: indigo,
      secondary: pink,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            ...darkScrollbar({
              track: grey[200],
              thumb: grey[400],
              active: grey[400],
            }),
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout />
    </ThemeProvider>
  );
}
