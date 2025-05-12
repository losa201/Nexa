import { toast } from '@/components/ui/use-toast';

export function useTagToaster() {
  return {
    added: (tag: string) =>
      toast({ title: 'Tag Filtered', description: \`Added: \${tag}\`, variant: 'success' }),
    removed: (tag: string) =>
      toast({ title: 'Tag Removed', description: \`Removed: \${tag}\`, variant: 'default' }),
    cleared: () =>
      toast({ title: 'Filters Cleared', description: 'All tag filters have been reset.', variant: 'info' })
  };
}
