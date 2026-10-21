import React, { type ReactElement } from 'react';
import { Button, Text, Tooltip } from '@mantine/core';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { showsPager, type TabResult } from './search';
import { pageLabel } from './utils';

interface PagerProps {
  result: TabResult;
  // The params changed since the last Send
  stale: boolean;
  // Undefined when there's nowhere to go, so the button is disabled
  onBack?: () => void;
  onNext?: () => void;
  // Spacing lives here, so it goes away with the pager
  className?: string;
}

const Pager = ({
  result,
  stale,
  onBack,
  onNext,
  className = '',
}: PagerProps): ReactElement | null => {
  // A single page needs no pager
  if (!showsPager(result)) return null;

  const page = result.trail.length + 1;
  // While a page loads, the range would describe the old one
  const label = result.loading
    ? `Loading page ${page}…`
    : result.bundle
      ? pageLabel(
          page,
          result.offset,
          result.bundle.entry?.length ?? 0,
          result.bundle.total,
        )
      : `Page ${page} didn't load`;

  // Why a button is off, for its tooltip
  const blocked = stale
    ? 'Params changed. Press Send to search again.'
    : undefined;
  const whyNoBack = blocked ?? "You're on the first page";
  const whyNoNext =
    blocked ??
    (result.error ? "This page didn't load" : 'This is the last page');
  // The loading overlay already says why, so no tooltip then
  const quiet = result.loading;

  return (
    <div className={`flex items-center justify-end gap-3 ${className}`}>
      <Tooltip label={whyNoBack} disabled={!!onBack || quiet}>
        <span>
          <Button
            variant="default"
            size="xs"
            leftSection={<FiChevronLeft />}
            onClick={onBack}
            disabled={!onBack}
          >
            Back
          </Button>
        </span>
      </Tooltip>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Tooltip label={whyNoNext} disabled={!!onNext || quiet}>
        <span>
          <Button
            variant="default"
            size="xs"
            rightSection={<FiChevronRight />}
            onClick={onNext}
            disabled={!onNext}
          >
            Next
          </Button>
        </span>
      </Tooltip>
    </div>
  );
};

export default Pager;
