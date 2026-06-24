import type { ReactNode } from 'react';
import React from 'react';
import { ActionIcon, Text } from '@mantine/core';
import { Icon } from '@iconify-icon/react';
import {
  PanelHeaderTextStyle,
  PanelStyle,
} from '../workspace/WorkspaceLayout/styling';

const TRANSITION_MS = 250;

type HorizontalAccordionProps = {
  label: ReactNode;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  children: ReactNode;
  rightSide?: boolean;
  expandedWidth?: number | string;
  collapsedWidth?: number | string;
};

export function HorizontalAccordion({
  label,
  expanded,
  setExpanded,
  children,
  expandedWidth = 300,
  collapsedWidth = 36,
  rightSide = false,
}: HorizontalAccordionProps) {
  const closeIcon = rightSide ? (
    <Icon icon="gen3:left-panel-close" width={32} height={32} />
  ) : (
    <Icon icon="gen3:left-panel-open" width={32} height={32} />
  );

  const openIcon = rightSide ? (
    <Icon icon="gen3:left-panel-open" width={32} height={32} />
  ) : (
    <Icon icon="gen3:left-panel-close" width={32} height={32} />
  );

  return (
    <div
      className={`overflow-hidden shrink-0 ${PanelStyle}`}
      style={{
        width: expanded ? expandedWidth : collapsedWidth,
        transition: `width ${TRANSITION_MS}ms ease`,
      }}
    >
      <div className="flex flex-col no-wrap">
        <div className="flex items-center justify-between px-1 py-1 border-b-2 border-base-lighter bg-base-max">
          <Text
            fw={600}
            size="sm"
            className={`overflow-hidden text-nowrap ${PanelHeaderTextStyle}`}
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
          >
            {expanded ? openIcon : closeIcon}
          </ActionIcon>
        </div>

        <div
          className="overflow-hidden shrink-0"
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
