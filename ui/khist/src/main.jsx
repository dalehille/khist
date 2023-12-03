// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { BrowserRouter } from 'react-router-dom'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <App />
// )

import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter } from 'react-router-dom'

function Main() {

  return (
    <>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </>
  );
}

const rootElement = document.getElementById('root');
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