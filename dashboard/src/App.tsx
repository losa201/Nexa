import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TagExplorerPanel from './TagExplorerPanel';
import { ThemeProvider } from '../hooks/useTheme';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TagExplorerPanel />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
