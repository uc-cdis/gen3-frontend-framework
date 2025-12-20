import { FileItem } from '@gen3/core';

export type CartFile = FileItem;

export interface CartSummary {
  totalSize: number;
  totalFiles: number;
  fileTypes: string[];
}

export type CartSummaryFunction = (files: CartFile[]) => CartSummary;

export const EmptyCartSummary: CartSummary = {
  totalSize: 0,
  totalFiles: 0,
  fileTypes: [],
};
