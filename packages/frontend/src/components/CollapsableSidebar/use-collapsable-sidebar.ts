import React, { useState, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useDidUpdate, mergeRefs } from '@mantine/hooks';

function getAutoWidthDuration(width: number | string) {
  if (!width || typeof width === 'string') {
    return 0;
  }
  const constant = width / 36;
  return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10);
}

export function getElementWidth(
  el: React.RefObject<HTMLElement> | { current?: { scrollWidth: number } },
) {
  return el?.current ? el.current.scrollWidth : 'auto';
}

const raf = typeof window !== 'undefined' && window.requestAnimationFrame;

interface UseCollapse {
  opened: boolean;
  transitionDuration?: number;
  transitionTimingFunction?: string;
  onTransitionEnd?: () => void;
}

interface GetCollapseProps {
  [key: string]: unknown;
  style?: React.CSSProperties;
  onTransitionEnd?: (e: TransitionEvent) => void;
  refKey?: string;
  ref? : React.ForwardedRef<HTMLDivElement>;
}

export function useCollapsableSidebar({
  transitionDuration,
  transitionTimingFunction = 'ease',
  onTransitionEnd = () => Object,
  opened,
}: UseCollapse): (props: GetCollapseProps) => Record<string, any> {
  const el = useRef<HTMLElement | null>(null);
  const collapsedWidth = 0;
  const collapsedStyles = {
    display: 'none',
    width: 0,
    overflow: 'hidden',
  };
  const [styles, setStylesRaw] = useState<React.CSSProperties>(
    opened ? {} : collapsedStyles,
  );
  const setStyles = (
    newStyles: object | ((oldStyles: object) => object),
  ): void => {
    flushSync(() => setStylesRaw(newStyles));
  };

  const mergeStyles = (newStyles: object): void => {
    setStyles((oldStyles) => ({ ...oldStyles, ...newStyles }));
  };

  function getTransitionStyles(width: number | string): {
    transition: string;
  } {
    const _duration = transitionDuration || getAutoWidthDuration(width);
    return {
      transition: `width ${_duration}ms ${transitionTimingFunction}`,
    };
  }

  useDidUpdate(() => {
    if (opened) {
      raf &&
        raf(() => {
          mergeStyles({
            willChange: 'width',
            display: 'block',
            overflow: 'hidden',
          });
          raf(() => {
            const width = getElementWidth(el);
            mergeStyles({ ...getTransitionStyles(width), width });
          });
        });
    } else {
      raf &&
        raf(() => {
          const width = getElementWidth(el);
          mergeStyles({
            ...getTransitionStyles(width),
            willChange: 'width',
            width,
          });
          raf(() => mergeStyles({ width: collapsedWidth, overflow: 'hidden' }));
        });
    }
  }, [opened]);

  const handleTransitionEnd = (e: React.TransitionEvent): void => {
    if (e.target !== el.current || e.propertyName !== 'width') {
      return;
    }

    if (opened) {
      const width = getElementWidth(el);

      if (width === styles.width) {
        setStyles({});
      } else {
        mergeStyles({ width });
      }

      onTransitionEnd();
    } else if (styles.width === collapsedWidth) {
      setStyles(collapsedStyles);
      onTransitionEnd();
    }
  };

  function getCollapseProps({
    style = {},
    refKey = 'ref',
    ...rest
  }: GetCollapseProps = {}) {
    const theirRef: any = rest[refKey];
    return {
      'aria-hidden': !opened,
      ...rest,
      [refKey]: mergeRefs(el, theirRef),
      onTransitionEnd: handleTransitionEnd,
      style: { boxSizing: 'border-box', ...style, ...styles },
    };
  }

  return getCollapseProps;
}
