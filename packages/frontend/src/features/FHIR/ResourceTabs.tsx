import React, { type ReactElement } from 'react';
import { Paper, Tabs, Tooltip } from '@mantine/core';
import { RESOURCE_TABS } from './constants';

interface ResourceTabsProps {
  value: string;
  onChange: (resource: string) => void;
  // Types the server's /metadata doesn't list
  unsupported: string[];
}

const ResourceTabs = ({
  value,
  onChange,
  unsupported,
}: ResourceTabsProps): ReactElement => (
  <Paper withBorder radius="md" shadow="xs" p={4}>
    <Tabs
      value={value}
      onChange={(next) => next && onChange(next)}
      variant="pills"
      radius="md"
      classNames={{
        tab: 'border border-transparent px-5 py-2 text-base font-semibold text-gray-600 data-[active=true]:!border-blue-200 data-[active=true]:!bg-blue-50 data-[active=true]:!text-blue-700',
      }}
    >
      <Tabs.List>
        {RESOURCE_TABS.map((type) =>
          unsupported.includes(type) ? (
            <Tooltip key={type} label="This server doesn't support this type">
              <span>
                <Tabs.Tab value={type} disabled>
                  {type}
                </Tabs.Tab>
              </span>
            </Tooltip>
          ) : (
            <Tabs.Tab key={type} value={type}>
              {type}
            </Tabs.Tab>
          ),
        )}
      </Tabs.List>
    </Tabs>
  </Paper>
);

export default ResourceTabs;
