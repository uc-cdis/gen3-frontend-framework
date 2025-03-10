import React from 'react';
import { useReducedMotion } from '@mantine/hooks';
import {
  Box,
  BoxProps,
  Factory,
  factory,
  getStyleObject,
  useMantineTheme,
  useProps,
} from '@mantine/core';
import { useCollapsableSidebar } from './use-collapsable-sidebar';

export interface CollapsableSidebarProps
  extends BoxProps,
    Omit<React.ComponentPropsWithoutRef<'div'>, keyof BoxProps> {
  /** Opened state */
  in: boolean;

  /** Called each time transition ends */
  onTransitionEnd?: () => void;

  /** Transition duration in ms, `200` by default */
  transitionDuration?: number;

  /** Transition timing function, default value is `ease` */
  transitionTimingFunction?: string;

  /** Determines whether opacity should be animated, `true` by default */
  animateOpacity?: boolean;
}

export type CollapseSidebarFactory = Factory<{
  props: CollapsableSidebarProps;
  ref: HTMLDivElement;
}>;

const defaultProps: Partial<CollapsableSidebarProps> = {
  transitionDuration: 200,
  transitionTimingFunction: 'ease',
  animateOpacity: true,
};

export const CollapsableSidebar = factory<CollapseSidebarFactory>(
  (props, ref) => {
    const {
      children,
      in: opened,
      transitionDuration,
      transitionTimingFunction,
      style,
      onTransitionEnd,
      animateOpacity,
      ...others
    } = useProps('Collapse', defaultProps, props);

    const theme = useMantineTheme();
    const shouldReduceMotion = useReducedMotion();
    const reduceMotion = theme.respectReducedMotion
      ? shouldReduceMotion
      : false;
    const duration = reduceMotion ? 0 : transitionDuration;

    const getCollapseProps = useCollapsableSidebar({
      opened,
      transitionDuration: duration,
      transitionTimingFunction,
      onTransitionEnd,
    });

    if (duration === 0) {
      return opened ? <Box {...others}>{children}</Box> : null;
    }

    return (
      <Box
        {...getCollapseProps({
          style: {
            opacity: opened || !animateOpacity ? 1 : 0,
            transition: animateOpacity
              ? `opacity ${duration}ms ${transitionTimingFunction}`
              : 'none',
            ...getStyleObject(style, theme),
          },
          ref,
          ...others,
        })}
      >
        {children}
      </Box>
    );
  },
);

CollapsableSidebar.displayName = '@gen3/frontend/CollapsableSidebar';
