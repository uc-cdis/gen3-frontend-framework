import type { ReactNode } from 'react';
import React from 'react';
import { ActionIcon, Text } from '@mantine/core';
import { Icon } from '@iconify-icon/react';
import {
  PanelHeaderTextStyle,
  PanelStyle,
} from '../workspace/WorkspaceLayout/styling';
import {
  mergeDefaultTailwindClassnames,
  StylingOverrideWithMergeControl,
} from '@gen3/frontend';

const TRANSITION_MS = 250;
const ICON_SIZE = 24;

const STYLING_DEFAULTS = {
  root: PanelStyle,
  header: PanelHeaderTextStyle,
  label: PanelHeaderTextStyle,
};

type HorizontalAccordionProps = {
  label: ReactNode;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  children: ReactNode;
  rightSide?: boolean;
  expandedWidth?: number | string;
  collapsedWidth?: number | string;
  classNames?: StylingOverrideWithMergeControl;
};

export function HorizontalAccordion({
  label,
  expanded,
  setExpanded,
  children,
  expandedWidth = 300,
  collapsedWidth = 36,
  rightSide = false,
  classNames = {},
}: HorizontalAccordionProps) {
  const closeIcon = rightSide ? (
    <Icon icon="gen3:sidebar-close" width={ICON_SIZE} height={ICON_SIZE} />
  ) : (
    <Icon icon="gen3:sidebar-open" width={ICON_SIZE} height={ICON_SIZE} />
  );

  const openIcon = rightSide ? (
    <Icon icon="gen3:sidebar-open" width={ICON_SIZE} height={ICON_SIZE} />
  ) : (
    <Icon icon="gen3:sidebar-close" width={ICON_SIZE} height={ICON_SIZE} />
  );

  const mergedClassNames = mergeDefaultTailwindClassnames(
    STYLING_DEFAULTS,
    classNames,
  );

  return (
    <div
      className={`overflow-hidden shrink-0 ${mergedClassNames.root}`}
      style={{
        width: expanded ? expandedWidth : collapsedWidth,
        transition: `width ${TRANSITION_MS}ms ease`,
      }}
    >
      <div className="flex flex-col no-wrap">
        <div className="flex items-center justify-between px-1 py-1 bg-base-max">
          <Text
            fw={600}
            size="sm"
            className={`overflow-hidden text-nowrap ${mergedClassNames.label}`}
            style={{
              opacity: expanded ? 1 : 0,
              transition: `opacity transform ${TRANSITION_MS}ms ease`,
              transform: expanded ? 'translateX(0.625rem)' : 'translateX(0)',
            }}
          >
            {label}
          </Text>

          <ActionIcon
            variant="subtle"
            aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
            onClick={() => setExpanded(!expanded)}
            radius="xs"
          >
            {expanded ? openIcon : closeIcon}
          </ActionIcon>
        </div>

        <div
          className="overflow-hidden shrink-0 px-2"
          style={{
            opacity: expanded ? 1 : 0,
            pointerEvents: expanded ? 'auto' : 'none',
            transition: `opacity ${TRANSITION_MS}ms ease`,
            width: expandedWidth,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default HorizontalAccordion;
