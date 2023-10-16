import React, { forwardRef } from 'react';
import { useReducedMotion } from '@mantine/hooks';
import {
  DefaultProps,
  useComponentDefaultProps,
  useMantineTheme,
} from '@mantine/styles';
import { Box, extractSystemStyles } from '@mantine/core';
import { useCollapsableSidebar } from './use-collapsable-sidebar';

export interface CollapsableSidebarProps
  extends DefaultProps,
    React.ComponentPropsWithoutRef<'div'> {
  /** Content that should be collapsed */
  children: React.ReactNode;

  /** Opened state */
  in: boolean;

  /** Called each time transition ends */
  onTransitionEnd?: () => void;

  /** Transition duration in ms */
  transitionDuration?: number;

  /** Transition timing function */
  transitionTimingFunction?: string;

  /** Should opacity be animated */
  animateOpacity?: boolean;
}

const defaultProps: Partial<CollapsableSidebarProps> = {
  transitionDuration: undefined,
  transitionTimingFunction: 'ease',
  animateOpacity: true,
};

export const CollapsableSidebar = forwardRef<
  HTMLDivElement,
  CollapsableSidebarProps
>((props, ref) => {
  const {
    children,
    in: opened,
    transitionDuration,
    transitionTimingFunction,
    style,
    onTransitionEnd,
    animateOpacity,
    ...others
  } = useComponentDefaultProps('CollapsableSidebar', defaultProps, props);
  const theme = useMantineTheme();

  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = theme.respectReducedMotion ? shouldReduceMotion : false;

  const duration = reduceMotion ? 0 : transitionDuration;
  const { systemStyles, rest } = extractSystemStyles(others);
  const getCollapsableSidebarProps = useCollapsableSidebar({
    opened,
    transitionDuration: duration,
    transitionTimingFunction,
    onTransitionEnd,
  });

  if (duration === 0) {
    return opened ? <Box {...rest}>{children}</Box> : null;
  }

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <Box
      {...getCollapsableSidebarProps({ style, ref, ...rest, ...systemStyles })}
    >
      <div
        style={{
          opacity: opened || !animateOpacity ? 1 : 0,
          transition: animateOpacity
            ? `opacity ${duration}ms ${transitionTimingFunction}`
            : 'none',
        }}
      >
        {children}
      </div>
    </Box>
  );
});

CollapsableSidebar.displayName = '@gen3/frontend/CollapsableSidebar';
