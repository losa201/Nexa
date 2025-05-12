import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext<{theme:string;toggle:()=>void}>({theme:'light', toggle:()=>{}});

export const ThemeProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
  const [theme, setTheme] = useState<'light'|'dark'>(()=>
    localStorage.getItem('theme')==='dark'?'dark':'light'
  );
  const toggle = () => {
    setTheme(t=>{ const n = t==='light'?'dark':'light'; localStorage.setItem('theme',n); return n; });
  };
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme==='dark');
  },[theme]);
  return <ThemeContext.Provider value={{theme,toggle}}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
