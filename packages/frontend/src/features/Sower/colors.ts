export const colorClasses: Record<string, { bg: string; text: string }> = {
  'utility-success': {
    bg: 'bg-utility-success',
    text: 'text-utility-success',
  },
  'utility-error': { bg: 'bg-utility-error', text: 'text-utility-error' },
};

export const backgroundStyles: Record<string, { backgroundColor: string }> = {
  'utility-success': {
    backgroundColor:
      'color-mix(in srgb, var(--mantine-color-utility-1) 25%, transparent)',
  },
  'utility-error': {
    backgroundColor:
      'color-mix(in srgb, var(--mantine-color-utility-3) 25%, transparent)',
  },
};
