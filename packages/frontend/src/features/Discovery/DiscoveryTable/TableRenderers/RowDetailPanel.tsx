import React from 'react';
import { Text } from '@mantine/core';
import HighlightSearchTerm from '../SearchHighlighting/HighlightSearchTerm';
import type { MRT_Row, MRT_RowData } from 'mantine-react-table-open';
import { get } from 'lodash';
import RowDetailPanelTags from './RowDetailPanelTags';
import { useDiscoveryContext } from '../../DiscoveryProvider';

interface RowDetailPanelProps {
  row: MRT_Row<MRT_RowData>;
  searchTerm: string;
}

const RowDetailPanel = ({ row, searchTerm }: RowDetailPanelProps) => {
  const { discoveryConfig: config } = useDiscoveryContext();
  if (config.studyPreviewField) {
    const studyPreviewData = get(row.original, config.studyPreviewField.field);
    return (
      <div className="flex flex-col w-full">
        <Text size="xs" lineClamp={2} classNames={{ root: 'max-w-[90vw]' }}>
          {HighlightSearchTerm(studyPreviewData, searchTerm)}
        </Text>

        <RowDetailPanelTags rowTags={row.original.tags} />
      </div>
    );
  } else {
    return undefined;
  }
};

export default RowDetailPanel;
