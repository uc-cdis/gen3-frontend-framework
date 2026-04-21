import { useMemo } from 'react';

export const getStudyIdFromPath = (pathname = '') => {
  if (!pathname) return null;
  const match = pathname.match(/^\/Discovery\/([^\/?#]+)/i);
  return match ? match[1] : null;
};

export const useStudyIdFromWindow = () =>
  useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getStudyIdFromPath(window.location.pathname);
  }, []);
