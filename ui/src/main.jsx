import { useState, useMemo, StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles';

import App from './App';

const rootElement = document.getElementById('root');

function Main() {

  // const [mode, setMode] = useState('dark');
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'dark');

  // Update localStorage whenever the mode changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: mode,
          background: {
            default: mode === 'dark' ? '#121212' : '#eeeeee',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#ffffff' : '#1a1a1a',
            secondary: mode === 'dark' ? '#b3b3b3' : '#4f4f4f',
          },
          custom: {
            listItem: {
              hoverBackground: mode === 'dark' ? '#333333' : '#d6d6d6',
              hoverText: mode === 'dark' ? '#ffffff' : '#000000',
            },
          },
        },
      }),
    [mode]
  );
  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App setMode={setMode} />
        </BrowserRouter>
      </ThemeProvider>
    </StrictMode>
  );
}

let root;
if (import.meta.hot) {
  // If the module is hot-reloadable, use the existing root if it exists
  root = rootElement._reactRootContainer?.root ?? createRoot(rootElement);
} else {
  // If the module is not hot-reloadable, always create a new root
  root = createRoot(rootElement);
}

root.render(<Main />);

if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    rootElement._reactRootContainer = { root };
  });
}