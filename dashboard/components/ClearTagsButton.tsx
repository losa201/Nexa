import React from 'react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'react-router-dom';
import { useTagToaster } from '@/hooks/useTagToaster';

export function ClearTagsButton() {
  const [params, setParams] = useSearchParams();
  const notify = useTagToaster();
  const tags = params.getAll('tag');

  const clear = () => {
    const next = new URLSearchParams(params);
    next.delete('tag');
    setParams(next);
    notify.cleared();
  };

  if (!tags.length) return null;
  return <Button size="sm" variant="destructive" onClick={clear}>Clear All Filters</Button>;
}
