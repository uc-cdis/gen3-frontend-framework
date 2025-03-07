import React from 'react';
import type { MDXComponents } from 'mdx/types';
import Image, { ImageProps } from 'next/image';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 style={{ color: 'red', fontSize: '48px' }}>{children}</h1>
    ),
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
        {...(props as ImageProps)}
      />
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside">{children}</ol>
    ),
    il: ({ children }) => (
      <ol className="list-decimal list-inside">{children}</ol>
    ),
    ...components,
  };
}
