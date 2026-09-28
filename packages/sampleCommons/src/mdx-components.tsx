import React from 'react';
import type { MDXComponents } from 'mdx/types';
import type { ImageProps } from 'next/image';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { withBasePath } from '@gen3/frontend';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  const { basePath } = useRouter();
  return {
    h1: ({ children }) => (
      <h1 style={{ color: 'red', fontSize: '48px' }}>{children}</h1>
    ),
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
        {...(props as ImageProps)}
        src={withBasePath(basePath, props.src)}
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
