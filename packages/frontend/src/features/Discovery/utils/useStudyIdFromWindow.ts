import { useMemo } from 'react';

const getStudyIdFromPath = (pathname?: string): string | null => {
  if (!pathname) return null;
  const match = pathname.match(new RegExp('^/Discovery/([^/?#]+)', 'i'));
  return match ? match[1] : null;
};

export const useStudyIdFromWindow = (): string | null => {
  return useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getStudyIdFromPath(window.location.pathname);
  }, []);
};
