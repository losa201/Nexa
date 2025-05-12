import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useTheme();
  return (
    <Button size="sm" variant="outline" onClick={toggle} aria-label="Toggle theme" className="flex items-center gap-1">
      {theme==='dark' ? <Sun size={16}/> : <Moon size={16}/>}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
