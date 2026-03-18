import React from 'react';
import { Box, Text } from '@mantine/core';
import HighlightSearchTerm from '../SearchHighlighting/HighlightSearchTerm';
import { MRT_Row, MRT_RowData } from 'mantine-react-table';
import { DiscoveryIndexConfig } from '../../types';
import _ from 'lodash';
import RowDetailPanelTags from './RowDetailPanelTags';
import { useDiscoveryContext } from '../../DiscoveryProvider';
import { OnChangeFn } from '@tanstack/table-core';

interface RowDetailPanelProps {
  row: MRT_Row<MRT_RowData>;
  searchTerm: string;
  selectedTags: { [key: string]: boolean };
  setSelectedTags: OnChangeFn<{ [key: string]: boolean }>;
}

const RowDetailPanel = ({
  row,
  searchTerm,
  selectedTags,
  setSelectedTags,
}: RowDetailPanelProps) => {
  const { discoveryConfig: config } = useDiscoveryContext();
  if (config.studyPreviewField) {
    const studyPreviewData = _.get(
      row.original,
      config.studyPreviewField.field,
    );
    return (
      <div>
        <Box display={'flex'} w={'100%'}>
          <Text size="xs" lineClamp={2}>
            {HighlightSearchTerm(studyPreviewData, searchTerm)}
          </Text>
        </Box>
        <RowDetailPanelTags
          rowTags={row.original.tags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />
        ;
      </div>
    );
  } else {
    return undefined;
  }
};

export default RowDetailPanel;
