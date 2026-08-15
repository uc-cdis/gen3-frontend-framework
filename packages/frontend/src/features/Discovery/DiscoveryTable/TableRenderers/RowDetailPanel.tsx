import React from 'react';
import { Box, Text } from '@mantine/core';
import HighlightSearchTerm from '../SearchHighlighting/HighlightSearchTerm';
import { MRT_Row, MRT_RowData } from 'mantine-react-table-open';
import _ from 'lodash';
import RowDetailPanelTags from './RowDetailPanelTags';
import { useDiscoveryContext } from '../../DiscoveryProvider';

interface RowDetailPanelProps {
  row: MRT_Row<MRT_RowData>;
  searchTerm: string;
}

const RowDetailPanel = ({ row, searchTerm }: RowDetailPanelProps) => {
  const { discoveryConfig: config } = useDiscoveryContext();
  if (config.studyPreviewField) {
    const studyPreviewData = _.get(
      row.original,
      config.studyPreviewField.field,
    );
    return (
      <>
        <Box display={'flex'} w={'100%'}>
          <Text size="xs" lineClamp={2}>
            {HighlightSearchTerm(studyPreviewData, searchTerm)}
          </Text>
        </Box>
        <RowDetailPanelTags rowTags={row.original.tags} />
      </>
    );
  } else {
    return undefined;
  }
};

export default RowDetailPanel;
