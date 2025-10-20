import { createContext } from 'react';

// Provides the bottom X position so components can align themselves with the table

function emptyFn() {}

export const TableXPositionContext = createContext<{
  xPosition?: number;
  setXPosition: (xPosition: number) => void;
}>({ xPosition: undefined, setXPosition: emptyFn });
