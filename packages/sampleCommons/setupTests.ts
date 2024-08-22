import '@testing-library/jest-dom';

(() => {
  const originalConsole = global.console;

  global.console = {
    ...global.console,

    error: (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('React does not recognize the') &&
        args[0].includes('prop on a DOM element')
      ) {
        return true;
      }

      // Show the original error for everything else
      originalConsole.error(...args);
    },
  };
})();

export {};
