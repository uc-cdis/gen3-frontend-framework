export const pageFromURL = (currentURL: string): string => {
  const paths = currentURL
    .split('/')
    .filter((x) => x !== 'dev.html' && x !== '');
  return paths[paths.length - 1];
};

export const isUserOnPage = (pageName: string, pathname: string): boolean => {
  return pathname.toLowerCase().includes(pageName.toLowerCase());
};
